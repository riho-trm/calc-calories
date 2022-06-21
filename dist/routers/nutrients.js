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
const connection = mysql_1.default.createConnection({
    host: "localhost",
    user: "root",
    password: "ri-noahn8a",
    database: "calcCalories",
});
router.get("/nutrientslist", authenticate_1.authenticate, (req, res) => {
    const sql = "select * from nutrients";
    connection.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});
router.post("/registestimatedquantity", authenticate_1.authenticate, (req, res) => {
    const sql = "INSERT INTO food_estimated_quantity (classification_id, nutrient_id, food_name_todisplay, unit, standard_quantity, include_disposal) VALUES (?,?,?,?,?,?)";
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
        console.log("サーバーのestimatedQuantity登録の結果");
        console.log(result);
        res.json({ status: "success" });
    });
});
router.get("/estimatedquantitylist", authenticate_1.authenticate, (req, res) => {
    const sql = "select * from food_estimated_quantity";
    connection.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});
router.delete("/deleteestimatedquantity", authenticate_1.authenticate, (req, res) => {
    const sql = "delete from food_estimated_quantity WHERE id=?";
    connection.query(sql, [req.body.id], function (err, result) {
        if (err) {
            throw err;
        }
        res.json({ status: "success" });
    });
});
router.put("/updateestimatedquantity", authenticate_1.authenticate, (req, res) => {
    const sql = "update food_estimated_quantity set food_name_todisplay=?, unit=?, standard_quantity=?, include_disposal=? WHERE id=?";
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
    });
});
exports.default = router;
//# sourceMappingURL=nutrients.js.map