import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import path from "path";
import mysql from "mysql";
// historyモードでURL遷移を正しく行うためにインストール
import history from "connect-history-api-fallback";
// 非同期処理のなかで例外を投げるとエラーで落ちるので以下をインストール
import domain from "express-domain-middleware";
import cors from "cors";
import { config } from "./config";

const app = express();
// historyの使用
app.use(history());
app.use(express.json());
app.use(domain);
app.use(cors());

const port = process.env.PORT || 3000;
const saltRounds = 10;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const loginRouter = require("./routers/login").default;
app.use("/login", loginRouter);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const nutrientsRouter = require("./routers/nutrients").default;
app.use("/nutrients", nutrientsRouter);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const saveRouter = require("./routers/save").default;
app.use("/save", saveRouter);

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "ri-noahn8a",
  database: "calcCalories",
});

// SQL発行時にデータベースへの接続が行われるので、con.connectの箇所を削除してもコードは動作する
// connection.connect((err) => {
//   if (err) throw err;
//   console.log("Connected");
// });

// Node.jsの標準モジュールpathが提供しているpath.joinメソッドを使って、
// 実行中のスクリプトのディレクトリ名とpublicというフォルダ名を結合したパスを取得
// 以下を削除するとレンダリングされなくなる
app.use(express.static(path.join(__dirname, "public")));

export default app.listen(port, () => {
  console.log("App is running at http://localhost:3000");
});
