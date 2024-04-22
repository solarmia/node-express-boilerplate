"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const authMiddleware = (req, res, next) => {
    // Get token from header
    const token = req.header("x-auth-token");
    // Check if not token
    if (!token) {
        return res.status(401).json({ msg: "No token, authorization denied" });
    }
    // Verify token
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
        req.user = decoded.user;
        next();
    }
    catch (error) {
        console.error("Something went wrong with the auth middleware", error);
        return res.status(401).json({ msg: "Token is not valid" });
    }
};
exports.authMiddleware = authMiddleware;
