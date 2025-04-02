import { connectToDatabase } from '../lib/db.js';

export const getUserData = async (req, res) => {
    try {
        const { userID } = req.body;
        
        if (!userID) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }
        
        const db = await connectToDatabase();
        // Join User and Authentication tables to get the user name and verification status
        const [rows] = await db.query(
            `SELECT U.name, A.isAccountVerified, U.accountType
             FROM User U
             JOIN Authentication A ON U.userID = A.userID
             WHERE U.userID = ?`, 
            [userID]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        const user = rows[0];
        res.json({
            success: true,
            userData: {
                name: user.name,
                isAccountVerified: !!user.isAccountVerified,
                accountType: user.accountType
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};
