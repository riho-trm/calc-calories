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
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const mysql_1 = __importDefault(require("mysql"));
const config_1 = require("../config");
const authenticate_1 = require("../middlewares/authenticate");
const router = express_1.default.Router();
router.use(express_1.default.json());
// ConnectionPoolの設定
const pool = mysql_1.default.createPool({
    host: "us-cdbr-east-05.cleardb.net",
    user: "be3a5ee1ceb501",
    password: "224a4fb1",
    database: "heroku_05e0dc039ab6269",
});
// ハッシュ化のための回数
const saltRounds = 10;
// テスト用
router.get("/test", (req, res) => {
    const sql = "select * from users";
    pool.getConnection(function (err, connection) {
        connection.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            res.json(result);
            connection.release();
        });
    });
});
// ユーザー登録処理
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield bcrypt_1.default.hash(req.body.password, saltRounds);
    pool.getConnection((err, connection) => {
        // SQL文
        const searchUsernameSql = "SELECT user_name FROM users WHERE user_name=?";
        const searchEmailSql = "SELECT mail_address FROM users WHERE mail_address=?";
        const registSql = "INSERT INTO users (user_name, mail_address, password, is_admin) VALUES (?,?,?,?)";
        connection.query(searchUsernameSql, [req.body.userName], (err, result) => {
            if (err)
                throw err;
            if (result.length >= 1) {
                connection.query(searchEmailSql, [req.body.email], (err, result) => {
                    if (err)
                        throw err;
                    // ユーザー名、メールアドレス共に重複
                    if (result.length >= 1) {
                        res.json({
                            status: "error",
                            message: {
                                userName: "このユーザー名は使用されています",
                                email: "このメールアドレスは使用されています",
                            },
                        });
                    }
                    else if (result.length === 0) {
                        // ユーザー名重複
                        res.json({
                            status: "error",
                            message: {
                                userName: "このユーザー名は使用されています",
                                email: "",
                            },
                        });
                    }
                    connection.release();
                });
            }
            else if (result.length === 0) {
                //メールアドレス重複
                connection.query(searchEmailSql, [req.body.email], (err, result) => {
                    if (err)
                        throw err;
                    if (result.length >= 1) {
                        res.json({
                            status: "error",
                            message: {
                                userName: "",
                                email: "このメールアドレスは使用されています",
                            },
                        });
                    }
                    else if (result.length === 0) {
                        // 問題ないためユーザー登録処理,ログイン処理
                        connection.query(registSql, [
                            req.body.userName,
                            req.body.email,
                            hashedPassword,
                            req.body.isadmin,
                        ], (err, result) => {
                            if (err)
                                throw err;
                            res.json(result);
                        });
                    }
                    connection.release();
                });
            }
        });
    });
}));
// ログイン処理
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const searchUserSql = "SELECT * FROM users WHERE mail_address=?";
    pool.getConnection((err, connection) => {
        connection.query(searchUserSql, [req.body.email], (err, result) => __awaiter(void 0, void 0, void 0, function* () {
            if (err)
                throw err;
            if (result.length === 0) {
                res.json({
                    status: "error",
                    message: { email: "このアドレスは登録されていません", password: "" },
                });
            }
            else {
                const match = yield bcrypt_1.default.compare(req.body.password, result[0].password);
                if (!match) {
                    res.json({
                        status: "error",
                        message: { email: "", password: "パスワードが間違っています" },
                    });
                }
                else {
                    const payload = {
                        id: result[0].id,
                        userName: result[0].user_name,
                        createdAt: result[0].created_at,
                    };
                    const token = jsonwebtoken_1.default.sign(payload, config_1.config.jwt.secret, config_1.config.jwt.options);
                    res.json({
                        status: "success",
                        token,
                        id: result[0].id,
                        userName: result[0].user_name,
                        email: result[0].mail_address,
                        isAdmin: result[0].is_admin,
                    });
                }
            }
            connection.release();
        }));
    });
}));
// 全栄養素を取得する
router.get("/nutrientslist", authenticate_1.authenticate, (req, res) => {
    const sql = "select * from nutrients";
    pool.getConnection((err, connection) => {
        connection.query(sql, function (err, result) {
            if (err)
                throw err;
            res.json(result);
            connection.release();
        });
    });
});
exports.default = router;
//# sourceMappingURL=login.js.map