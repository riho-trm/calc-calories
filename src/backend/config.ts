import jwt from "jsonwebtoken";

// トークンに関する設定
export const config = {
  jwt: {
    // シークレットキー
    secret: process.env.SECRET,
    options: {
      algorithm: process.env.ALG as jwt.Algorithm,
      // トークンの有効時間
      expiresIn: "1d" as string | number,
    },
  },
};
