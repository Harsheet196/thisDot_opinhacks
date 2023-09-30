import { Web3Storage } from "https://cdn.jsdelivr.net/npm/web3.storage/dist/bundle.esm.min.js";


let tokenInput =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGVFOTE5N0UzZjg4NDVERDZFREI0MjAwMzUyNDkwZGRiNDYwMWI2QjYiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NzU4Nzc5Mjk5ODgsIm5hbWUiOiJ0ZW1wIn0.3NRcLALJLP1Noh48GThYaHGkL_CMaMysCNxmQ6l-VKY";
const token = tokenInput;

let reportProxy = null
let yourApplications = [];
let currApp = -1

window.onload = async () => {

    reportProxy = new ReportProxy()

    await connect();

    document.getElementById("submit-aadhar").onclick = () => {
        document.getElementById("aadhar-bg").style.display = "none"
        document.getElementsByClassName("aadhar-write")[0].style.display = "none"
    }

    document.getElementById("showAll").onclick = async () => {
        await getAllApplications();
    }

    document.getElementById("showYour").onclick = async () => {
        startLoad()
        await getYourApplication();
        endLoad()
    }

    document.getElementById("showProfile").onclick = async () => {
        startLoad()
        await getProfileInfo();
        endLoad()
    }

    document.getElementById("create").addEventListener("click", create);

    document.getElementsByClassName("writeclose")[0].onclick = () => {
        document.getElementsByClassName("app-write")[0].style.display = "none"
    }

    document.getElementById("create-btn").onclick = () => {
        document.getElementsByClassName("app-write")[0].style.display = "flex"
    }

    document.getElementsByClassName("view-close")[0].onclick = () => {
        document.getElementById("dialog-view").style.display = "none"
        currApp = -1
    }

    document.getElementById("upvote").onclick = async () => {
        // console.log("in up-votes")
        // console.log(yourApplications[currApp]);

        if (reportProxy == null) return;

        startLoad()

        try {
            await reportProxy.voteReport(yourApplications[currApp]["id"])
            console.log("Up-voted");
        } catch (error) {
            console.log("error in up voting");
            console.log(error);
        }

        try {
            await getAllApplications()
        } catch (error) {
            console.log("error while updating main dashboard");
        }

        endLoad()
    }


    let blocks = document.getElementsByClassName("block")
    for (let i = 0; i < blocks.length; ++i) {
        blocks[i].addEventListener("click", () => {
            let temp = document.getElementsByClassName("block")
            for (let j = 0; j < temp.length; ++j) {
                temp[j].classList.remove("nav-active")
                temp[j].classList.add("nav-btn")
            }
            temp[i].classList.remove("nav-btn")
            temp[i].classList.add("nav-active")
        })
    }
    blocks[0].click()
}

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const connect = async () => {
    if (reportProxy == null) return;
    startLoad()
    await reportProxy.connect()
    console.log("on connect: account details");
    console.log(reportProxy.account);

    await sleep(400)
    endLoad()
}

const getAllApplications = async () => {
    if (reportProxy == null) return;

    startLoad()
    let res = await reportProxy.getAllApplicationsID();
    console.log(`all applications fetched`);
    console.log(res);

    await sleep(200)
    endLoad()

    yourApplications = []
    for (let i = 0; i < res.length; ++i) {
        // console.log(res[i]);
        let temp = await reportProxy.getApplicationByID(res[i]);
        console.log(temp);

        let data = {}
        data["id"] = temp[0];
        data["subject"] = temp[1];
        data["description"] = temp[2];
        data["file"] = temp[3];
        data["location"] = temp[4];
        data["applierAddress"] = temp[5];
        data["votes"] = temp[6];
        yourApplications.push(data)
    }
    buildCards(yourApplications)
}

const create = async () => {
    // name, subject, description, recipients, institute, fileLink
    if (reportProxy == null) return;
    startLoad()
    let subject = document.getElementById("subject-input").value;
    let description = document.getElementById("description-input").innerText;
    let location = document.getElementById("location-input").value;
    let fileLink = await getFileLink();

    console.log(subject);
    console.log(description);
    console.log(location);
    console.log(fileLink);
    try {
        await reportProxy.createApplication(subject, description, location, fileLink);
        console.log("application created: ");
        document.getElementsByClassName("app-write")[0].style.display = "none"
    } catch (e) {
        console.log("error while creating report application");
        console.log(e);
    }

    try {
        await getAllApplications()
    } catch (error) {
        console.log("error while updating main dashboard");
    }

    endLoad()
    document.getElementsByClassName("app-write")[0].style.display = "none"
}

const getYourApplication = async () => {
    if (reportProxy == null) return;
    let res = await reportProxy.getApplicationByAddress()
    // console.log(res);

    yourApplications = []
    for (let i = 0; i < res.length; ++i) {
        // console.log(res[i]);
        let temp = await reportProxy.getApplicationByID(res[i]);
        // console.log(temp);

        let data = {}
        data["id"] = temp[0];
        data["subject"] = temp[1];
        data["description"] = temp[2];
        data["file"] = temp[3];
        data["location"] = temp[4];
        data["applierAddress"] = temp[5];
        data["votes"] = temp[6];
        yourApplications.push(data)
    }
    buildCards(yourApplications)
}


const getFileLink = async () => {
    let client = new Web3Storage({ token });
    let files = document.getElementById("filepicker").files;
    console.log("file uploading");
    let cid = await client.put(files, {
        onRootCidReady: (localCid) => {
            console.log(`> 🔑 locally calculated Content ID: ${localCid} `);
            console.log("> 📡 sending files to web3.storage ");
        },
        onStoredChunk: (bytes) =>
            console.log(`> 🛰 sent ${bytes.toLocaleString()} bytes to web3.storage`),
    });
    let link = `https://dweb.link/ipfs/${cid}`
    console.log(link);
    return link
}

const buildCards = (data) => {
    let appContainer = document.getElementsByClassName("card-grid")[0]
    let txt = ""
    for (let i = 0; i < data.length; ++i) {

        txt += `
        <div class="card">

                    <div class="card-details">
                        <div class="card-title">
                        ${data[i]["subject"]}
                        </div>
                        <div class="card-description">
                        ${data[i]["description"]}
                        </div>
                    </div>

                    <div class="card-bottom">
                        <div class="view-more">
                            View <span class="material-symbols-outlined">
                                east
                            </span>
                        </div>
                        <div class="votes">
                        <div class="upvote-value">
                        ${data[i]["votes"]}
                            </div>
                            <span class="material-symbols-outlined">
                                arrow_upward_alt
                            </span>
                        </div>
                    </div>
                </div>`
    }
    appContainer.innerHTML = txt
    attachEvent(yourApplications)
}

const attachEvent = (yourApplications) => {

    let apps = document.getElementsByClassName("card")
    for (let i = 0; i < apps.length; ++i) {
        document.getElementsByClassName("view-more")[i].addEventListener("click", () => {
            document.getElementById("dialog-view").style.display = "flex"
            fillView(i)
            currApp = i;
        })
    }
}

const fillView = async (i) => {

    document.getElementById("subject-out").innerText = yourApplications[i]["subject"]
    document.getElementById("view-upvote").innerText = yourApplications[i]["votes"]
    document.getElementById("desc-text").innerText = yourApplications[i]["description"]
    document.getElementById("location-value").innerText = yourApplications[i]["location"]


    document.getElementById("file-out").href = yourApplications[i]["file"]
}

const getProfileInfo = async () => {
    if (reportProxy == null) return;
    let balance = await reportProxy.getBalance()

    let appContainer = document.getElementsByClassName("card-grid")[0]
    appContainer.innerHTML = `
        <div class="application reward">
            <div class="subject">
            Your Reward Bank
            </div>
            <br>

            <div class="name">
            
            </div>
            
            <div class="description">
            Below is the amount of eth donated to you by the community. <br>
            Hit Withdraw to move that amount to your wallet.<br><br>
            Balance: ${balance}
            </div>

            <br>
            <div class="end-btns">
                <button id="withdraw-btn">Withdraw</button>
            </div>
        </div>
    `
    document.getElementById("withdraw-btn").onclick = () => {
        withdrawMoney()
    }
}

const withdrawMoney = async () => {
    console.log("in withdraw")

    if (reportProxy == null) return;

    startLoad()

    try {
        await reportProxy.withdraw()
        await getProfileInfo()
        console.log("Money moved to your account");
    } catch (error) {
        console.log("error in up withdrawal");
        console.log(error);
    }

    endLoad()
}
