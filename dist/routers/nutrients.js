"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mysql_1 = __importDefault(require("mysql"));
const authenticate_1 = require("../middlewares/authenticate");
const router = express_1.default.Router();
router.use(express_1.default.json());
const pool = mysql_1.default.createPool({
    host: "us-cdbr-east-05.cleardb.net",
    user: "be3a5ee1ceb501",
    password: "224a4fb1",
    database: "heroku_05e0dc039ab6269",
});
// 全栄養素を取得する
router.get("/nutrientslist", authenticate_1.authenticate, (req, res) => {
    const sql = "select * from nutrients";
    pool.getConnection((err, connection) => {
        connection.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            res.json(result);
            connection.release();
        });
    });
});
// 目安量を新規登録する
router.post("/registestimatedquantity", authenticate_1.authenticate, (req, res) => {
    const sql = "INSERT INTO food_estimated_quantity (classification_id, nutrient_id, food_name_todisplay, unit, standard_quantity, include_disposal) VALUES (?,?,?,?,?,?)";
    pool.getConnection((err, connection) => {
        connection.query(sql, [
            req.body.classificationId,
            req.body.nutrientId,
            req.body.foodNameTodisplay,
            req.body.unit,
            req.body.standardQuantity,
            req.body.includeDisposal,
        ], (err, result) => {
            if (err)
                throw err;
            res.json({ status: "success" });
            connection.release();
        });
    });
});
// 目安量一覧を取得する
router.get("/estimatedquantitylist", authenticate_1.authenticate, (req, res) => {
    const sql = "select * from food_estimated_quantity";
    pool.getConnection((err, connection) => {
        connection.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            res.json(result);
            connection.release();
        });
    });
});
// 目安量を削除する
router.delete("/deleteestimatedquantity", authenticate_1.authenticate, (req, res) => {
    const sql = "delete from food_estimated_quantity WHERE id=?";
    pool.getConnection((err, connection) => {
        connection.query(sql, [req.body.id], function (err, result) {
            if (err) {
                throw err;
            }
            res.json({ status: "success" });
            connection.release();
        });
    });
});
// 目安量を更新する
router.put("/updateestimatedquantity", authenticate_1.authenticate, (req, res) => {
    const sql = "update food_estimated_quantity set food_name_todisplay=?, unit=?, standard_quantity=?, include_disposal=? WHERE id=?";
    pool.getConnection((err, connection) => {
        connection.query(sql, [
            req.body.toDisplayFoodName,
            req.body.unit,
            req.body.standardQuantity,
            req.body.includeDisposal,
            req.body.id,
        ], function (err, result) {
            if (err) {
                throw err;
            }
            res.json({ status: "success" });
            connection.release();
        });
    });
});
exports.default = router;
//# sourceMappingURL=nutrients.js.map