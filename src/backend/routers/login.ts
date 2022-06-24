import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mysql from "mysql";
import { config } from "../config";
import { authenticate } from "../middlewares/authenticate";

const router: express.Router = express.Router();
router.use(express.json());

// ConnectionPoolの設定
const pool = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASS,
  database: process.env.DB,
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
router.post("/register", async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
  pool.getConnection((err, connection) => {
    // SQL文
    const searchUsernameSql = "SELECT user_name FROM users WHERE user_name=?";
    const searchEmailSql =
      "SELECT mail_address FROM users WHERE mail_address=?";
    const registSql =
      "INSERT INTO users (user_name, mail_address, password, is_admin) VALUES (?,?,?,?)";

    connection.query(searchUsernameSql, [req.body.userName], (err, result) => {
      if (err) throw err;
      if (result.length >= 1) {
        connection.query(searchEmailSql, [req.body.email], (err, result) => {
          if (err) throw err;
          // ユーザー名、メールアドレス共に重複
          if (result.length >= 1) {
            res.json({
              status: "error",
              message: {
                userName: "このユーザー名は使用されています",
                email: "このメールアドレスは使用されています",
              },
            });
          } else if (result.length === 0) {
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
      } else if (result.length === 0) {
        //メールアドレス重複
        connection.query(searchEmailSql, [req.body.email], (err, result) => {
          if (err) throw err;
          if (result.length >= 1) {
            res.json({
              status: "error",
              message: {
                userName: "",
                email: "このメールアドレスは使用されています",
              },
            });
          } else if (result.length === 0) {
            // 問題ないためユーザー登録処理,ログイン処理
            connection.query(
              registSql,
              [
                req.body.userName,
                req.body.email,
                hashedPassword,
                req.body.isadmin,
              ],
              (err, result) => {
                if (err) throw err;
                res.json(result);
              }
            );
          }
          connection.release();
        });
      }
    });
  });
});

// ログイン処理
router.post("/login", async (req, res) => {
  const searchUserSql = "SELECT * FROM users WHERE mail_address=?";
  pool.getConnection((err, connection) => {
    connection.query(searchUserSql, [req.body.email], async (err, result) => {
      if (err) throw err;
      if (result.length === 0) {
        res.json({
          status: "error",
          message: { email: "このアドレスは登録されていません", password: "" },
        });
      } else {
        const match = await bcrypt.compare(
          req.body.password,
          result[0].password
        );
        if (!match) {
          res.json({
            status: "error",
            message: { email: "", password: "パスワードが間違っています" },
          });
        } else {
          const payload = {
            id: result[0].id,
            userName: result[0].user_name,
            createdAt: result[0].created_at,
          };
          const token = jwt.sign(
            payload,
            config.jwt.secret,
            config.jwt.options
          );
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
    });
  });
});

// 全栄養素を取得する
router.get("/nutrientslist", authenticate, (req, res) => {
  const sql = "select * from nutrients";
  pool.getConnection((err, connection) => {
    connection.query(sql, function (err, result) {
      if (err) throw err;
      res.json(result);
      connection.release();
    });
  });
});

export default router;
