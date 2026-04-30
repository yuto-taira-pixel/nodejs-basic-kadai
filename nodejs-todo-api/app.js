// app.js
const express = require("express");
const app = express();
const PORT = 3000;
const { executeQuery, closePool } = require("./db");

app.use(express.json());

// サーバーエラー共通処理
function handleServerError(res, error, message = "サーバーエラー") {
    console.error(error);
    res.status(500).json({ error: message });
}

// 1. 作成 (POST)
app.post('/todos', async (req, res) => {
    const { title, priority } = req.body;
    try {
        const result = await executeQuery(
            'INSERT INTO todos (title, priority) VALUES (?, ?);',
            [title, priority]
        );
        // ステータスはDBのデフォルト値「未着手」になるため固定で返す
        res.status(201).json({ id: result.insertId, title, priority, status: "未着手" });
    } catch (err) {
        handleServerError(res, err, 'ToDoの追加に失敗しました');
    }
});

// 2. 読み取り (GET)
app.get('/todos', async (req, res) => {
    try {
        const rows = await executeQuery('SELECT * FROM todos;');
        res.status(200).json(rows);
    } catch (err) {
        handleServerError(res, err);
    }
});

// 3. 更新 (PUT)
app.put('/todos/:id', async (req, res) => {
    const { title, priority, status } = req.body;
    const { id } = req.params;
    try {
        const result = await executeQuery(
            'UPDATE todos SET title = ?, priority = ?, status = ? WHERE id = ?;',
            [title, priority, status, id]
        );

        if (result.affectedRows === 0) {
            res.status(404).json({ error: '指定されたToDoは見つかりません' });
        } else {
            res.status(200).json({ id, title, priority, status });
        }
    } catch (err) {
        handleServerError(res, err, 'ToDoの更新に失敗しました');
    }
});

// 4. 削除 (DELETE)
app.delete('/todos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await executeQuery('DELETE FROM todos WHERE id = ?;', [id]);

        if (result.affectedRows === 0) {
            res.status(404).json({ error: '指定されたToDoは見つかりません' });
        } else {
            res.status(200).json({ message: 'ToDoを削除しました' });
        }
    } catch (err) {
        handleServerError(res, err, 'ToDoの削除に失敗しました');
    }
});

// 終了処理
['SIGINT', 'SIGTERM', 'SIGHUP'].forEach(signal => {
    process.on(signal, async () => {
        await closePool();
        process.exit();
    });
});

app.listen(PORT, () => {
    console.log(`${PORT}番ポートでWebサーバーが起動しました。`);
});