const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Configure nodemailer transporter
// This will use environment variables for email configuration
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Gmail address
      pass: process.env.EMAIL_PASS  // Gmail app password
    }
  });
};

// Submit a report
router.post('/', async (req, res) => {
  try {
    const { type, id, reason, details } = req.body;
    
    // Validate required fields
    if (!type || !id || !reason) {
      return res.status(400).json({ 
        message: 'Missing required fields: type, id, and reason are required' 
      });
    }
    
    // Validate type
    if (!['question', 'answer'].includes(type)) {
      return res.status(400).json({ 
        message: 'Invalid type. Must be either "question" or "answer"' 
      });
    }
    
    // Create email content
    const emailSubject = `Content Report - ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    const emailBody = `
      A new content report has been submitted:
      
      Type: ${type}
      ID: ${id}
      Reason: ${reason}
      Additional Details: ${details || 'None provided'}
      
      Please review this content for appropriate action.
      
      Timestamp: ${new Date().toISOString()}
    `;
    
    // Create transporter and send email
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'mdchild21@gmail.com',
      subject: emailSubject,
      text: emailBody
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    res.json({ 
      message: 'Report submitted successfully. Thank you for helping keep our community safe.' 
    });
    
  } catch (err) {
    console.error('Report submission error:', err);
    
    // Check if it's an email configuration error
    if (err.code === 'EAUTH' || err.code === 'ENOTFOUND') {
      res.status(500).json({ 
        message: 'Email service temporarily unavailable. Please try again later.' 
      });
    } else {
      res.status(500).json({ 
        message: 'Failed to submit report. Please try again later.' 
      });
    }
  }
});

module.exports = router;