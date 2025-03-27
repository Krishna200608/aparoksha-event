import bcrypt, { genSalt } from 'bcryptjs'
import jwt from 'jsonwebtoken'
import validator from 'validator';
import transporter from '../config/nodemailer.js';
import { connectToDatabase } from '../lib/db.js';
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from '../config/emailTemplates.js';

export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.json({ success: false, message: "Missing Details" });
    }

    try {
        // Check if the email is valid
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Enter a valid email address" });
        }

        // Define a whitelist of allowed domains
        const allowedDomains = ["iiita.ac.in", "gmail.com"];
        const emailParts = email.split("@");
        if (emailParts.length !== 2) {
            return res.json({ success: false, message: "Invalid email format" });
        }
        const emailDomain = emailParts[1].toLowerCase();

        // Verify that the email's domain is in the allowed domains list
        if (!allowedDomains.includes(emailDomain)) {
            return res.json({ success: false, message: "Please use a valid institute email address" });
        }

        const db = await connectToDatabase();

        // Check if user already exists
        const [existingUser] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
        if (existingUser.length > 0) {
            return res.json({ success: false, message: "User already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user into the database
        const [result] = await db.execute(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [name, email, hashedPassword]
        );

        // Get the inserted user ID
        const user_id = result.insertId;
        
        // Generate JWT token
        const token = jwt.sign({ id: user_id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Sending welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to Aparoksha',
            text: `Welcome to Aparoksha. Your account has been created with email id ${email}`
        };

        await transporter.sendMail(mailOptions);

        return res.json({ success: true, message: "User registered successfully" });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ success: false, message: "Email and Password are required" });
    }

    try {
        const db = await connectToDatabase();
        // Query the user with the given email
        const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (rows.length === 0) {
            return res.json({ success: false, message: "Email not registered" });
        }

        const user = rows[0];

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid Password" });
        }

        // Generate a JWT token using the user id from the MySQL record
        const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return res.json({ success: true, message: "User Logged In" , token});
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    }
};


export const logOut = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })

        return res.status(200).json({success: true, message: "Logged Out"});

    } catch (error) {
        console.error(error);
        return res.json({success: false, message: error.message});
    }
} 


const generateOtp = () => {

   const otp =  String(Math.floor(100000 + Math.random() * 900000))

   return otp;
}

// Send Verification Otp to the User's Email
export const sendVerifyOtp = async (req, res) => {
    try {
        const { user_id } = req.body;
        
        if (!user_id) {
            return res.json({ success: false, message: "User ID is required" });
        }
        
        const db = await connectToDatabase();
        // Retrieve the user using the user_id (primary key "id")
        const [rows] = await db.query("SELECT * FROM users WHERE user_id = ?", [user_id]);
        if (rows.length === 0) {
            return res.json({ success: false, message: "User not found" });
        }
        
        const user = rows[0];
        
        if (user.isAccountVerified) {
            return res.json({ success: false, message: "Account Already verified" });
        }
        
        // Generate OTP and calculate expiry time (24 hours from now)
        const otp = generateOtp();
        const verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
        
        // Update the user's OTP and expiry time in the database
        await db.query(
            "UPDATE users SET verifyOtp = ?, verifyOtpExpireAt = ? WHERE user_id = ?",
            [otp, verifyOtpExpireAt, user_id]
        );
        
        // Sending verification email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verification OTP',
            html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
        };
        
        await transporter.sendMail(mailOptions);
        
        return res.json({ success: true, message: "Verification OTP sent on Email" });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    }
};

export const verifyEmail = async (req, res) => {
    const { user_id, otp } = req.body;

    if (!user_id || !otp) {
        return res.json({ success: false, message: 'Missing Details' });
    }

    try {
        const db = await connectToDatabase();
        // Retrieve the user using the primary key "id"
        const [rows] = await db.query("SELECT * FROM users WHERE user_id = ?", [user_id]);
        if (rows.length === 0) {
            return res.json({ success: false, message: "User Not found" });
        }

        const user = rows[0];

        // Validate OTP: it must not be empty and must match the provided otp
        if (user.verifyOtp === '' || user.verifyOtp !== otp) {
            return res.json({ success: false, message: "Invalid OTP" });
        } 

        // Check if the OTP has expired
        if (user.verifyOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: "OTP Expired" });
        }

        // OTP is valid, update the user's verification status and clear OTP fields
        await db.query(
            "UPDATE users SET isAccountVerified = ?, verifyOtp = ?, verifyOtpExpireAt = ? WHERE user_id = ?",
            [1, '', 0, user_id]
        );

        return res.json({ success: true, message: "Email verified successfully" });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    }
};


// Check if user is authenticated
export const isAuthenticated = async (req, res) => {
    try {
        return res.json({success: true})
    } catch (error) {
        console.error(error);
        res.json({success: false, message: error.message})
    }
}

export const sendResetOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.json({ success: false, message: "Email is required" });
    }

    try {
        const db = await connectToDatabase();
        // Retrieve the user using the provided email
        const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (rows.length === 0) {
            return res.json({ success: false, message: "User not found" });
        }

        const user = rows[0];
        // Generate OTP and set expiry time (15 minutes from now)
        const otp = generateOtp();
        console.log(otp);
        const resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

        // Update the user's resetOtp and resetOtpExpireAt fields in the database
        await db.query(
            "UPDATE users SET resetOtp = ?, resetOtpExpireAt = ? WHERE user_id = ?",
            [otp, resetOtpExpireAt, user.user_id]
        );

        // Sending password reset email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password Reset OTP',
            html: PASSWORD_RESET_TEMPLATE
                .replace('{{otp}}', otp)
                .replace('{{email}}', user.email)
        };

        await transporter.sendMail(mailOptions);

        return res.json({ success: true, message: "OTP sent to your email" });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    }
};


export const verifyResetOtp = async (req, res) => {
    const { otp, email } = req.body;

    if (!email || !otp) {
        return res.json({ success: false, message: "OTP is required" });
    }

    try {
        const db = await connectToDatabase();
        // Retrieve the user using the provided email
        const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (rows.length === 0) {
            return res.json({ success: false, message: "User not found" });
        }

        const user = rows[0];

        // Validate OTP: it must not be empty and must match the provided otp
        if (user.resetOtp === '' || user.resetOtp !== otp) {
            return res.json({ success: false, message: "Invalid OTP" });
        }

        // Check if the OTP has expired
        if (user.resetOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: "OTP Expired" });
        }

        return res.json({ success: true, message: "OTP Verified!" });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    }
};

// Reset User Password
export const resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
        return res.json({ success: false, message: 'New password is required' });
    }

    try {
        const db = await connectToDatabase();

        // Retrieve the user using the provided email
        const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (rows.length === 0) {
            return res.json({ success: false, message: "User not found" });
        }

        const user = rows[0];

        // Check if the new password is the same as the current password
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.json({ 
                success: false, 
                message: "The new password must be different from your current password." 
            });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the user's password and clear reset OTP fields in the database
        await db.query(
            "UPDATE users SET password = ?, resetOtp = ?, resetOtpExpireAt = ? WHERE user_id = ?",
            [hashedPassword, '', 0, user.user_id]
        );

        return res.json({ success: true, message: "Password has been reset successfully" });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    }
};