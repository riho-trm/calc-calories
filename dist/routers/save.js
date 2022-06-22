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
router.post("/savemydata", authenticate_1.authenticate, (req, res) => {
    const sql = "INSERT INTO saved_data (user_id, title, memo, url) VALUES (?,?,?,?)";
    pool.getConnection((err, connection) => {
        connection.query(sql, [req.body.userId, req.body.title, req.body.memo, req.body.url], (err, result) => {
            if (err)
                throw err;
            res.json({ status: "success", insertId: result.insertId });
            connection.release();
        });
    });
});
router.post("/savemynutrients", authenticate_1.authenticate, (req, res) => {
    const sql = 
    // 配列でinsertするときのvaluesは?ひとつのみ
    "INSERT INTO saved_nutrients (saved_data_id, nutrient_id, quantity) VALUES ?";
    pool.getConnection((err, connection) => {
        connection.query(sql, [req.body], (err, result) => {
            if (err)
                throw err;
            res.json({ status: "success", res: result });
            connection.release();
        });
    });
});
router.get("/getmydata", authenticate_1.authenticate, (req, res) => {
    const sql = "SELECT * FROM saved_data WHERE user_id=?";
    // getメソッドで絞り込み条件を渡す際にはqueryに渡す
    pool.getConnection((err, connection) => {
        connection.query(sql, [req.query.userId], (err, result) => {
            if (err)
                throw err;
            res.json({ status: "success", myData: result });
            connection.release();
        });
    });
});
router.get("/getmynutrients", authenticate_1.authenticate, (req, res) => {
    const sql = "SELECT * FROM saved_nutrients WHERE saved_data_id in (?)";
    pool.getConnection((err, connection) => {
        connection.query(sql, [req.query.savedDataId], (err, result) => {
            if (err)
                throw err;
            res.json({ status: "success", myNutrients: result });
            connection.release();
        });
    });
});
// ok
router.put("/updatesaveddata", authenticate_1.authenticate, (req, res) => {
    const sql = "update saved_data set title=?, memo=?, url=? WHERE id=?";
    pool.getConnection((err, connection) => {
        connection.query(sql, [req.body.title, req.body.memo, req.body.url, req.body.savedDataId], function (err, result) {
            if (err) {
                throw err;
            }
            res.json({ status: "success" });
            connection.release();
        });
    });
});
// ok
router.put("/updatesavednutrients", authenticate_1.authenticate, (req, res) => {
    const sql = "INSERT INTO saved_nutrients (id, saved_data_id, nutrient_id, quantity) VALUES ? ON DUPLICATE KEY UPDATE quantity=VALUES(quantity)";
    pool.getConnection((err, connection) => {
        connection.query(sql, [req.body.editedData], function (err, result) {
            if (err) {
                throw err;
            }
            res.json({ status: "success" });
            connection.release();
        });
    });
});
// ok
router.delete("/deletesavednutrients", authenticate_1.authenticate, (req, res) => {
    const sql = "delete from saved_nutrients WHERE id in (?)";
    pool.getConnection((err, connection) => {
        connection.query(sql, [req.body.savedNutrientsId], function (err, result) {
            if (err) {
                throw err;
            }
            res.json({ status: "success" });
            connection.release();
        });
    });
});
// ok
router.delete("/deletemydata", authenticate_1.authenticate, (req, res) => {
    const sevedDataSql = "delete from saved_data WHERE id=?";
    const savedNutrientsSql = "delete from saved_nutrients WHERE saved_data_id=?";
    pool.getConnection((err, connection) => {
        connection.query(savedNutrientsSql, [req.body.savedDataId], function (err, result) {
            if (err) {
                throw err;
            }
            connection.query(sevedDataSql, [req.body.savedDataId], function (err, result) {
                if (err) {
                    throw err;
                }
                connection.release();
            });
            res.json({ status: "success" });
            connection.release();
        });
        connection.query(sevedDataSql, [req.body.savedDataId], function (err, result) {
            if (err) {
                throw err;
            }
            res.json({ status: "success" });
            connection.release();
        });
    });
});
exports.default = router;
//# sourceMappingURL=save.js.map