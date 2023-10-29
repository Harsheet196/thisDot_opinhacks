const { getAuth } = require("firebase-admin/auth");
const cookie = require("cookie");
const admin = require("firebase-admin");
const serviceAccount = require("./../firebase-key.json");

const app = admin.initializeApp({
   credential: admin.credential.cert(serviceAccount),
});

let userUID = null;
const checkAuth = (req, res, next) => {
   if (req.headers.cookie) {
      let cookieData = cookie.parse(req.headers.cookie);
      let idToken = cookieData["idToken"];
      // console.log(idToken);

      getAuth()
         .verifyIdToken(idToken)
         .then((decodedToken) => {
            userUID = decodedToken.uid;
            // console.log(userUID);
            console.log("user is logged in");
            next();
         })
         .catch((error) => {
            userUID = null;
            res.send(JSON.stringify({ data: "You are not logged in" }));
         });
   } else {
      res.send(JSON.stringify({ data: "You are not logged in" }));
   }
};

module.exports = { checkAuth };
