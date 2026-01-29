const jwt = require('jsonwebtoken');
const User = require("../models/user.model");
require("dotenv").config();

exports.authMiddleware = async (req, res, next) => {
    try {
        const token = req.body.token;

        if(!token) {
            return res.status(401).json({
                success:false,
                message:"Token is missing"
            });
        }

        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decode;
        } catch (error) {
            return res.status(401).json({
                success:false,
                message:'token is invalid',
            });
        }
        next();
    } catch (error) {
        return res.status(401).json({
            success:false,
            message:'Something went wrong while validationg then token',
        });
    }
} 