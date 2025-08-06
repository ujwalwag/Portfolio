const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // Serve static files from the root

// Configure your email transporter (replace with your own details)
const transporter = nodemailer.createTransport({
    service: 'gmail', // Or another email service
    auth: {
        user: 'your_email@gmail.com', // Your email address
        pass: 'your_app_password' // Your app password (not your regular password)
    }
});

// A POST endpoint to handle the resume download request
app.post('/download-resume', (req, res) => {
    const { email, industry } = req.body;
    let resumePath;

    // Log the user's email and industry
    console.log(`New resume download request: Email - ${email}, Industry - ${industry}`);

    // Determine which resume to send based on the industry
    if (industry === 'robotics') {
        resumePath = '/assets/UJWAL WAGHRAY - Robotics.docx';
    } else if (industry === 'software') {
        resumePath = '/assets/UJWAL WAGHRAY - Software.docx';
    } else {
        resumePath = '/assets/UJWAL WAGHRAY - General.docx';
    }

    // Prepare and send the email to yourself
    const mailOptions = {
        from: 'waghray.ujwal@gmail.com',
        to: 'waghray.ujwal@gmail.com', // Send the notification to yourself
        subject: `New Resume Download from Website`,
        text: `Someone just downloaded your resume.\n\nEmail: ${email}\nIndustry: ${industry}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    // Send the correct resume path back to the client
    res.json({ success: true, resumeUrl: resumePath });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});