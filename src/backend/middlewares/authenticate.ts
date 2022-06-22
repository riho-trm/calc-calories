import jwt from "jsonwebtoken";
import { config } from "../config";

export const authenticate = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null || undefined)
    return res
      .status(401)
      .send({ message: "アクセストークンが含まれていません。" });

  jwt.verify(token, config.jwt.secret, (err: any, user: any) => {
    if (err)
      return res
        .status(401)
        .json({ message: "アクセストークンが有効ではありません。" });
    req.user = user;
    next();
  });
};
