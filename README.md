# Routes

## Get All Tables

Gets the names of all the tables in your database

GET: `/api/read/all-tables`

## Create Table

Creates a new table in your database. You can add all kinds of columns and set up things like foreign keys. Automatically adds id's to every table.

POST: `/api/create-table`

Body interface:

```typescript
interface Body {
  tableName: !String;
  columns: AlterColumn[];
}
interface AlterColumn {
  alter: "ADD" | "RENAME COLUMN" | "DROP COLUMN" | "MODIFY";
  name: String;
  newValue?: String;
  dataType?: String;
  size?: Number;
  notNUll?: Boolean;
  unique?: Boolean;
  defaultValue?: typeof dataType;
  primaryKey?: Boolean;
}
```

Example:

```json
{
  "tableName": "post",
  "columns": [
    {
      "name": "title",
      "dataType": "VARCHAR",
      "size": 255,
      "notNUll": true,
      "unique": false
    },
    {
      "name": "body",
      "dataType": "TEXT",
      "notNUll": true,
      "unique": true
    },
    {
      "name": "author",
      "dataType": "int",
      "notNUll": true,
      "unique": false,
      "foreignKey": {
        "table": "users",
        "column": "user_id",
        "onDelete": "CASCADE",
        "onUpdate": "CASCADE"
      }
    }
  ]
}
```

## Update Table

Updates a table in your database. Can rename columns, change their data type, give them default values. Modify to your hearts desire.

PUT: `/api/update-table`

Body interface:

```typescript
interface Body {
  tableName: !String;
  columns: Column[];
}
interface Column {
  name: String;
  dataType?: String;
  size?: Number;
  notNUll?: Boolean;
  unique?: Boolean;
  defaultValue?: typeof dataType;
  primaryKey?: Boolean;
  foreignKey?: {
    table: String;
    column?: String;
    onDelete?: "CASCADE" | "RESTRICT" | "SET NULL" | "SET DEFAULT";
    onUpdate?: "CASCADE" | "RESTRICT" | "SET NULL" | "SET DEFAULT";
  };
}
```

Example:

```json
{
  "tableName": "posts",
  "columns": [
    {
      "alter": "RENAME COLUMN",
      "name": "author",
      "newValue": "user_id"
    }
  ]
}
```

## Modify Foreign Key Constraint

Add or drop foreign key constraints on columns.

PUT: `/api/fk-constraint`

Body interface:

```typescript
interface Body {
  alter: "ADD" | "DROP";
  tableName: String;
  columnName: String;
  column: String;
  onDelete?: "CASCADE" | "RESTRICT" | "SET NULL" | "SET DEFAULT";
  onUpdate?: "CASCADE" | "RESTRICT" | "SET NULL" | "SET DEFAULT";
}
```

Example:

```json
{
  "alter": "ADD",
  "tableName": "comments",
  "columnName": "author",
  "fkTable": "users",
  "fkColumn": "user_id",
  "onDelete": "CASCADE"
}
```

## Drop Table

Drops a table from your database.

DELETE: `/api/delete/:table`

Example: `/api/delete/users`

## Get Record By Primary/Unique Key

Gets one record from a table by a primary or unique key.

GET: `/api/read/:uniqueKey/:value`

Examples:
`/api/read/users/user_id/1`
`/api/read/users/email/email@gmail.com`

## Get Many (Paginated) Records

Gets back a list of many records. Handles pagination, searching, filtering, and ordering.

GET: `/api/read/:tableName`

Also has a ton of query variables to help modify your results

```typescript
let orderByColumn?: string; // defaults to the ID column
let orderByDirection?: "ASC" | "asc" | "DESC" | "desc"; // default "asc"
let searchColumn?: string;
let searchValue?: number | string;
let page?: number; // default 1
let resultsPerPage?: number; // default 30
```

Example: `/api/read/posts?searchColumn=author&searchValue=2&orderByColumn=publishedDate&orderByDirection=desc&resultsPerPage=15&page=2`

## Get Many (Not Paginated) Records

> **TODO**

Gets back a list of many records that is not paginated. Handles searching, filtering, and ordering.

GET: `/api/read-all/:tableName`

Also has a ton of query variables to help modify your results

```typescript
let orderByColumn?: string; // defaults to the ID column
let orderByDirection?: "ASC" | "asc" | "DESC" | "desc"; // default "asc"
let searchColumn?: string;
let searchValue?: number | string;
```

Example: `/api/read-all/posts?searchColumn=author&searchValue=2&orderByColumn=publishedDate&orderByDirection=desc`

## Add Record(s) To Table

Adds a new record, or records, in the database that match the schema of the table you are adding them too.

POST: `/api/add-records/:tableName`

Body interface:

```typescript
interface Body {
  records: TableSchema[];
}
```

Example:

```json
{
  "tableName": "post",
  "columns": [
    {
      "title": "Title 1",
      "body": "Content 1 goes here.",
      "author": 1
    },
    {
      "title": "Title 2",
      "body": "Content 2 goes here.",
      "author": 2
    },
    {
      "title": "Title 3",
      "body": "Content 3 goes here.",
      "author": 1
    },
    {
      "title": "Title 4",
      "body": "Content 4 goes here.",
      "author": 2
    }
  ]
}
```

> **TODO**: Edit Record Route

> **TODO**: Delete Record Route

## Join Table Query

Paginated query with all the query variables for searching, filtering, and ordering to it. Joins tables through foreign keys to table info.

POST: `/api/join/:tableName`

Body interface:

```typescript
interface Body {
  records: JoinObject[];
}
interface JoinObject {
  joinTable: string;
  tableColumn: string;
  joinColumn: string;
}
```

Example: `/api/join/posts?searchValue=2&searchColumn=user_id`

```json
[
  {
    "joinTable": "users",
    "tableColumn": "user_id",
    "joinColumn": "user_id"
  }
]
```

Response:

```json
{
  "currentPage": 1,
  "totalPages": 1,
  "resultsPerPage": 30,
  "totalResults": 2,
  "resultsRange": "1-2",
  "results": [
    {
      "post_id": 4,
      "title": "Title 2",
      "body": "Content 2 goes here.",
      "user_id": 2,
      "name": "Paige"
    },
    {
      "post_id": 6,
      "title": "Title 4",
      "body": "Content 4 goes here.",
      "user_id": 2,
      "name": "Paige"
    }
  ]
}
```
