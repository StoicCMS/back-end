const express = require("express");
const db = require("./helpers");
const path = require("path");

const rootRouter = express.Router();

rootRouter.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "../html/api.html"));
});

rootRouter.get("/read/all-tables", async (_, res) => {
  try {
    const rows = await db.getTables();
    res.status(200).json(rows);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

rootRouter.get("/read/:tableName", async (req, res) => {
  try {
    const { tableName } = req.params;
    const {
      orderByColumn,
      orderByDirection,
      searchColumn,
      searchValue,
      page,
      resultsPerPage,
    } = req.query;
    console.log("query:", req.query);
    const rows = await db.getList(
      tableName,
      orderByColumn,
      orderByDirection,
      searchColumn,
      searchValue,
      page,
      resultsPerPage
    );
    res.status(200).json(rows);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
});

rootRouter.post("/join/:tableName", async (req, res) => {
  try {
    const { tableName } = req.params;
    const {
      orderByColumn,
      orderByDirection,
      searchColumn,
      searchValue,
      page,
      resultsPerPage,
    } = req.query;
    console.log("query:", req.query);
    const rows = await db.getByJoin(
      tableName,
      orderByColumn,
      orderByDirection,
      searchColumn,
      searchValue,
      page,
      resultsPerPage,
      req.body
    );
    res.status(200).json(rows);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
});

rootRouter.get("/read/:tableName/:primaryColumn/:value", async (req, res) => {
  try {
    const { tableName, primaryColumn, value } = req.params;
    const result = await db.getOne(tableName, primaryColumn, value);

    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
});

rootRouter.post("/create-table", async (req, res) => {
  try {
    const { tableName, columns } = req.body;
    await db.createTable(tableName, columns);

    res.status(200).json({ message: "success" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

rootRouter.put("/update-table", async (req, res) => {
  try {
    const { tableName, columns } = req.body;
    await db.updateTable(tableName, columns);

    res.status(200).json({ message: "success" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

rootRouter.put("/fk-constraint", async (req, res) => {
  try {
    await db.foreignKeyConstraint(req.body);

    res.status(200).json({ message: "success" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

rootRouter.delete("/delete/:tableName", async (req, res) => {
  try {
    await db.deleteTable(req.params.tableName);

    res.status(200).json({ message: "success" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

rootRouter.post("/add-records/:tableName", async (req, res) => {
  try {
    const { tableName } = req.params;
    const { records } = req.body;
    const newColumns = await db.addRecords(tableName, records);

    res.status(200).json({ table: tableName, newColumns });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = rootRouter;
