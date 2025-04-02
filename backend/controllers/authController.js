import bcrypt, { genSalt } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import transporter from '../config/nodemailer.js';
import { connectToDatabase } from '../lib/db.js';
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from '../config/emailTemplates.js';

const generateOtp = () => {
   return String(Math.floor(100000 + Math.random() * 900000));
};

// Register a new user
export const register = async (req, res) => {
    const { name, email, password, accountType } = req.body;

    if (!name || !email || !password || !accountType) {
        return res.json({ success: false, message: "Missing Details" });
    }

    try {
        // Validate email format and allowed domains
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Enter a valid email address" });
        }
        const allowedDomains = ["iiita.ac.in", "gmail.com"];
        const emailParts = email.split("@");
        if (emailParts.length !== 2) {
            return res.json({ success: false, message: "Invalid email format" });
        }
        const emailDomain = emailParts[1].toLowerCase();
        if (!allowedDomains.includes(emailDomain)) {
            return res.json({ success: false, message: "Please use a valid institute email address" });
        }

        const db = await connectToDatabase();

        // Check if user already exists in User table
        const [existingUser] = await db.execute("SELECT * FROM User WHERE email = ? AND accountType = ?", [email, accountType]);
        if (existingUser.length > 0) {
            return res.json({ success: false, message: "User already exists" });
        }

        // Insert new user into User table
        const [result] = await db.execute(
            "INSERT INTO User (name, email, accountType) VALUES (?, ?, ?)",
            [name, email, accountType]
        );

        const userID = result.insertId;

        if (accountType === "Student") {
            await db.execute("INSERT INTO Student (userID) VALUES (?)", [userID]);
        } else {
            await db.execute("INSERT INTO Member (userID) VALUES (?)", [userID]);
        }
        
        // Hash password and create entry in Authentication table
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await db.execute(
            `INSERT INTO Authentication (username, passwordHash, userID, verifyOtp, verifyOtpExpireAt, isAccountVerified, resetOtp, resetOtpExpireAt)
             VALUES (?, ?, ?, '', 0, 0, '', 0)`,
            [email, hashedPassword, userID]
        );

        // Generate JWT token using new userID
        const token = jwt.sign({ id: userID }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Send welcome email
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

// Login a user
export const login = async (req, res) => {
    const { email, password, accountType} = req.body;

    if (!email || !password || !accountType) {
        return res.json({ success: false, message: "Email and Password are required" });
    }

    try {
        const db = await connectToDatabase();
        // Join User and Authentication tables to retrieve user details and hashed password
        const [rows] = await db.query(
            `SELECT u.userID, u.email, a.passwordHash 
             FROM User u JOIN Authentication a ON u.userID = a.userID 
             WHERE u.email = ? AND u.accountType = ?`, [email,accountType]
        );
        if (rows.length === 0) {
            return res.json({ success: false, message: "Email not registered" });
        }

        const user = rows[0];
        // Compare provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid Password" });
        }

        // Generate JWT token using userID from User table
        const token = jwt.sign({ id: user.userID }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return res.json({ success: true, message: "User Logged In", token });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    }
};

// Log out a user
export const logOut = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        return res.status(200).json({ success: true, message: "Logged Out" });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    }
};

// Send Verification OTP to the User's Email
export const sendVerifyOtp = async (req, res) => {
    try {
        const { userID } = req.body;
        if (!userID) {
            return res.json({ success: false, message: "User ID is required" });
        }
        
        const db = await connectToDatabase();
        // Retrieve the user along with Authentication details using userID
        const [rows] = await db.query(
            `SELECT u.userID, u.email, a.verifyOtp, a.verifyOtpExpireAt, a.isAccountVerified 
             FROM User u JOIN Authentication a ON u.userID = a.userID 
             WHERE u.userID = ?`, [userID]
        );
        if (rows.length === 0) {
            return res.json({ success: false, message: "User not found" });
        }
        
        const user = rows[0];
        if (user.isAccountVerified) {
            return res.json({ success: false, message: "Account already verified" });
        }
        
        // Generate OTP and set expiry time (24 hours from now)
        const otp = generateOtp();
        const verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
        
        // Update Authentication table with the OTP and its expiry
        await db.query(
            "UPDATE Authentication SET verifyOtp = ?, verifyOtpExpireAt = ? WHERE userID = ?",
            [otp, verifyOtpExpireAt, userID]
        );
        
        // Send verification email
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

// Verify Email with OTP
export const verifyEmail = async (req, res) => {
    const { userID, otp } = req.body;
    if (!userID || !otp) {
        return res.json({ success: false, message: 'Missing Details' });
    }

    try {
        const db = await connectToDatabase();
        // Retrieve Authentication details using userID
        const [rows] = await db.query("SELECT * FROM Authentication WHERE userID = ?", [userID]);
        if (rows.length === 0) {
            return res.json({ success: false, message: "User not found" });
        }

        const authData = rows[0];
        if (authData.verifyOtp === '' || authData.verifyOtp !== otp) {
            return res.json({ success: false, message: "Invalid OTP" });
        } 

        if (authData.verifyOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: "OTP Expired" });
        }

        // Mark account as verified and clear OTP fields
        await db.query(
            "UPDATE Authentication SET isAccountVerified = ?, verifyOtp = ?, verifyOtpExpireAt = ? WHERE userID = ?",
            [1, '', 0, userID]
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
        return res.json({ success: true });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    }
};

// Send Password Reset OTP
export const sendResetOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.json({ success: false, message: "Email is required" });
    }

    try {
        const db = await connectToDatabase();
        // Retrieve user and authentication details using email
        const [rows] = await db.query(
            `SELECT u.userID, u.email, a.resetOtp 
             FROM User u JOIN Authentication a ON u.userID = a.userID 
             WHERE u.email = ?`, [email]
        );
        if (rows.length === 0) {
            return res.json({ success: false, message: "User not found" });
        }

        const user = rows[0];
        const otp = generateOtp();
        const resetOtpExpireAt = Date.now() + 15 * 60 * 1000; // 15 minutes from now

        // Update Authentication table with reset OTP and its expiry
        await db.query(
            "UPDATE Authentication SET resetOtp = ?, resetOtpExpireAt = ? WHERE userID = ?",
            [otp, resetOtpExpireAt, user.userID]
        );

        // Send password reset email
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

// Verify Password Reset OTP
export const verifyResetOtp = async (req, res) => {
    const { otp, email } = req.body;
    if (!email || !otp) {
        return res.json({ success: false, message: "OTP is required" });
    }

    try {
        const db = await connectToDatabase();
        // Retrieve user and authentication details using email
        const [rows] = await db.query(
            `SELECT u.userID, u.email, a.resetOtp, a.resetOtpExpireAt 
             FROM User u JOIN Authentication a ON u.userID = a.userID 
             WHERE u.email = ?`, [email]
        );
        if (rows.length === 0) {
            return res.json({ success: false, message: "User not found" });
        }

        const authData = rows[0];
        if (authData.resetOtp === '' || authData.resetOtp !== otp) {
            return res.json({ success: false, message: "Invalid OTP" });
        }
        if (authData.resetOtpExpireAt < Date.now()) {
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
        // Retrieve user and authentication details using email
        const [rows] = await db.query(
            `SELECT u.userID, u.email, a.passwordHash 
             FROM User u JOIN Authentication a ON u.userID = a.userID 
             WHERE u.email = ?`, [email]
        );
        if (rows.length === 0) {
            return res.json({ success: false, message: "User not found" });
        }
        const authData = rows[0];

        // Check if the new password is the same as the current password
        const isSamePassword = await bcrypt.compare(newPassword, authData.passwordHash);
        if (isSamePassword) {
            return res.json({ 
                success: false, 
                message: "The new password must be different from your current password." 
            });
        }

        // Hash the new password and update Authentication table; clear reset OTP fields
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await db.query(
            "UPDATE Authentication SET passwordHash = ?, resetOtp = ?, resetOtpExpireAt = ? WHERE userID = ?",
            [hashedPassword, '', 0, authData.userID]
        );

        return res.json({ success: true, message: "Password has been reset successfully, Please Login with your new password" });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    }
};
