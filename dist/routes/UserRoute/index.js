"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const js_base64_1 = require("js-base64");
const mongoose_1 = require("mongoose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserModel_1 = __importDefault(require("../../model/UserModel"));
const middleware_1 = require("../../middleware");
const config_1 = require("../../config");
function validateUsername(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield UserModel_1.default.findOne({ username });
        if (user)
            return false;
        return true;
    });
}
// Create a new instance of the Express Router
const UserRouter = (0, express_1.Router)();
// @route    GET api/users
// @desc     Get user by token
// @access   Private
UserRouter.get("/", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield UserModel_1.default.findById(req.user.id).select([
            "-password",
            "-mnemonic",
            "-role",
            "-referrerlId",
        ]);
        res.json(user);
    }
    catch (err) {
        console.error(err.message);
        return res.status(500).send({ error: err });
    }
}));
// @route    GET api/users/username
// @desc     Is username available
// @access   Public
UserRouter.get("/username", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username } = req.query;
        const isValid = yield validateUsername(username);
        return res.json({ isValid });
    }
    catch (error) {
        console.error(error);
        return res.status(500).send({ error });
    }
}));
// @route    POST api/users/signup
// @desc     Register user
// @access   Public
UserRouter.post("/signup", (0, express_validator_1.check)("username", "Username is required").notEmpty(), (0, express_validator_1.check)("email", "Please include a valid email").isEmail(), (0, express_validator_1.check)("password", "Please enter a password with 6 or more characters").isLength({ min: 6 }), (0, express_validator_1.check)("confirmPassword", "Passwords do not match").custom((value, { req }) => {
    if (value !== req.body.password) {
        throw new mongoose_1.Error("Passwords do not match");
    }
    return true;
}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }
        const { username, email, password, encodedReferrer } = req.body;
        const userExists = yield UserModel_1.default.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: "User already exists" });
        }
        const isValid = yield validateUsername(username);
        if (!isValid)
            return res.status(400).json({ error: "Username already exists" });
        let referrerId = null;
        if (encodedReferrer) {
            const referrerEmail = (0, js_base64_1.decode)(encodedReferrer);
            const referrer = yield UserModel_1.default.findOne({ email: referrerEmail });
            referrerId = (referrer === null || referrer === void 0 ? void 0 : referrer._id.toString()) || null;
        }
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        const user = new UserModel_1.default({
            username,
            email,
            password: hashedPassword,
            inviteLink: (0, js_base64_1.encode)(email),
            referrerId,
        });
        yield user.save();
        const payload = {
            user: {
                id: user.id,
            },
        };
        const token = jsonwebtoken_1.default.sign(payload, config_1.JWT_SECRET, { expiresIn: "1day" });
        return res.json({ token });
    }
    catch (error) {
        console.error(error);
        return res.status(500).send({ error });
    }
}));
// @route    POST api/users/signin
// @desc     Authenticate user & get token
// @access   Public
UserRouter.post("/signin", (0, express_validator_1.check)("email", "Please include a valid email").isEmail(), (0, express_validator_1.check)("password", "Password is required").exists(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
    }
    const { email, password } = req.body;
    try {
        let user = yield UserModel_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Invalid Email" });
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Incorrect password" });
        }
        const payload = {
            user: {
                id: user.id,
            },
        };
        jsonwebtoken_1.default.sign(payload, config_1.JWT_SECRET, { expiresIn: "5 days" }, (err, token) => {
            if (err)
                throw err;
            return res.json({
                token,
            });
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).send({ error: error });
    }
}));
exports.default = UserRouter;
