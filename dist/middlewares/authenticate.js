"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
// トークンの検証を行うミドルウェア
const authenticate = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    // Bearの後ろのTokenのみ取得
    const token = authHeader && authHeader.split(" ")[1];
    // トークンがヘッダに含まれていない場合の処理
    if (token == null || undefined)
        return res
            .status(401)
            .send({ message: "アクセストークンが含まれていません。" });
    // jwtのverify関数を利用してTokenが正しいか検証
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