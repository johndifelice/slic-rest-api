const admin = require("firebase-admin");

const {countOccurances} = require('./Array');
const {getHashKey} = require('./DataStructure');
    
const {get_IterateOverUsers, getRevenueWordsQuery,
        get_IterateOverWords, getSearchWordsQuery,
        sortHashByValue} = require('./Dal');

var moment = require('moment');

const getWords = async () => {

    const snapshot = await firebase.firestore().collection('words')
        .where("kidFriendly","==",true)
        .get();
    return snapshot.docs.map(doc => doc.id);
}

const getWordsByUser = async (senderPaymail, withDistinct) => {
    let distinctResults = [];
    const snapshot = await firebase.firestore()
        .collection("revenue")
        .doc("revenueDoc")
        .collection("words")
        .where("userId","==",senderPaymail)
        .orderBy("word", "asc")
        .get()
        .then(function(querySnapshot){
            var previousWord = "";
            querySnapshot.forEach(function(word) {
                if(word.data().word !== previousWord){
                    distinctResults = distinctResults.concat(word.data().word);
                    previousWord = word.data().word;
                }
            });

            return distinctResults.map(x => x);
        });   

    
}

const getWordCountsForAllUsers = async () => {
    let query = await getRevenueWordsQuery();
    let wordSmithHash = await get_IterateOverUsers(query);
    
    return wordSmithHash;
}

const getSearchCountsForAllUsers = async () => {
    let query = await getSearchWordsQuery();
    let seekerHash = await get_IterateOverUsers(query);
    
    return seekerHash;
}

const getSearchCountsByDate = async () => {
   
    let query = await getSearchWordsByDateQuery();
    
    let searchHash = await get_IterateOverUsers(query);
  
    return searchHash;
}

const getSearchCounts = async (listCountToReturn) => {
    let query = await getSearchWordsQuery();
    let searchHash = await get_IterateOverWords(query);
    let key = "";
    let hashReturn = {};

    for(let i = 0; i < listCountToReturn; i++){
        const max = Object.keys(searchHash).reduce((a, v) => Math.max(a, searchHash[v]), -Infinity);
        key = getHashKey(searchHash,max);
        hashReturn[key] = max;
        delete searchHash[key];
    }

    return await sortHashByValue(hashReturn);
}

const getTopWordsmiths = async (listCountToReturn) => {
    //let query = await getRevenueWordsQuery();
    let searchHash = await getWordCountsForAllUsers();
    
    delete searchHash["jackpitts@moneybutton.com"];
    delete searchHash["johndifelice@moneybutton.com"];
    delete searchHash["selflearningdictionary@moneybutton.com"];

    let key = "";
    let hashReturn = {};

    for(let i = 0; i < listCountToReturn; i++){
        const max = Object.keys(searchHash).reduce((a, v) => Math.max(a, searchHash[v]), -Infinity);
        key = getHashKey(searchHash,max);
        hashReturn[key] = max;
        delete searchHash[key];
    }

    return await sortHashByValue(hashReturn);
}

const getTopWordSmith = async () =>{

    let hashReturn = {};
    
    let authorHash = await getWordCountsForAllUsers();
    const max = Object.keys(authorHash).reduce((a, v) => Math.max(a, authorHash[v]), -Infinity);
    let key = getHashKey(authorHash,max);
    hashReturn[key[0]] = max;

    return hashReturn;
}

const getWordCount = async () => {
    var wordCount;
    const snapshot = await firebase.firestore().collection('words')
        .get()
        .then(function(querySnapshot) {      
            wordCount = querySnapshot.size; 
            return wordCount;
        }).catch(function(error) {
            console.log(error);
        });

    
}

const wordExists = async (word) =>{
    var bReturn = false;
    var ID = "";

    
    let db = firebase.firestore();
    const snapshot = await db.collection('words').doc(word)
    .get()
    .then((docSnapshot) => {
        if (docSnapshot.exists) {
            
            bReturn = true;
        } else {
            bReturn = false;
        }

        return bReturn;
    });

    
}

const isWordAuthenticated = async (word,txid) =>{
    console.log(txid.length);
    var bReturn = false;
    var ID = "";
    var snapshot;
    var db = firebase.firestore();
    var isAuthenticated = false;

    if(txid.length !== 64){
        return false;
    }

    snapshot = db
        .collection("revenue")
        .doc("revenueDoc")
        .collection("search")
        .where("word","==",word);
    snapshot = snapshot.where("txId","==",txid);
    var query = await snapshot.get()
        .then(function(querySnapshot) {     
            querySnapshot.forEach(function(doc) {
                isAuthenticated = true;
                
            });

            return isAuthenticated;
        });
        
    
}

const getWordId = async(word) =>{
    let ID;
    let db = firebase.firestore();
    let docRef = db.collection("words").doc(word);
    const doc = await docRef.get();
    let json = doc.data();
    if (json === null){
        ID = "";
    } else {
        ID = json.definitions[0].id;
    }

    return ID;
}

const getWord = async(componentId) => {
    var word = "";
    let db = firebase.firestore();
    const snapshot = await db.collection('words')
    .get()
    .then((snapShot) => {
        snapShot.forEach((doc) => {
            for(let i=0; i < doc.data().definitions[0].defVersions.length; i++){
                if(doc.data().definitions[0].defVersions[i] === componentId){
                    word = doc.id;
                }
            }
            for(let i=0; i < doc.data().definitions[0].images.length; i++){
                if(doc.data().definitions[0].images[i] === componentId){
                    word = doc.id;
                }
            }
            for(let i=0; i < doc.data().definitions[0].partOfSpeech.length; i++){
                if(doc.data().definitions[0].partOfSpeech[i] === componentId){
                    word = doc.id;
                }
            }
            for(let i=0; i < doc.data().definitions[0].pronunciations.length; i++){
                if(doc.data().definitions[0].pronunciations[i] === componentId){
                    word = doc.id;
                }
            }
        });
    
        return word;
    });

    
}

const logWord = async(word, addWordType, json) => {
    let wordName = word + "_" + moment().format().replaceAll(":","-");
    let db = firebase.firestore();
    let jsonToStore = {
        "definition": json.definitions[0].defVersions[json.definitions[0].defVersions.length-1],
        "image": json.definitions[0].images[json.definitions[0].images.length-1],
        "partOfSpeech": json.definitions[0].partOfSpeech[json.definitions[0].partOfSpeech.length-1],
        "pronunciation": json.definitions[0].pronunciations[json.definitions[0].pronunciations.length-1]
    }

    db.collection("words_log").doc(wordName).set({
        createDate: moment().format(),
        addWordType: addWordType,
        json: jsonToStore
    }).then(function() {
        console.log('successful logging');       
        return 1;     
    }).catch(function(error) {
       console.log(error);
    });
}

module.exports = { getWords, wordExists, getWordCount, 
          getWordId, getWord, getWordsByUser, getWordCountsForAllUsers,
          isWordAuthenticated, getTopWordSmith, getSearchCounts,
          getTopWordsmiths, logWord, getSearchCountsForAllUsers
        };