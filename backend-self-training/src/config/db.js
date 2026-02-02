import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "ling_tien_kung_db",
  timezone: "+07:00",
});

export default db;
