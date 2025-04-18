import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const protectRoute = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No authorization token, access denied" });
        }

        const token = authHeader.replace("Bearer ", "");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(401).json({ message: "Token is invalid" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Error in protectRoute middleware:", error.message);
        res.status(401).json({ message: "Not authorized, token failed" });
    }
}

export default protectRoute;