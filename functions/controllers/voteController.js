'use strict'

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

//const {getVersionVoteCounts} = require("../service/Vote")

const voteApp = express();
voteApp.use(cors({origin: true}));

voteApp.get("/:id", async (req, res) => {
    const snapshot = await admin.firestore().collection("votes").doc(req.params.id).get();

    const userId = snapshot.id;
    const userData = snapshot.data();

    res.status(200).send(JSON.stringify({id: userId, ...userData}));
});

voteApp.get("/word/:word", async(req, res)=>{
    let results = [];

    const snapshot = await admin.firestore()
        .collection("votes")
        .where("word", "==", req.params.word)
        .get();

        //res.status(200).send(snapshot);
    snapshot.forEach((doc) => {
        let id = doc.id;
        results.push({id, ...doc.data()});
    }); 

    res.status(200).send(JSON.stringify(results));
});

voteApp.post("/", async (req, res) => {
    const vote = req.body;

    await admin.firestore().collection("votes").add(vote);

    res.status(201).send();
});

exports.vote = functions.https.onRequest(voteApp);