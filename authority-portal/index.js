const express = require("express");
const app = express();
const DB = require("./myDB");
var cors = require("cors");

// parser
app.use(express.static("./public"));
app.use(express.json());
app.use(cors());

// custom modules
const { checkAuth } = require("./middleware/auth");

app.get("/", checkAuth, (request, response) => {
   response.sendFile(__dirname + `/public/index.html`);
});

app.get("/dashboard", checkAuth, async (req, res) => {
   res.sendFile(`dashboard.html`, { root: "./public" });
});

app.get("*", (req, res) => {
   res.sendFile("404.html", { root: "./public" });
});

app.get("/hello", async (req, res) => {
   res.send(JSON.stringify({ data: "hi world !" }));
});

// aadhar related apis
app.post("/doesAadharExist", async (req, res) => {
   let data = await DB.doesAadharExist(req.body.userAddress);
   if (data != null) {
      res.send(JSON.stringify({ value: "true" }));
   } else {
      res.send(JSON.stringify({ value: "false" }));
   }
});

app.post("/addAadhar", async (req, res) => {
   let data = {
      userAddress: req.body.userAddress,
      aadhar: req.body.aadhar,
   };
   try {
      await DB.insertAadharMap(data);
      res.send(JSON.stringify({ success: "true" }));
   } catch (e) {
      console.log(e);
      res.send(JSON.stringify({ success: "false" }));
   }
});

app.post("/getReport", async (req, res) => {
   let data = await DB.getReportByID(req.body.reportID);
   if (data != null) {
      res.send(JSON.stringify(data));
   } else {
      res.send(JSON.stringify({ success: "false" }));
   }
});

app.post("/updateReport", async (req, res) => {
   try {
      await DB.updateRecordByID(req.body);
      res.send(JSON.stringify({ success: "true" }));
   } catch (e) {
      console.log(e);
      res.send(JSON.stringify({ success: "false" }));
   }
});

app.post("/addReport", async (req, res) => {
   try {
      await DB.insertReport(req.body);
      res.send(JSON.stringify({ success: "true" }));
   } catch (e) {
      console.log(e);
      res.send(JSON.stringify({ success: "false" }));
   }
});

// listen for requests :)
// port infos
const port = process.env.PORT || 8000;
app.listen(port, () =>
   console.log(`Example app listening at http://localhost:${port}`)
);
