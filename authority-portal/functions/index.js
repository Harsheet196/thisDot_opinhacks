const express = require("express");
const app = express();
const DB = require("./myDB")
var cors = require('cors')


// parser
app.use(express.static("../public"));
app.use(express.json());
app.use(cors())

app.get("/", (request, res) => {
    res.sendFile(__dirname + "../public/index.html");
});


app.get("/hello", async (req, res) => {
    let data = await DB.doesAadharExist("123")
    console.log(data);
    res.send(JSON.stringify({ data: "hi world !" }))
})


// listen for requests :)
// port infos
const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))


// const functions = require('firebase-functions')
// exports.app = functions.https.onRequest(app)