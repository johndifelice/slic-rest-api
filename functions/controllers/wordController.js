const functions = require("firebase-functions");
const admin = require("firebase-admin");

const express = require("express");
const cors = require("cors");

const wordApp = express();

wordApp.use(cors({origin: true}));

wordApp.get("/:userid", async (req, res) => {
    let distinctResults = [];

    const snapshot = await admin.firestore()
        .collection("revenue")
        .doc("revenueDoc")
        .collection("words")
        .where("userId","==",req.params.userid)
        .orderBy("word", "asc")
        .get();

        let previousWord = "";
        snapshot.forEach((doc) => {
            if(doc.data().word !== previousWord){
                let id = doc.id;
                let data = doc.data();
                distinctResults.push({id, ...doc.data()})
                previousWord = doc.data().word;
            }    
        }); 
    res.status(200).send(JSON.stringify(distinctResults));
    
});

wordApp.get("/definition/:word", async(req, res)=>{
    let results = [];
    let word = req.params.word;
    const snapshot = admin.firestore()
        .collection("words")
        .doc(word);

    const doc = await snapshot.get();    
    
    doc.forEach()

    res.status(200).send(JSON.stringify(doc.data()));
});

exports.word = functions.https.onRequest(wordApp);