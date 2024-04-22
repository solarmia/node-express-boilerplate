"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const UserSchema = new mongoose_1.default.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String },
    inviteLink: { type: String, require: true, unique: true },
    referrerId: { type: String },
    mnemonic: { type: String, unique: true, sparse: true },
    tempMnemonic: { type: String },
    date: { type: Date, default: Date.now },
    role: { type: Number, default: 0 },
});
const UserModel = mongoose_1.default.model("user", UserSchema);
exports.default = UserModel;
