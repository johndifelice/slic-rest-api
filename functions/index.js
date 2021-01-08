const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");

const admin = require("firebase-admin");
admin.initializeApp();

const voteApp = express();
const wordApp = express();

/****
Votes
*****/
voteApp.get("/:id", async (req, res) => {
    const snapshot = await admin.firestore().collection("votes").doc(req.params.id).get();

    const userId = snapshot.id;
    const userData = snapshot.data();

    res.status(200).send(JSON.stringify({id: userId, ...userData}));
});

voteApp.post("/", async (req, res) => {
    const vote = req.body;

    await admin.firestore().collection("votes").add(vote);

    res.status(201).send();
})

exports.vote = functions.https.onRequest(voteApp);

/***** 
 Words
******/
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

exports.word = functions.https.onRequest(wordApp);
