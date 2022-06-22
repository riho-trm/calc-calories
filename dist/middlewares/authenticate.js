"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const authenticate = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null || undefined)
        return res
            .status(401)
            .send({ message: "アクセストークンが含まれていません。" });
    jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret, (err, user) => {
        if (err)
            return res
                .status(401)
                .json({ message: "アクセストークンが有効ではありません。" });
        req.user = user;
        next();
    });
};
exports.authenticate = authenticate;
//# sourceMappingURL=authenticate.js.map