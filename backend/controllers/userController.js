import { connectToDatabase } from '../lib/db.js';

export const getUserData = async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }
        
        const db = await connectToDatabase();       
        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        const user = rows[0];
        res.json({
            success: true,
            userData: {
                name: user.name,
                isAccountVerified: !!user.isAccountVerified, // Convert TINYINT to Boolean
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};
