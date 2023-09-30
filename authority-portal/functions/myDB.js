const { MongoClient } = require("mongodb");
const dotenv = require('dotenv').config();

const uri = process.env.URL;
// console.log(uri);
let client;

try {

    client = new MongoClient(uri);
    console.log("DB connected");
} catch (err) {
    console.log(err);
}


// make the link
// var users = mongoose.model("users", userSchema);
const database = client.db('spotlight');
const users = database.collection('users');
const reports = database.collection('reports');


const insertAadharMap = async (data) => {
    try {
        await users.insertOne(data)
        console.log("Successful added aadhar mapping");
    } catch (e) {
        console.log("Error while adding data to aadhar");
        console.log(e);
    }
}

const doesAadharExist = async (address) => {
    // console.log(address);
    let query = { userAddress: address };
    try {
        let res = await users.findOne(query);
        console.log(res);
        console.log("user and aadhar exists");
        return res
    } catch (e) {
        console.log("error while getting aadhar record");
        return null
    }
};

const insertReport = async (data) => {
    try {
        await reports.insertOne(data)
        console.log("Successful addition of report");
    } catch (e) {
        console.log("Error while adding data to reports");
        console.log(e);
    }
}
const getReportByID = async (ID) => {
    let query = { reportID: ID };
    try {
        let res = await reports.findOne(query);
        console.log(res);
        return res
    } catch (e) {
        console.log("error while getting report");
        return null
    }
}

const updateRecordByID = async (data) => {
    let query = { reportID: data.reportID };
    try {
        let res = await reports.findOneAndUpdate(query, { $set: data });
        console.log("updated report record");
    } catch (e) {
        console.log("error while updating report");
        console.log(e);
        return null
    }
}

// insertAadharMap({ "userAddress": "abcd", "aadhar": "hello" })
// doesAadharExist("abcd")
// insertReport({
//     reportID: "123",
//     status: "pending",
//     remark: "no remark",
//     warrant: "false"
// })
// getReportByID("123")
// updateRecordByID({
//     reportID: "123",
//     status: "done",
//     remark: "no remark",
//     warrant: "false"
// })
// getReportByID("123")
module.exports = { insertAadharMap, doesAadharExist, insertReport, getReportByID, updateRecordByID };
