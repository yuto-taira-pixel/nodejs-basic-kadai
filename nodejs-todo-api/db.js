// db.js
const mysql = require("mysql2/promise");

const dbConfig = {
    host: "localhost",
    port: "3306",
    user: "root",
    password: "",
    database: "nodejs_db_kadai" // 課題指定のDB名
};

const pool = mysql.createPool(dbConfig);

async function closePool() {
    try {
        await pool.end();
        console.log("データベース接続プールを破棄しました。");
    } catch (err) {
        console.error("データベース接続プールの破棄中にエラーが発生しました：", err);
    }
}

async function executeQuery(sql, params = []) {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (err) {
        throw err;
    }
}

module.exports = {
    closePool,
    executeQuery
};