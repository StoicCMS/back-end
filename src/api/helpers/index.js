const conn = require("../../dbConfig");

exports.getTables = async () => {
  try {
    const { rows } = await conn.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    return rows;
  } catch (err) {
    return err.message;
  }
};

exports.getOne = async (tableName, primaryColumn, value) => {
  try {
    const getOneQuery = `
      SELECT * FROM ${tableName} WHERE ${primaryColumn}=${value};
    `;

    const res = await conn.query(getOneQuery);

    if (res.rows.length === 0)
      throw new Error(
        `There is no ${primaryColumn}: ${value} in ${tableName} table.`
      );

    return res.rows[0];
  } catch (err) {
    throw new Error(err.message);
  }
};

exports.getList = async (
  tableName,
  orderByColumn,
  orderByDirection,
  searchColumn,
  searchValue,
  page,
  resultsPerPage
) => {
  try {
    if (isNaN(Number(resultsPerPage)) && resultsPerPage !== undefined)
      throw new Error(
        `Results per page expected a number, but got "${resultsPerPage}" instead.`
      );
    const numResults = !resultsPerPage ? 30 : Number(resultsPerPage);
    const currentPage = !page ? 1 : Number(page);
    const search = !searchValue ? "" : searchValue;
    const direction =
      !orderByDirection ||
      orderByDirection === "asc" ||
      orderByDirection === "ASC"
        ? "asc"
        : "desc";

    if (
      orderByDirection !== "asc" &&
      orderByDirection !== "ASC" &&
      orderByDirection !== "desc" &&
      orderByDirection !== "DESC" &&
      orderByDirection !== undefined &&
      orderByDirection !== null
    )
      throw new Error(
        "URL Query Error (orderByDirection): Please enter 'asc' or 'ASC' for ascending order (this is the default behavior if blank) or 'desc' or 'DESC' for descending order."
      );

    const countQuery = !searchColumn
      ? `select count(*) from ${tableName};`
      : `select count(*) from ${tableName} where ${
          Number(search)
            ? `${searchColumn}='${search}'`
            : `${searchColumn} like '%${search}%'`
        };`;

    const { rows: countRows } = await conn.query(countQuery);

    const count = Number(countRows[0].count);
    const totalPages = Math.ceil(count / numResults);

    const offset = (currentPage - 1) * numResults;

    const readQuery = `SELECT * FROM ${tableName}
        ${
          !searchColumn
            ? ""
            : `WHERE ${
                Number(search)
                  ? `${tableName}.${searchColumn}='${search}'`
                  : `${tableName}.${searchColumn} like '%${search}%'`
              }`
        }
        ORDER BY ${
          !orderByColumn
            ? `${
                !searchColumn
                  ? `${tableName}.${tableName.slice(0, -1)}_id`
                  : searchColumn
              }`
            : orderByColumn
        } ${direction}
        LIMIT ${numResults}
        OFFSET ${offset};`;

    const { rows } = await conn.query(readQuery);

    if (totalPages === 0)
      throw new Error(
        `The table you queried exists, but is empty. Please add some data so you can get results back.`
      );

    if (currentPage > totalPages)
      throw new Error(
        `You tried to grab page ${currentPage} but there are only ${totalPages} pages for this query.`
      );

    return {
      currentPage,
      totalPages,
      resultsPerPage: numResults,
      totalResults: count,
      resultsRange: `${offset + 1}-${
        offset + numResults > count ? count : offset + numResults
      }`,
      results: rows,
    };
  } catch (err) {
    throw new Error(err.message);
  }
};

exports.getByJoin = async (
  tableName,
  orderByColumn,
  orderByDirection,
  searchColumn,
  searchValue,
  page,
  resultsPerPage,
  joins
) => {
  try {
    if (isNaN(Number(resultsPerPage)) && resultsPerPage !== undefined)
      throw new Error(
        `Results per page expected a number, but got "${resultsPerPage}" instead.`
      );
    const numResults = !resultsPerPage ? 30 : Number(resultsPerPage);
    const currentPage = !page ? 1 : Number(page);
    const search = !searchValue ? "" : searchValue;
    const direction =
      !orderByDirection ||
      orderByDirection === "asc" ||
      orderByDirection === "ASC"
        ? "asc"
        : "desc";

    if (
      orderByDirection !== "asc" &&
      orderByDirection !== "ASC" &&
      orderByDirection !== "desc" &&
      orderByDirection !== "DESC" &&
      orderByDirection !== undefined &&
      orderByDirection !== null
    )
      throw new Error(
        "URL Query Error (orderByDirection): Please enter 'asc' or 'ASC' for ascending order (this is the default behavior if blank) or 'desc' or 'DESC' for descending order."
      );

    const countQuery = !searchColumn
      ? `select count(*) from ${tableName};`
      : `select count(*) from ${tableName} where ${
          Number(search)
            ? `${searchColumn}='${search}'`
            : `${searchColumn} like '%${search}%'`
        };`;

    const { rows: countRows } = await conn.query(countQuery);

    const count = Number(countRows[0].count);
    const totalPages = Math.ceil(count / numResults);

    const offset = (currentPage - 1) * numResults;

    const readQuery = `SELECT ${tableName}.*, ${joins.map(
      (join) => `${join.joinTable}.*`
    )} FROM ${joins
      .map(() => "(")
      .join(".")
      .replace(",", "")}${tableName}
        INNER JOIN ${joins.map(
          (join) =>
            `${join.joinTable} ON ${join.joinTable}.${join.tableColumn}=${tableName}.${join.joinColumn})`
        )}
        ${
          !searchColumn
            ? ""
            : `WHERE ${
                Number(search)
                  ? `${tableName}.${searchColumn}='${search}'`
                  : `${tableName}.${searchColumn} like '%${search}%'`
              }`
        }
        ORDER BY ${
          !orderByColumn
            ? `${
                !searchColumn
                  ? `${tableName}.${tableName.slice(0, -1)}_id`
                  : tableName + "." + searchColumn
              }`
            : orderByColumn
        } ${direction}
        LIMIT ${numResults}
        OFFSET ${offset};`;

    console.log("Query:", readQuery);
    const { rows } = await conn.query(readQuery);
    console.log("Results:", rows);

    if (totalPages === 0)
      throw new Error(
        `The table you queried exists, but is empty. Please add some data so you can get results back.`
      );

    if (currentPage > totalPages)
      throw new Error(
        `You tried to grab page ${currentPage} but there are only ${totalPages} pages for this query.`
      );

    return {
      currentPage,
      totalPages,
      resultsPerPage: numResults,
      totalResults: count,
      resultsRange: `${offset + 1}-${
        offset + numResults > count ? count : offset + numResults
      }`,
      results: rows,
    };
  } catch (err) {
    throw new Error(err.message);
  }
};

// interface Column {
//   name: String;
//   dataType?: String;
//   size?: Number;
//   notNUll?: Boolean;
//   unique?: Boolean;
//   defaultValue?: typeof dataType;
//   primaryKey?: Boolean;
//   foreignKey?: {
//     table: String,
//     column?: String,
//     onDelete?: "CASCADE" | "RESTRICT" | "SET NULL" | "SET DEFAULT",
//     onUpdate?: "CASCADE" | "RESTRICT" | "SET NULL" | "SET DEFAULT",
//   };
// }

exports.createTable = async (tableName, columns) => {
  try {
    const table =
      tableName.slice(-1) === "s" ? tableName.slice(0, -1) : tableName;
    const createTableQuery = `
      CREATE TABLE ${table}s (
        ${table}_id SERIAL PRIMARY KEY,
        ${columns.map(
          (column) =>
            `${column.name} ${column.dataType}${
              !column.size ? "" : `(${column.size})`
            } ${!column.notNull ? "" : "NOT NULL"} ${
              !column.unique ? "" : "UNIQUE"
            } ${
              !column.defaultValue ? "" : `DEFAULT '${column.defaultValue}'`
            } ${!column.primaryKey ? "" : "PRIMARY KEY"} ${
              !column.foreignKey
                ? ""
                : `REFERENCES ${column.foreignKey.table}(${
                    column.foreignKey.column
                  }) ${
                    !column.foreignKey.onDelete
                      ? ""
                      : `ON DELETE ${column.foreignKey.onDelete}`
                  } ${
                    !column.foreignKey.onUpdate
                      ? ""
                      : `ON UPDATE ${column.foreignKey.onUpdate}`
                  }`
            }`
        )}
      );
    `;

    console.log(createTableQuery);
    const res = await conn.query(createTableQuery);

    return res;
  } catch (err) {
    throw new Error(err.message);
  }
};

// interface AlterColumn {
//   alter: "ADD" | "RENAME COLUMN" | "DROP COLUMN" | "MODIFY";
//   name: String;
//   newValue?: String;
//   dataType?: String;
//   size?: Number;
//   notNUll?: Boolean;
//   unique?: Boolean;
//   defaultValue?: typeof dataType;
//   primaryKey?: Boolean;
// }

exports.updateTable = async (tableName, columns) => {
  try {
    const updateTableQuery = `
        ${columns
          .map(
            (column) =>
              `ALTER TABLE ${tableName} ${column.alter} ${column.name} ${
                !column.newValue ? "" : `TO ${column.newValue}`
              } ${!column.dataType ? "" : column.dataType}${
                !column.size ? "" : `(${column.size})`
              } ${!column.notNull ? "" : "NOT NULL"} ${
                !column.unique ? "" : "UNIQUE"
              } ${
                !column.defaultValue ? "" : `DEFAULT '${column.defaultValue}'`
              } ${!column.primaryKey ? "" : "PRIMARY KEY"};`
          )
          .join(",")
          .replace(",", "")}
    `;

    console.log(updateTableQuery);
    const res = await conn.query(updateTableQuery);

    return res;
  } catch (err) {
    throw new Error(err.message);
  }
};

// interface FK_Column {
//   alter: "ADD" | "DROP";
//   tableName: String,
//   columnName: String;
//   column: String,
//   onDelete?: "CASCADE" | "RESTRICT" | "SET NULL" | "SET DEFAULT",
//   onUpdate?: "CASCADE" | "RESTRICT" | "SET NULL" | "SET DEFAULT",
// }

exports.foreignKeyConstraint = async ({
  alter,
  tableName,
  columnName,
  fkTable,
  fkColumn,
  onDelete,
  onUpdate,
}) => {
  try {
    const foreignKeyQuery = `
        ${`ALTER TABLE ${tableName} ${alter} FOREIGN KEY (${columnName}) REFERENCES ${fkTable}(${fkColumn}) ${
          !onDelete ? "" : `ON DELETE ${onDelete}`
        } ${!onUpdate ? "" : `ON UPDATE ${onUpdate}`};`}
    `;

    console.log(foreignKeyQuery);
    const res = await conn.query(foreignKeyQuery);

    return res;
  } catch (err) {
    throw new Error(err.message);
  }
};

exports.deleteTable = async (tableName) => {
  try {
    const dropTableQuery = `DROP TABLE ${tableName}`;

    console.log(dropTableQuery);
    const res = await conn.query(dropTableQuery);

    return res;
  } catch (err) {
    throw new Error(err.message);
  }
};

exports.addRecords = async (tableName, records) => {
  try {
    const dropTableQuery = `${records
      .map(
        (record) =>
          `INSERT INTO ${tableName} (${Object.keys(record).map(
            (key) => key
          )}) VALUES (${Object.keys(record).map(
            (key) => `'${record[key]}'`
          )}) RETURNING *;`
      )
      .join(",")
      .replaceAll(",I", " I")}`;

    console.log(dropTableQuery);
    const res = await conn.query(dropTableQuery);
    const data = res.map((obj) => obj.rows[0]);
    // console.log(data);

    return data;
  } catch (err) {
    throw new Error(err.message);
  }
};
