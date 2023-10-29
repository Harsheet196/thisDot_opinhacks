import { Web3Storage } from "https://cdn.jsdelivr.net/npm/web3.storage/dist/bundle.esm.min.js";

let tokenInput =
   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGVFOTE5N0UzZjg4NDVERDZFREI0MjAwMzUyNDkwZGRiNDYwMWI2QjYiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NzU4Nzc5Mjk5ODgsIm5hbWUiOiJ0ZW1wIn0.3NRcLALJLP1Noh48GThYaHGkL_CMaMysCNxmQ6l-VKY";
const token = tokenInput;

let reportProxy = null;
let yourApplications = [];
let currApp = -1;

let serverAddress = "http://localhost:8000";
window.onload = async () => {
   reportProxy = new ReportProxy();

   await connect();

   document.getElementById("location-filter").oninput = () => {
      searchFunc();
   };
   document.getElementById("keyword").oninput = () => {
      searchFunc();
   };

   document.getElementById("showAll").onclick = async () => {
      await getAllApplications();
   };

   document.getElementsByClassName("view-close")[0].onclick = () => {
      document.getElementById("dialog-view").style.display = "none";
      currApp = -1;
   };

   document.getElementById("showAll").click();

   document.getElementById("submit-review").onclick = async () => {
      let data = {
         reportID: yourApplications[currApp]["id"],
         status: document.getElementById("report-status").value,
         remark: document.getElementById("report-remark").value,
         warrant: document.getElementById("report-warrant").value,
      };
      try {
         let res = await postData(`${serverAddress}/updateReport`, data);
         console.log(res);
         if (res["success"] == "false") {
            console.log("failed to update report");
         } else {
            startLoad();
            fillView(currApp);
            endLoad();
            console.log("updated report successfully");
         }
      } catch (e) {
         console.log(e);
         console.log("failed to access report");
      }
   };
};

const sleep = (ms) => {
   return new Promise((resolve) => setTimeout(resolve, ms));
};

const connect = async () => {
   if (reportProxy == null) return;
   startLoad();
   await reportProxy.connect();
   console.log("on connect: account details");
   console.log(reportProxy.account);

   await sleep(400);
   endLoad();
};

const getAllApplications = async () => {
   if (reportProxy == null) return;

   startLoad();
   let res = await reportProxy.getAllApplicationsID();
   console.log(`all applications fetched`);
   console.log(res);

   await sleep(200);
   endLoad();

   yourApplications = [];
   for (let i = 0; i < res.length; ++i) {
      // console.log(res[i]);
      let temp = await reportProxy.getApplicationByID(res[i]);
      console.log(temp);

      let data = {};
      data["id"] = temp[0];
      data["subject"] = temp[1];
      data["description"] = temp[2];
      data["file"] = temp[3];
      data["location"] = temp[4];
      data["applierAddress"] = temp[5];
      data["votes"] = temp[6];
      yourApplications.push(data);
   }
   buildCards(yourApplications);
};

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
         console.log(
            `> 🛰 sent ${bytes.toLocaleString()} bytes to web3.storage`
         ),
   });
   let link = `https://dweb.link/ipfs/${cid}`;
   console.log(link);
   return link;
};

const buildCards = (data) => {
   let appContainer = document.getElementsByClassName("card-grid")[0];
   let txt = "";
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
                </div>`;
   }
   appContainer.innerHTML = txt;
   attachEvent(yourApplications);
};

const attachEvent = (yourApplications) => {
   let apps = document.getElementsByClassName("card");
   for (let i = 0; i < apps.length; ++i) {
      document
         .getElementsByClassName("view-more")
         [i].addEventListener("click", () => {
            document.getElementById("dialog-view").style.display = "flex";
            fillView(i);
            currApp = i;
         });
   }
};

async function query(data) {
   const response = await fetch(
      "https://api-inference.huggingface.co/models/mrm8488/bert-tiny-finetuned-sms-spam-detection",
      {
         headers: {
            Authorization: "Bearer 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",
         },
         method: "POST",
         body: JSON.stringify(data),
      }
   );
   const result = await response.json();
   return result;
}

const fillView = async (i) => {
   document.getElementById("subject-out").innerText =
      yourApplications[i]["subject"];
   document.getElementById("view-upvote").innerText =
      yourApplications[i]["votes"];
   document.getElementById("desc-text").innerText =
      yourApplications[i]["description"];
   document.getElementById("location-value").innerText =
      yourApplications[i]["location"];

   let data = {
      reportID: yourApplications[i]["id"],
   };
   try {
      let res = await postData(`${serverAddress}/getReport`, data);
      if ("success" in res) {
         console.log("failed to access report");
      } else {
         console.log(res);
         document.getElementById("report-status").value = res["status"];
         document.getElementById("report-remark").value = res["remark"];
         document.getElementById("report-warrant").value = res["warrant"];

         let tags = res["tags"];
         let spamLevel = res["spamLevel"];
         document.getElementById("desc-text").innerText += `
         Tags: ${tags}
         Spam Level: ${spamLevel}% `;
      }
   } catch (e) {
      console.log(e);
      console.log("failed to access report");
   }

   document.getElementById("file-out").href = yourApplications[i]["file"];
};

const searchFunc = () => {
   let pincode = document.getElementById("location-filter").value;
   let keyword = document.getElementById("keyword").value;
   let cards = document.getElementsByClassName("card");

   if (pincode.length == 0 && keyword.length == 0) {
      for (let i = 0; i < cards.length; ++i) {
         cards[i].style.display = "flex";
      }
      return;
   }
   if (pincode.length != 0) {
      pincode = pincode.toLowerCase();
      for (let i = 0; i < cards.length; ++i) {
         if (
            yourApplications[i]["location"].includes(pincode.toLowerCase()) ==
            false
         ) {
            cards[i].style.display = "none";
         } else if (
            yourApplications[i]["description"].toLowerCase().includes(keyword)
         ) {
            cards[i].style.display = "flex";
         }
      }
   }

   if (keyword.length != 0) {
      keyword = keyword.toLowerCase();
      for (let i = 0; i < cards.length; ++i) {
         if (
            yourApplications[i]["description"]
               .toLowerCase()
               .includes(keyword) == false
         ) {
            cards[i].style.display = "none";
         } else if (
            yourApplications[i]["location"].includes(pincode.toLowerCase())
         ) {
            cards[i].style.display = "flex";
         }
      }
   }
};
