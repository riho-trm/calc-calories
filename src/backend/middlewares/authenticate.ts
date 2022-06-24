import jwt from "jsonwebtoken";
import { config } from "../config";

// トークンの検証を行うミドルウェア
export const authenticate = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  // Bearの後ろのTokenのみ取得
  const token = authHeader && authHeader.split(" ")[1];

  // トークンがヘッダに含まれていない場合の処理
  if (token == null || undefined)
    return res
      .status(401)
      .send({ message: "アクセストークンが含まれていません。" });

  // jwtのverify関数を利用してTokenが正しいか検証
  jwt.verify(token, config.jwt.secret, (err: any, user: any) => {
    if (err)
      return res
        .status(401)
        .json({ message: "アクセストークンが有効ではありません。" });
    req.user = user;
    next();
  });
};
