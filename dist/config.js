"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
// トークンに関する設定
exports.config = {
    jwt: {
        // シークレットキー
        secret: "foidsDWS82Svg",
        options: {
            algorithm: "HS256",
            // トークンの有効時間
            expiresIn: "1d",
        },
    },
};
//# sourceMappingURL=config.js.map