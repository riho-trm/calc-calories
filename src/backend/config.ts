import jwt from "jsonwebtoken";

// トークンに関する設定
export const config = {
  jwt: {
    // シークレットキー
    secret: "foidsDWS82Svg",
    options: {
      algorithm: "HS256" as jwt.Algorithm,
      // トークンの有効時間
      expiresIn: "1d" as string | number,
    },
  },
};
