const admin = require("firebase-admin");
const {countOccurances} = require('./Array');
const {SearchResult} = require('./src/models/SearchResult');
//const { usersToOmitFromTransactions } = require('./constants/user-constants');
const { usersToOmitFromTransactions } = require('../constants/user-constants');


const getRevenueWordsQuery = async () =>{
    let snapshot = admin.firestore()
    .collection("revenue")
    .doc("revenueDoc")
    .collection("words")
    .orderBy("userId", "asc");

    return snapshot;
}

const getSearchWordsQuery = async () =>{
    let snapshot = admin.firestore()
    .collection("revenue")
    .doc("revenueDoc")
    .collection("search")
    .orderBy("word", "asc")

    return snapshot;
}

const getSearchWordsByDateQuery = async () =>{
    let snapshot = admin.firestore()
    .collection("revenue")
    .doc("revenueDoc")
    .collection("search")
    .orderBy("datetime", "desc")

    return snapshot;
}

const get_IterateOverUsers = async(query) =>{
    let usersAll = [];
    let userHash = {};

    const snapshot = await query.get()
        .then(function(querySnapshot){
            querySnapshot.forEach(function(word) {
                usersAll = usersAll.concat(word.data().userId);
            });

            var previousUser = "";
            querySnapshot.forEach(function(word) {
                if(word.data().userId !== previousUser){
                    userHash[word.data().userId] = countOccurances(usersAll,word.data().userId);
                    previousUser = word.data().userId;
                }
            });

            removeUsers(userHash);

            return userHash;
        });  

        
    }

    
    const get_IterateOverWords = async(query) => {
        let wordsAll = [];
        let wordHash = {};
    
        const snapshot = await query.get()
            .then(function(querySnapshot){
                querySnapshot.forEach(function(word) {
                    wordsAll = wordsAll.concat(word.data().word);
                });
    
                var previousWord = "";
                querySnapshot.forEach(function(word) {
                    if(word.data().word !== previousWord){
                        wordHash[word.data().word] = countOccurances(wordsAll,word.data().word);
                        previousWord = word.data().word;
                    }
                });

                removeUsers(wordHash);

                return wordHash;
            });  
    
    }

    // const get_IterateOverDateTime = async(query) =>{
    //     let searchAll = [];
    //     let searchHash = {};
    
    //     const snapshot = await query.get()
    //         .then(function(querySnapshot){
    //             querySnapshot.forEach(function(search) {
    //                 searchAll = searchAll.concat(search.data().userId);
    //             });
    
    //             var previousUser = "";
    //             querySnapshot.forEach(function(search) {
    //                 if(search.data().userId !== previousUser){
    //                     searchHash[search.data().userId] = countOccurances(searchAll,search.data().userId);
    //                     previousUser = search.data().userId;
    //                 }
    //             });
    //         });  
    
    //     removeUsers(searchHash);

    //     return searchHash;
    // }
    
    const sortHashByValue = async (hashTable) => {
        var keyValues = [];
        var searchResults = [];

        for (let key in hashTable) {
            if (hashTable.hasOwnProperty(key)) {
                keyValues.push(hashTable[key]);
            }
        }

        let sortedHashTable = {};
        for (let i in keyValues) {
            let found = false;
            for (let key in hashTable) {
                if(hashTable[key] === keyValues[Number(i)] && !found){
                    sortedHashTable[key] = keyValues[Number(i)];
                    let searchResult = new SearchResult(key, keyValues[Number(i)]);
                    
                    searchResults.push(key);
                    found = true;
                }
            }
        }

        return searchResults;
    }

    const removeUsers = async (hashTable) => {
        for(let i=0; i < usersToOmitFromTransactions.length; i++){
            delete hashTable[usersToOmitFromTransactions[i]];
        }
    }

module.exports = {
        get_IterateOverUsers, get_IterateOverWords, 
        getRevenueWordsQuery, getSearchWordsQuery,
        sortHashByValue,getSearchWordsByDateQuery
    };