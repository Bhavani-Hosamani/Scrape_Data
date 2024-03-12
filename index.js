var fetchuser = require("./middleware/fetchuser");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
var Jwt = require("jsonwebtoken");
// const multer = require("multer");
const path = require("path");
const axios = require("axios");

const PORT = 5000;

const Jwtkey = "bhavani@H123";

const app = express();
app.use(cors());
app.use(express.json());

const db = new Pool({
  host: "localhost",
  user: "postgres",
  password: "root",
  database: "crud",
  port: "5432",
});

db.connect(function (err) {
  if (err) {
    console.error("Error connecting to database:", err);
  } else {
    console.log("Connected to database!");
  }
});

app.post("/apiData", async (req, res) => {
  const rowData = req.body;
  // console.log("Received data:", rowData);

  try {
    const client = await db.connect();
    console.log("Connected to database");

    for (const item of rowData) {
      const {
        Rank,
        Name,
        Industry,
        "Revenue (USD millions)": Revenue,
        "Revenue growth": Revenue_growth,
        Employees,
        Headquarters,
      } = item;

      const insertQuery =
        'INSERT INTO company("Rank", "Name", "Industry", "Revenue", "Revenue_growth", "Employees", "Headquarters") VALUES ($1,$2,$3,$4,$5,$6,$7)';
      await client.query(insertQuery, [
        Rank,
        Name,
        Industry,
        Revenue,
        Revenue_growth,
        Employees,
        Headquarters,
      ]);
 
      console.log("Data inserted successfully:", item);
    }
    console.log("All data inserted successfully");

    res.status(200).send("Data inserted successfully");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

// // Set up multer for handling file uploads
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/"); // Specify the directory where uploaded files will be stored
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname)); // Specify the file name
//   },
// });

// const upload = multer({ storage: storage });

// // Handle POST request to /uploadfile endpoint
// app.post("/uploadfile", upload.single("file"), (req, res) => {
//   // If file upload is successful, req.file contains the uploaded file details
//   if (!req.file) {
//     return res.status(400).send("No files were uploaded.");
//   }

//   // Here, you can process the uploaded file as needed (e.g., save to database, return data to client)
//   // For simplicity, let's just send back a success response with the file details
//   res.status(200).json({
//     filename: req.file.filename,
//     mimetype: req.file.mimetype,
//     size: req.file.size,
//   });
// });

app.post("/addstudents", fetchuser, async (req, res) => {
  const { rollnumber, name, email, phonenumber } = req.body;

  if (!rollnumber || !name || !email || !phonenumber) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // const sql = "insert into companies (rank,name)values(1,'ab')";
  ("INSERT INTO student (rollnumber, name, email, phonenumber) VALUES ($1, $2, $3, $4)");

  const values = [rollnumber, name, email, phonenumber];

  try {
    const result = await db.query(sql, values);
    // console.log("response2", res);
    console.log("Student added to the database", result);
    return res
      .status(200)
      .json({ message: "Student added to the database", result });
  } catch (error) {
    console.log("error from addstudents", error);
    console.error("Error inserting student:", error);
    return res.status(500).json({ error: "Error inserting student" });
  }
});

app.get("/getstudents", fetchuser, async (req, res) => {
  try {
    const { rows: results } = await db.query("SELECT * FROM student");

    console.log("Students selected from the database");
    return res.status(200).json({
      message: "Students selected from the database",
      values: results,
    });
  } catch (err) {
    console.error("Error selecting students:", err);
    return res.status(500).json({ error: "Error selecting students" });
  }
});

app.post("/signup", async (req, res) => {
  // console.log("hello");
  try {
    const sql = "INSERT INTO login (name, email, password) VALUES ($1, $2, $3)";
    let data = { status: "Success" };
    const values = [req.body.name, req.body.email, req.body.password];
    await db.query(sql, values);
    console.log("User added to the database");
    return res.json(data);
  } catch (error) {
    console.log(error);
    return res.json("Error");
  }
});

app.post("/login", async (req, res) => {
  try {
    const sql = "SELECT * FROM login WHERE email=$1 AND password=$2";
    const result = await db.query(sql, [req.body.email, req.body.password]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      delete user.password;
      const token = Jwt.sign({ user }, Jwtkey, { expiresIn: "1m" });
      return res.json({ status: "success", user, auth: token });
    } else {
      return res.json({ status: "failed", error: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/getstudentscount", fetchuser, async (req, res) => {
  try {
    const { rows: results } = await db.query(
      // "select count(rollnumber) from student"

      (rows = "insert into company(rank,name)values(1,'ab')")
    );

    console.log("total students from the database");
    return res.status(200).json({
      message: "total students from the database",
      values: results,
    });
  } catch (err) {
    console.error("Error selecting students:", err);
    return res.status(500).json({ error: "Error selecting students" });
  }
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
