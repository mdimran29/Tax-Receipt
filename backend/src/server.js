require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const OpenLawService = require('./services/OpenLawService');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('receipts'));

// Initialize OpenLaw service
const openLawService = new OpenLawService(
  process.env.OPENLAW_BASE_URL,
  process.env.OPENLAW_EMAIL,
  process.env.OPENLAW_PASSWORD
);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Tax Receipt Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Generate message to sign endpoint
app.post('/api/receipt/message', (req, res) => {
  try {
    console.log('Generating message to sign for:', req.body);
    
    const receiptData = {
      receiptId: req.body.receiptId || `PETITION-${Date.now()}`,
      walletAddress: req.body.walletAddress,
      txHash: req.body.txHash,
      rewardsETH: req.body.rewardsETH,
      creditedValueUSD: req.body.creditedValueUSD || (req.body.rewardsETH * req.body.highestPriceUSD),
      timestamp: req.body.timestamp || new Date().toISOString()
    };
    
    const message = openLawService.createSignMessage(receiptData);
    
    res.json({
      success: true,
      message,
      receiptId: receiptData.receiptId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error generating message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate signing message',
      error: error.message
    });
  }
});

// Upload template endpoint (for setup)
app.post('/api/template/upload', async (req, res) => {
  try {
    const templatePath = path.join(__dirname, 'templates', 'TaxReceiptTemplate.openlaw');
    const templateContent = await fs.readFile(templatePath, 'utf8');
    
    const result = await openLawService.uploadTemplate(
      process.env.TEMPLATE_NAME || 'TaxReceiptTemplate',
      templateContent
    );
    
    res.json({
      success: true,
      message: 'Template uploaded successfully',
      data: result
    });
  } catch (error) {
    console.error('Template upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload template',
      error: error.message
    });
  }
});

// Generate signed tax receipt endpoint
app.post('/api/receipt/signed', async (req, res) => {
  try {
    console.log('=== SIGNED TAX RECEIPT GENERATION REQUEST ===');
    console.log('Received signed receipt request:', JSON.stringify(req.body, null, 2));
    
    const receiptData = req.body;
    
    // Validate required fields
    const requiredFields = ['walletAddress', 'txHash', 'rewardsETH', 'highestPriceUSD', 'signature', 'message'];
    const missingFields = requiredFields.filter(field => !receiptData[field]);
    
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return res.status(400).json({
        success: false,
        message: 'Missing required receipt data fields',
        missingFields
      });
    }

    // Extract signature data from receiptData
    const signatureData = {
      signature: receiptData.signature,
      message: receiptData.message,
      signer: receiptData.walletAddress,
      timestamp: new Date().toISOString()
    };

    // Validate signature data
    if (!signatureData.signature || !signatureData.message) {
      return res.status(400).json({
        success: false,
        message: 'Missing signature data. Receipt must be signed with MetaMask.'
      });
    }

    // Format parameters for OpenLaw
    const parameters = openLawService.formatParameters({
      ...receiptData,
      signature: signatureData.signature,
      signerAddress: signatureData.signer,
      signatureTimestamp: signatureData.timestamp
    });
    
    console.log('Creating signed execution...');
    
    // Create signed execution
    const execution = await openLawService.createSignedExecution(
      process.env.TEMPLATE_NAME || 'TaxReceiptTemplate',
      parameters,
      signatureData
    );
    
    console.log('Signed execution created:', execution);
    
    // Generate PDF with signature verification
    const executionId = execution.id || execution.executionId || ('signed-' + Date.now());
    console.log('Generating signed PDF for execution ID:', executionId);
    
    const pdfBuffer = await openLawService.generatePDF(executionId);
    
    // Save PDF with signed prefix
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `signed-tax-receipt-${timestamp}-${executionId.slice(0, 8)}.pdf`;
    
    console.log('Saving signed PDF as:', filename);
    await openLawService.savePDF(pdfBuffer, filename);
    
    console.log(`✅ Signed tax receipt generated successfully: ${filename}`);
    
    res.json({
      success: true,
      executionId,
      filename,
      downloadUrl: `/api/download/${filename}`,
      message: 'Signed tax receipt generated successfully',
      isSigned: true,
      legalStatus: execution.legalStatus || 'LEGALLY_EXECUTED',
      signatureVerified: true,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Signed receipt generation error:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate signed tax receipt',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Generate signed tax receipt endpoint
app.post('/api/receipt/signed', async (req, res) => {
  try {
    console.log('=== SIGNED TAX RECEIPT GENERATION REQUEST ===');
    console.log('Received signed receipt request:', JSON.stringify(req.body, null, 2));
    
    const { signature, message, ...receiptData } = req.body;
    
    // Validate required fields
    const requiredFields = ['walletAddress', 'txHash', 'rewardsETH', 'highestPriceUSD', 'signature', 'message'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return res.status(400).json({
        success: false,
        message: 'Missing required fields for signed receipt',
        missingFields
      });
    }

    // Verify the signature
    const isSignatureValid = openLawService.verifySignature(message, signature, receiptData.walletAddress);
    
    if (!isSignatureValid) {
      console.log('Invalid signature detected');
      return res.status(401).json({
        success: false,
        message: 'Invalid MetaMask signature. Please sign again.',
        error: 'INVALID_SIGNATURE'
      });
    }

    console.log('✅ Signature verified successfully');

    // Add signature information to receipt data
    receiptData.signature = signature;
    receiptData.signatureMessage = message;
    receiptData.signatureTimestamp = new Date().toISOString();
    receiptData.isLegal = true; // Mark as legally binding
    
    // Format parameters for OpenLaw
    const parameters = openLawService.formatParameters(receiptData);
    console.log('Formatted signed parameters:', JSON.stringify(parameters, null, 2));
    
    // Create execution with signature verification
    console.log('Creating signed execution...');
    const execution = await openLawService.createExecution(
      process.env.TEMPLATE_NAME || 'TaxReceiptTemplate',
      parameters
    );
    
    console.log('Signed execution created:', execution);
    
    // Generate PDF with signature info
    const executionId = execution.id || execution.executionId || uuidv4();
    console.log('Generating signed PDF for execution ID:', executionId);
    
    const pdfBuffer = await openLawService.generatePDF(executionId);
    
    // Save PDF with signature indicator
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `petition-tax-receipt-SIGNED-${timestamp}-${executionId.slice(0, 8)}.pdf`;
    
    console.log('Saving signed PDF as:', filename);
    await openLawService.savePDF(pdfBuffer, filename);
    
    console.log(`✅ Signed tax receipt generated successfully: ${filename}`);
    
    res.json({
      success: true,
      executionId,
      filename,
      downloadUrl: `/api/download/${filename}`,
      message: 'Signed tax receipt generated successfully',
      isLegal: true,
      signatureVerified: true,
      receiptId: parameters.ReceiptId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Signed receipt generation error:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate signed tax receipt',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Generate tax receipt endpoint (unsigned/demo)
app.post('/api/receipt', async (req, res) => {
  try {
    console.log('=== TAX RECEIPT GENERATION REQUEST ===');
    console.log('Received receipt request:', JSON.stringify(req.body, null, 2));
    
    // Validate required fields
    const requiredFields = ['walletAddress', 'txHash', 'rewardsETH', 'highestPriceUSD'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields
      });
    }

    // Format parameters for OpenLaw
    const parameters = openLawService.formatParameters(req.body);
    console.log('Formatted parameters:', JSON.stringify(parameters, null, 2));
    
    // Create execution
    console.log('Creating execution...');
    const execution = await openLawService.createExecution(
      process.env.TEMPLATE_NAME || 'TaxReceiptTemplate',
      parameters
    );
    
    console.log('Execution created:', execution);
    
    // Generate PDF
    const executionId = execution.id || execution.executionId || uuidv4();
    console.log('Generating PDF for execution ID:', executionId);
    
    const pdfBuffer = await openLawService.generatePDF(executionId);
    
    // Save PDF with unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `tax-receipt-${timestamp}-${executionId.slice(0, 8)}.pdf`;
    
    console.log('Saving PDF as:', filename);
    await openLawService.savePDF(pdfBuffer, filename);
    
    console.log(`✅ Tax receipt generated successfully: ${filename}`);
    
    res.json({
      success: true,
      executionId,
      filename,
      downloadUrl: `/api/download/${filename}`,
      message: 'Tax receipt generated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Receipt generation error:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate tax receipt',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Download PDF endpoint
app.get('/api/download/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(__dirname, '../receipts', filename);
    
    if (await fs.pathExists(filepath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.sendFile(path.resolve(filepath));
    } else {
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download file',
      error: error.message
    });
  }
});

// List receipts endpoint
app.get('/api/receipts', async (req, res) => {
  try {
    const receiptsDir = path.join(__dirname, '../receipts');
    await fs.ensureDir(receiptsDir);
    
    const files = await fs.readdir(receiptsDir);
    const pdfFiles = files.filter(file => file.endsWith('.pdf'));
    
    const receipts = await Promise.all(
      pdfFiles.map(async (file) => {
        const filepath = path.join(receiptsDir, file);
        const stats = await fs.stat(filepath);
        return {
          filename: file,
          size: stats.size,
          created: stats.birthtime,
          downloadUrl: `/api/download/${file}`
        };
      })
    );
    
    res.json({
      success: true,
      receipts: receipts.sort((a, b) => new Date(b.created) - new Date(a.created))
    });
  } catch (error) {
    console.error('List receipts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list receipts',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Tax Receipt Backend running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📄 API endpoint: http://localhost:${PORT}/api/receipt`);
});

module.exports = app;
