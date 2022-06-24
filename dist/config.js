"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
// トークンに関する設定
exports.config = {
    jwt: {
        // シークレットキー
        secret: process.env.SECRET,
        options: {
            algorithm: process.env.ALG,
            // トークンの有効時間
            expiresIn: "1d",
        },
    },
};
//# sourceMappingURL=config.js.map