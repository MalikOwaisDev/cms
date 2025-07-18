const userModel = require("../models/User");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, email, password, role } = req.body;
  const lowerEmail = email.toLowerCase();
  const exists = await userModel.findOne({ email: lowerEmail });
  if (exists)
    return res.status(400).json({ message: "Email already registered" });

  let dataUrl = "";

  if (req.file) {
    const base64Image = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype;
    dataUrl = `data:${mimeType};base64,${base64Image}`;
  }
  console.log(dataUrl);
  const user = await userModel.create({
    name,
    email: lowerEmail,
    password,
    role,
    avatar: dataUrl,
  });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
  res.cookie("token", token);
  res.status(201).json({ token, user });
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  const lowerEmail = email.toLowerCase();

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide email and password" });
  }

  const user = await userModel.findOne({ email: lowerEmail });
  if (!user) {
    return res.status(401).json({ message: "Email not found" });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid Password" });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  res.status(200).json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

exports.getMe = async (req, res) => {
  const user = await userModel.findById(req.user.id).select("-password");
  res.status(200).json(user);
};

exports.update = async (req, res) => {
  const data = req.body;
  let dataUrl = req.user.avatar; // default to existing avatar

  // ✅ Check if a file is uploaded
  if (req.file) {
    const base64Image = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype;
    dataUrl = `data:${mimeType};base64,${base64Image}`;
  }

  // ✅ Update user
  const updatedData = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      ...data,
      avatar: dataUrl, // either new one or existing
    },
    { new: true }
  );

  res.json({
    message: { success: "User updated successfully" },
    updatedData,
  });
};

const otpStore = new Map();

exports.sendOtp = async (req, res) => {
  const { email, name } = req.body;
  const lowerEmail = email.toLowerCase();
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  const user = await userModel.findOne({ email: lowerEmail });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    secure: true,
    port: 465, // ✅ Use secure port for Hostinger
    service: "hostinger",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // App password from Hostinger
    },
    tls: {
      rejectUnauthorized: false, // ✅ Allow self-signed certs
    },
  });

  async function sendOtpEmail(toEmail, name, otp) {
    const mailOptions = {
      from: `"MindfulTrust Care & Services" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `Your OTP Code is ${otp}`,
      text: `Your OTP code is: ${otp}`,
      html: `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <title>Welcome to MindfulTrust!</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #111330; }
        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }
        @media screen and (max-width: 600px) {
            .hero {
                font-size: 26px !important;
                line-height: 34px !important;
            }
        }
            .hover-link {
                color: #FE4880 !important;
                font-weight: 700 !important;}
            .hover-link:hover{
                color: #ffffff !important;}
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #111330;">
    <!-- Preheader text for email clients -->
    <div style="display: none; max-height: 0; overflow: hidden;">
        Welcome to MindfulTrust! Here is your verification code.
    </div>

    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td align="center" style="padding: 20px 10px;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                    <!-- Logo Section -->
                    <tr>
                        <td align="center" style="padding: 20px 0 30px 0;">
                            <!-- IMPORTANT: Replace with the absolute URL to your light/white logo image for dark backgrounds. -->
                            <img src="https://mindfultrust.co.uk/wp-content/uploads/2025/06/logo2.png" alt="MindfulTrust Logo" width="180" style="display:block;">
                        </td>
                    </tr>
                    <!-- Main Card -->
                    <tr>
                        <td bgcolor="#1D2056" style="border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <!-- Main Content -->
                                <tr>
                                    <td style="padding: 40px 30px;">
                                        <h1 class="hero" style="margin: 0; font-family: 'Inter', Arial, sans-serif; font-size: 28px; font-weight: 700; color: #FFFFFF; line-height: 36px;">
                                            Welcome!
                                        </h1>
                                        <p style="margin: 20px 0 0; font-family: 'Inter', Arial, sans-serif; font-size: 16px; line-height: 24px; color: #c7c7c7;">
                                            Hi ${name}, we're thrilled to have you join the MindfulTrust community. To secure your account, please verify your email address with the code below.
                                        </p>

                                        <!-- OTP Code Box -->
                                        <div style="margin: 30px 0;">
                                            <p style="margin: 0; font-family: 'Inter', Arial, sans-serif; font-size: 14px; color: #c7c7c7; text-align: center;">Your verification code is:</p>
                                            <div style="background-color: #2a2d6e; border-radius: 8px; padding: 15px 20px; text-align: center; margin-top: 10px;">
                                                <p style="margin: 0; font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: bold; color: #FFFFFF; letter-spacing: 10px;">
                                                    <!-- Your 6-Digit OTP Goes Here -->
                                                    ${otp}
                                                </p>
                                            </div>
                                        </div>

                                        <p style="margin: 0; font-family: 'Inter', Arial, sans-serif; font-size: 14px; line-height: 22px; color: #c7c7c7;">
                                            This code will expire in 10 minutes. If you didn't create an account, you can safely ignore this email.
                                        </p>
                                    </td>
                                </tr>
                                <!-- Footer Section -->
                                <tr>
                                    <td style="padding: 30px 30px; border-top: 1px solid #2a2d6e;">
                                        <p style="margin: 0; font-family: 'Inter', Arial, sans-serif; font-size: 12px; line-height: 18px; color: #888aaa; text-align: center;">
                                           &copy; 2025 <a class="hover-link" href="https://mindfultrust.co.uk/" target="_blank">MindfulTrust Care & Services</a>. All Rights Reserved. <br>
                                            CeeGee House Firstfloor College Road Harrow Weald HA3 4EF
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`,
    };

    try {
      let info = await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  }

  const now = Date.now();
  const record = otpStore.get(email);

  // Cooldown check
  if (record && record.cooldownUntil && now < record.cooldownUntil) {
    const wait = Math.ceil((record.cooldownUntil - now) / 1000);
    return res
      .status(429)
      .json({ message: `Wait ${wait}s before resending OTP.` });
  }

  const otp = generateOTP();
  const expiresAt = now + 5 * 60 * 1000; // OTP valid for 5 mins
  const cooldownUntil = now + 60 * 1000; // 60-second resend cooldown

  const sent = await sendOtpEmail(email, name, otp);
  if (!sent) {
    return res.status(500).json({ message: "Failed to send OTP" });
  }
  otpStore.set(email, {
    code: otp,
    expiresAt,
    attempts: 0,
    cooldownUntil,
  });
  return res.json({ message: "OTP sent successfully" });
};

exports.sendPassOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  const lowerEmail = email.toLowerCase();
  const user = await userModel.findOne({ email: lowerEmail });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const name = user ? user.name : "User";

  function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    secure: false,
    port: 587, // ✅ Use secure port for Hostinger
    service: "hostinger",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // App password from Google
    },
    tls: {
      rejectUnauthorized: false, // ✅ Allow self-signed certs
    },
  });

  async function sendOtpEmail(toEmail, name, otp) {
    const mailOptions = {
      from: `"MindfulTrust Care & Services" <${process.env.EMAIL_USER}>`,

      to: toEmail,
      subject: `Your OTP Code is ${otp}`,
      text: `Your OTP code is: ${otp}`,
      html: `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <title>Your Password Reset Code</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #111330; }
        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }
        @media screen and (max-width: 600px) {
            .hero {
                font-size: 26px !important;
                line-height: 34px !important;
            }
        }
            .hover-link {
                color: #FE4880 !important;
                font-weight: 700 !important;}
            .hover-link:hover{
                color: #ffffff !important;}
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #111330;">
    <!-- Preheader text for email clients -->
    <div style="display: none; max-height: 0; overflow: hidden;">
        Your password reset code is here.
    </div>

    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td align="center" style="padding: 20px 10px;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                    <!-- Logo Section -->
                    <tr>
                        <td align="center" style="padding: 20px 0 30px 0;">
                            <!-- IMPORTANT: Replace with the absolute URL to your logo image. A light version of the logo is recommended for dark backgrounds. -->
                            <img src="https://mindfultrust.co.uk/wp-content/uploads/2025/06/logo2.png" alt="MindfulTrust Logo" width="180" style="display:block;">
                        </td>
                    </tr>
                    <!-- Main Card -->
                    <tr>
                        <td bgcolor="#1D2056" style="border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <!-- Main Content -->
                                <tr>
                                    <td style="padding: 40px 30px;">
                                        <h1 class="hero" style="margin: 0; font-family: 'Inter', Arial, sans-serif; font-size: 28px; font-weight: 700; color: #FFFFFF; line-height: 36px;">
                                            Reset Your Password
                                        </h1>
                                        <p style="margin: 20px 0 0; font-family: 'Inter', Arial, sans-serif; font-size: 16px; line-height: 24px; color: #c7c7c7;">
                                            Hi ${name},
                                        </p>
                                        <p style="margin: 10px 0 0; font-family: 'Inter', Arial, sans-serif; font-size: 16px; line-height: 24px; color: #c7c7c7;">
                                           A request was made to reset your password. Use the code below to proceed. This code is valid for 10 minutes.
                                        </p>

                                        <!-- OTP Code Box -->
                                        <div style="margin: 30px 0;">
                                            <p style="margin: 0; font-family: 'Inter', Arial, sans-serif; font-size: 14px; color: #c7c7c7; text-align: center;">Your password reset code is:</p>
                                            <div style="background-color: #2a2d6e; border-radius: 8px; padding: 15px 20px; text-align: center; margin-top: 10px;">
                                                <p style="margin: 0; font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: bold; color: #FFFFFF; letter-spacing: 10px;">
                                                    <!-- Your 6-Digit OTP Goes Here -->
                                                    ${otp}
                                                </p>
                                            </div>
                                        </div>

                                        <p style="margin: 0; font-family: 'Inter', Arial, sans-serif; font-size: 14px; line-height: 22px; color: #c7c7c7;">
                                            If you did not request a password reset, please disregard this email or contact our support team if you have concerns.
                                        </p>
                                    </td>
                                </tr>
                                <!-- Footer Section -->
                                <tr>
                                    <td style="padding: 30px 30px; border-top: 1px solid #2a2d6e;">
                                        <p style="margin: 0; font-family: 'Inter', Arial, sans-serif; font-size: 12px; line-height: 18px; color: #888aaa; text-align: center;">
                                            &copy; 2025 <a class="hover-link" href="https://mindfultrust.co.uk/" target="_blank">MindfulTrust Care & Services</a>. All Rights Reserved. <br>
                                            CeeGee House Firstfloor College Road Harrow Weald HA3 4EF
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`,
    };

    try {
      let info = await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  }

  const now = Date.now();
  const record = otpStore.get(email);

  // Cooldown check
  if (record && record.cooldownUntil && now < record.cooldownUntil) {
    const wait = Math.ceil((record.cooldownUntil - now) / 1000);
    return res
      .status(429)
      .json({ message: `Wait ${wait}s before resending OTP.` });
  }

  const otp = generateOTP();
  const expiresAt = now + 5 * 60 * 1000; // OTP valid for 5 mins
  const cooldownUntil = now + 60 * 1000; // 60-second resend cooldown

  const sent = await sendOtpEmail(email, name, otp);
  if (!sent) {
    return res.status(500).json({ message: "Failed to send OTP" });
  }
  otpStore.set(email, {
    code: otp,
    expiresAt,
    attempts: 0,
    cooldownUntil,
  });
  return res.json({ message: "OTP sent successfully" });
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  const record = otpStore.get(email);
  const now = Date.now();

  if (!record) {
    return res
      .status(400)
      .json({ message: "No OTP sent. Please request one." });
  }

  if (now > record.expiresAt) {
    otpStore.delete(email);
    return res
      .status(400)
      .json({ message: "OTP expired. Please request a new one." });
  }

  if (record.attempts >= 3) {
    return res
      .status(403)
      .json({ message: "Maximum attempts reached. Please try again later." });
  }

  if (otp === record.code) {
    otpStore.delete(email);
    return res.json({
      message: "OTP verified. You can proceed with registration.",
    });
  } else {
    record.attempts += 1;
    otpStore.set(email, record);
    const left = 3 - record.attempts;
    return res
      .status(401)
      .json({ message: `Invalid OTP. Attempts left: ${left}` });
  }
};

exports.reset = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const lowerEmail = email.toLowerCase();
  const user = await userModel.findOne({ email: lowerEmail });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.password = password;
  await user.save();

  return res.json({ message: "Password reset successfully" });
};

exports.logout = (req, res) => {
  const token = req.cookies.token; // extract only the token
  console.log(token);

  if (token) {
    res.clearCookie("token");

    // No jwt.destroy, since JWTs are stateless
    res.status(200).json({ message: "Logged out successfully" });
  } else {
    res.status(400).json({ message: "No active session found" });
  }
};
