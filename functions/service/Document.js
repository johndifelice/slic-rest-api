'use strict'

const { exception } = require("console");
const admin = require("firebase-admin");

async function getDoc(){
    var message = "There are an invalid number of arguments for this function";
    var returnVal;

    switch(arguments.length){
        case 0:
            returnVal = getDoc_0_arg();
            break;
        case 1:
            returnVal = getDoc_1_arg(arguments[0]);
            break;
        default:
            console.log(message);
            throw new exception(message);
    }

    return returnVal;
}

async function getDoc_0_arg(){
    var db = admin.firestore();

    let wordLower = word;      
    var docRef = db.collection("words");

    const doc = docRef.get();

    return doc;
}

async function getDoc_1_arg(word){
    var db = admin.firestore();

    let wordLower = word;      
    var docRef = db.collection("words").doc(wordLower);

    const doc = docRef.get();

    return doc;
}

module.exports = { getDoc };