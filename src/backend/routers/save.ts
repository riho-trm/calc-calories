import express from "express";
import mysql from "mysql";
import { authenticate } from "../middlewares/authenticate";

const router: express.Router = express.Router();
router.use(express.json());

const pool = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASS,
  database: process.env.DB,
});

// myデータを新規登録する
router.post("/savemydata", authenticate, (req, res) => {
  const sql =
    "INSERT INTO saved_data (user_id, title, memo, url) VALUES (?,?,?,?)";
  pool.getConnection((err, connection) => {
    connection.query(
      sql,
      [req.body.userId, req.body.title, req.body.memo, req.body.url],
      (err, result) => {
        if (err) throw err;
        res.json({ status: "success", insertId: result.insertId });
        connection.release();
      }
    );
  });
});

// myデータに紐づく栄養情報を登録する
router.post("/savemynutrients", authenticate, (req, res) => {
  const sql =
    // 配列でinsertするときのvaluesは?ひとつのみ
    "INSERT INTO saved_nutrients (saved_data_id, nutrient_id, quantity) VALUES ?";
  pool.getConnection((err, connection) => {
    connection.query(sql, [req.body], (err, result) => {
      if (err) throw err;
      res.json({ status: "success", res: result });
      connection.release();
    });
  });
});

// ユーザーidに基づくmyデータを取得する
router.get("/getmydata", authenticate, (req, res) => {
  const sql = "SELECT * FROM saved_data WHERE user_id=?";
  // getメソッドで絞り込み条件を渡す際にはqueryに渡す
  pool.getConnection((err, connection) => {
    connection.query(sql, [req.query.userId], (err, result) => {
      if (err) throw err;
      res.json({ status: "success", myData: result });
      connection.release();
    });
  });
});

// myデータに紐づく栄養情報を取得する
router.get("/getmynutrients", authenticate, (req, res) => {
  const sql = "SELECT * FROM saved_nutrients WHERE saved_data_id in (?)";
  pool.getConnection((err, connection) => {
    connection.query(sql, [req.query.savedDataId], (err, result) => {
      if (err) throw err;
      res.json({ status: "success", myNutrients: result });
      connection.release();
    });
  });
});

// myデータを更新する
router.put("/updatesaveddata", authenticate, (req, res) => {
  const sql = "update saved_data set title=?, memo=?, url=? WHERE id=?";
  pool.getConnection((err, connection) => {
    connection.query(
      sql,
      [req.body.title, req.body.memo, req.body.url, req.body.savedDataId],
      function (err, result) {
        if (err) {
          throw err;
        }
        res.json({ status: "success" });
        connection.release();
      }
    );
  });
});

// myデータに紐づく栄養情報を更新する
router.put("/updatesavednutrients", authenticate, (req, res) => {
  const sql =
    "INSERT INTO saved_nutrients (id, saved_data_id, nutrient_id, quantity) VALUES ? ON DUPLICATE KEY UPDATE quantity=VALUES(quantity)";
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

// myデータに紐づく栄養素を削除する
router.delete("/deletesavednutrients", authenticate, (req, res) => {
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

// myデータを削除する（紐づく栄養素も削除）
router.delete("/deletemydata", authenticate, (req, res) => {
  const sevedDataSql = "delete from saved_data WHERE id=?";
  const savedNutrientsSql = "delete from saved_nutrients WHERE saved_data_id=?";
  pool.getConnection((err, connection) => {
    connection.query(
      savedNutrientsSql,
      [req.body.savedDataId],
      function (err, result) {
        if (err) {
          throw err;
        }
        connection.query(
          sevedDataSql,
          [req.body.savedDataId],
          function (err, result) {
            if (err) {
              throw err;
            }
            connection.release();
          }
        );
        res.json({ status: "success" });
        connection.release();
      }
    );

    connection.query(
      sevedDataSql,
      [req.body.savedDataId],
      function (err, result) {
        if (err) {
          throw err;
        }
        res.json({ status: "success" });
        connection.release();
      }
    );
  });
});

export default router;
