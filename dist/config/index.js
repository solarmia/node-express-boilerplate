"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectMongoDB = exports.JWT_SECRET = exports.PORT = void 0;
var config_1 = require("./config");
Object.defineProperty(exports, "PORT", { enumerable: true, get: function () { return config_1.PORT; } });
Object.defineProperty(exports, "JWT_SECRET", { enumerable: true, get: function () { return config_1.JWT_SECRET; } });
var db_1 = require("./db");
Object.defineProperty(exports, "connectMongoDB", { enumerable: true, get: function () { return db_1.connectMongoDB; } });
