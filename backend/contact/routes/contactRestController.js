const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

router.post('/', async (req, res) => {
    const { name, email, message } = req.body;

    // Validate input
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // Configure your SMTP transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'roni.mark@gmail.com',
            pass: GMAIL_APP_PASSWORD,
        },
    });

    const mailOptions = {
        from: email,
        to: 'roni.mark@gmail.com',
        subject: `Contact Form Submission from ${name}`,
        text: message,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send email.' });
    }
});

module.exports = router;