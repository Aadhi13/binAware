const { createTransport } = require("nodemailer");
require('dotenv').config();

const transporter = createTransport({
    service: "gmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.GOOGLE_APP_PASSWORD,
    },
});

const sendVerificationMail = async (name, email, otp) => {
    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "Verification OTP for binAware",
        html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                    <div style="margin:50px auto;width:70%;padding:20px 0">
                        <div style="border-bottom:1px solid #eee">
                            <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">binAware</a>
                        </div>
                        <p style="font-size:1.1em">Hi, <b>${name}</b></p>
                        <p>Thank you for choosing binAware. Use the following OTP to complete your registration procedures. OTP is valid for 10 minutes.</p>
                        <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;border: solid 2px black">${otp}</h2>
                        <p style="font-size:0.9em;">Regards,<br />binAware</p>
                        <hr style="border:none;border-top:1px solid #eee" />
                        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                            <p>binAware Ltd</p>
                            <p>1600 Amphitheatre Parkway</p>
                            <p>California</p>
                        </div>
                    </div>
                </div>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${email}`);
    } catch (error) {
        console.error("Error sending verification email:", error);
        // Don't throw error to prevent crashing the registration flow, 
        // but in real app you might want to handle this differently.
    }
};

const sendWelcomeMail = async (name, email) => {
    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: `👋 Welcome to binAware, ${name}!`,
        html: `<div style="font-family: Helvetica, Arial, sans-serif; line-height: 1.8; color: #222; max-width: 620px; margin: auto; padding: 20px;">
            <h2 style="color: #0a4b78;">Welcome to binAware 🎉</h2>

            <p>Hi <b>${name}</b>,</p>

            <p>Thank you for joining <b>binAware</b>. Your account has been created
              successfully and you're now close to getting full access to the app.
            </p>

            <p><b>Next step:</b></p>

            <p>If your email is not yet verified, please complete email verification to activate your account:</p>

            <div style="text-align: center; font-size: 1.2em; font-weight: 600;">
            <a href="" style="display: inline-block; padding: 12px 20px; background: #0a4b78; color: #fff; text-decoration: none; border-radius: 6px; margin-top: 8px;">
            Verify Email
            </a>
            </div>

            <p style="margin-top: 20px;">
              If your email is already verified, you can log in and start using binAware right away:
            </p>
            <div style="text-align: center; font-size: 1.2em; font-weight: 600;">
              <a href="" style="display: inline-block; padding: 12px 20px; background: #0a4b78; color: #fff; text-decoration: none; border-radius: 6px; margin-top: 8px;">
                Login to binAware
              </a>
            </div>

            <p style="margin-top: 25px;">
              If you didn’t sign up for binAware, you can safely ignore this message.
            </p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 35px 0;" />

            <p style="font-size: 13px; color: #666;">
              binAware<br />
              When bins are ignored, voices shouldn't be
            </p>
           </div>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to ${email}`);
    } catch (error) {
        console.error("Error sending welcome email:", error);
    }
};

module.exports = {
    verificationMail: sendVerificationMail,
    welcomeMail: sendWelcomeMail
};
