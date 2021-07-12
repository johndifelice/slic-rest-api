/* eslint-disable */

'use strict'

module.exports = {
    ...require("./controllers/voteController"),
    ...require("./controllers/wordController"),
    ...require("./controllers/bsvController")
}

const functions = require("firebase-functions");
const admin = require("firebase-admin");
// const express = require("express");
// const cors = require("cors");
const {getVersionVoteCounts} = require("./service/Vote")

const config = {
    apiKey: "AIzaSyCFZNcPK_HrJ1tDS7SNNtCCLw_MMEUlpJ0",
    authDomain: "slictionary-test-2b1f1.firebaseapp.com",
    databaseURL: "https://slictionary-test-2b1f1.firebaseio.com",
    projectId: "slictionary-test-2b1f1",
    storageBucket: "slictionary-test-2b1f1.appspot.com",
    messagingSenderId: "667847731081",
    appId: "1:667847731081:web:d2f4a79f42f1064efc6358"
};

// const config = {
//     apiKey: "AIzaSyCbwZ6aHO1X0mJPpic4zFRqamvRhE1-ruQ",
//     authDomain: "slictionary-fc2a0.firebaseapp.com",
//     databaseURL: "https://slictionary-fc2a0.firebaseio.com",
//     projectId: "slictionary-fc2a0",
//     storageBucket: "slictionary-fc2a0.appspot.com",
//     messagingSenderId: "165587557123",
//     appId: "1:165587557123:web:4c5e9964ca57a35899a736",
//     measurementId: "G-L987811QKB"
// };

admin.initializeApp(config);

//admin.initializeApp();

//const privKey = 'L1FJLDZWMrBR7JmXKPCfzrUZahBWqLdPaGnDjWQJLJFXAKmvp67V';



/**********
Word Bounty
/**********/
// wordBountyApp.get("/payment", async (req, res) => {
//     const axios = require('axios');
//     var snapshot;
//     let results = [];
//     var db = admin.firestore();

//     let jsonRate = await axios.get('https://api.whatsonchain.com/v1/bsv/main/exchangerate');
//     let rate = jsonRate["data"]["rate"];
//     console.log("rate: ",rate);

//     let arrAddress = [
//         'johndifelice@moneybutton.com',
//         'johnpitts@moneybutton.com',
//         'nidhi@moneybutton.com'
//     ]

    

//     snapshot = db
//         .collection("word-bounty")
//         .where("paid", "==",false );
//     snapshot = snapshot.where("winner","!=","");

//     var query = await snapshot
//         .get()
//         .then(function(querySnapshot){
//             querySnapshot.forEach(function(ele) {
//                 results.push(
//                     {
//                         bounty:ele.data().bounty,
//                         word:ele.data().word,
//                         opReturn:"wordbounty:" + ele.data().word + ":" +ele.data().bounty,
//                         winner:ele.data().winner
//                     });
//             });
//         });

//     let arrJsonAddress = [];
//     for(let i=0; i < results.length; i++){
//         let jsonAddress = await axios.get('https://api.polynym.io/getAddress/' + results[i]["winner"]);
//         arrJsonAddress.push({
//             "bounty":results[i]["bounty"],
//             "satoshiAmount":results[i]["bounty"] / rate * satoshisPerBSV,
//             "word":results[i]["word"],
//             "opReturn":results[i]["opReturn"],
//             "winner":results[i]["winner"],
//             "address":jsonAddress["data"]["address"]
//         });
       
//         console.log("index.js-opReturn: ", results[i]["opReturn"] )
//         let payment = new Payment(privKey);
//         await payment.sendPayment(
//             results[i]["address"],
//             1000,//results[i]["satoshiAmount"],
//             results[i]["opReturn"]
//         );
//     }

//     res.status(200).send(JSON.stringify(arrJsonAddress));
//     return true;
// });

// exports.wordbounty = functions.https.onRequest(wordBountyApp);





// /*******
//  Payment
//  *******/
// paymentApp.get("/aggregate/vote", async (req, res) => {
//     const snapshot = await admin.firestore()
//         .collection("votes")
//         .where("status", "==", "pending")
//         .get();

//         let distinctResults = [];
//         snapshot.forEach((doc) => {
//             let author = doc.data().author;
//             distinctResults.push(author)
//         }); 

//         let arrReturn = [];

//         arrReturn = dataUtil.aggregateData(distinctResults,"author",null);

//     res.status(200).send(JSON.stringify(arrReturn));
//     //res.status(200).send(JSON.stringify(distinctResults));
// });

// paymentApp.get("/balance", async (req, res) => {

//     https.get('https://api.mattercloud.net/api/v3/main/address/1AMzdZFfkJC7PnxXQndCPKp2q2v8TZSW9E/utxo', (res) => {
//         let data = '';
//         res.on('data', (chunk) => {
//             data += chunk;
//         });

//         res.on('end', () => {
//             let resp = JSON.parse(data);
//             //resolve(resp[0].satoshis);
//             res.status(200).send(JSON.stringify(resp[0].satoshis));
//         });
//     });
// });
// exports.payment = functions.https.onRequest(paymentApp);


exports.aggregateBounties = functions.firestore
    .document('word-bounty/{docId}')
    .onCreate((snap, context) => {

    let document = snap.data();    
    let db = admin.firestore();

    const parentDocId = document.docId;

    //check if doc exists in word-bounty-agg
    const snapshot = db.collection("word-bounty-agg")
    .doc(document.word)
    .get()
    .then((docSnapshot) => {
        if (docSnapshot.exists) {
            console.log("document exists");
            // 1. get bounty of word-bounty-agg doc
            // 2. sum agg bounty and word-bounty bounty
            // 3. update voteStart and sponsor
            // 4. update agg record with new bounty value
            // *  docSnapshot contains original state.

            let aggBounty = docSnapshot.data().bounty + document.bounty;
            let voteStart = docSnapshot.data().voteStart; // keep the first voteStart
            let sponsor = docSnapshot.data().paymail + "," + document.paymail; 
            db.collection("word-bounty-agg")
                .doc(document.word)
                .update({
                    bounty: aggBounty,
                    paymail: sponsor,
                    status: document.status,
                    voteStart: voteStart,
                    winner: document.winner,
                    word: document.word
                });
        } else {
            console.log("document dne");
            db.collection("word-bounty-agg")
            .doc(document.word)
            .set({
                bounty: document.bounty,  
                paymail: document.paymail,
                status: document.status,
                voteStart: document.voteStart,
                winner: document.winner,
                word:document.word
            })
            .then(() => {
                console.log("Document successfully written!");
            })
            .catch((error) => {
                console.error("Error writing document: ", error);
            });
        }
    })
    .catch((error) =>{
        console.log(error);
    })
});

exports.updateWBStatus = functions.firestore
    .document('word-bounty/{docId}')
    .onUpdate((change, context) => {
    try{
    let db = admin.firestore();
    const document = change.after.data();
    const documentBefore = change.before.data();

    if(document.status === documentBefore.status){
        console.log("Statuses are the same. No action taken.")
        return false;
    }

    console.log("Before update.")
    db.collection("word-bounty-agg")
        .doc(document.word)
        .update({
            // bounty: aggBounty,
            // sponsor: document.paymail,
            status: document.status,
            // voteStart: document.voteStart,
            // winner: document.winner,
            // word: document.word
        });

    } catch(error){
        console.log(error);
        return false;
    }
    return true;

});

exports.scheduledSetWBwinner = functions.pubsub.schedule('5 9 * * *') // 9:05am daily
    .timeZone('America/New_York') 
    .onRun((context) => {


    let winners = [];
    try{
        admin.firestore().collection("word-bounty")
        .where("paid","!=",true)
        .where("status","==","completed")
        .where("winner","==","")
        .get()
        .then((docs) => {
            docs.forEach(async(doc) => {
                let arrWinner = await getVersionVoteCounts(doc.data().word);
                console.log(doc.data().word,": ",arrWinner);
            });
        })
        .catch((error) => {
            console.log(error);
        });

        return true;

    } catch (error){
        console.log(error);
        return false;
    }
});

