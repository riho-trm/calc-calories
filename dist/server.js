"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const mysql_1 = __importDefault(require("mysql"));
// historyモードでURL遷移を正しく行うためにインストール
const connect_history_api_fallback_1 = __importDefault(require("connect-history-api-fallback"));
// 非同期処理のなかで例外を投げるとエラーで落ちるので以下をインストール
const express_domain_middleware_1 = __importDefault(require("express-domain-middleware"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
// historyの使用
app.use((0, connect_history_api_fallback_1.default)());
app.use(express_1.default.json());
app.use(express_domain_middleware_1.default);
app.use((0, cors_1.default)());
const port = process.env.PORT || 3000;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const loginRouter = require("./routers/login").default;
app.use("/login", loginRouter);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nutrientsRouter = require("./routers/nutrients").default;
app.use("/nutrients", nutrientsRouter);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const saveRouter = require("./routers/save").default;
app.use("/save", saveRouter);
const pool = mysql_1.default.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASS,
    database: process.env.DB,
});
// SQL発行時にデータベースへの接続が行われるので、con.connectの箇所を削除してもコードは動作する
// connection.connect((err) => {
//   if (err) throw err;
//   console.log("Connected");
// });
// Node.jsの標準モジュールpathが提供しているpath.joinメソッドを使って、
// 実行中のスクリプトのディレクトリ名とpublicというフォルダ名を結合したパスを取得
// 以下を削除するとレンダリングされなくなる
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
exports.default = app.listen(port, () => {
    console.log(process.env.TEST);
    console.log(`App is running at ${port}`);
});
//# sourceMappingURL=server.js.map