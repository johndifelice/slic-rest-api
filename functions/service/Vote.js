const admin = require("firebase-admin");
const {getDoc} = require('./Document');
const { getDefinitions, getImages, getPronunciations } = require('./Version');
const { usersToOmitFromTransactions } = require('../constants/user-constants');

const getVersionVoteCounts = async (word) => {
    let docRef = await getDoc(word);

    let defs = await getDefinitions(word, "", docRef);
    let pronunciations = await getPronunciations(word, "", docRef);
    let images = await getImages(word, "", docRef);

    let arrVoteCount = [];

    for(let i=0; i < defs.length; i++){
        try{
            arrVoteCount.push({"key":i,"author": defs[i].author,"count":0});
        } catch(error){
            console.log(error);
        }

        try{
            arrVoteCount.push({"key":i,"author": images[i].author,"count":0});
        } catch(error){
            console.log(error);
        }

        try{
            arrVoteCount.push({"key":i,"author": pronunciations[i].author,"count":0});
        } catch(error){
            console.log(error);
        }
    }

    let arrVoteId = await getVotes(word);
    let values = Object.values(arrVoteId);

    let maxCount = getMax(values, "author");
    let arrMaxKey = [];
    for (let i=0; i < Object.keys(arrVoteId).length; i++){
        if (Object.values(arrVoteId)[i] === maxCount){
            arrMaxKey.push(Object.keys(arrVoteId)[i]);
        } 
    }

    return arrMaxKey;
}

function getMax(arr) {
    var max;
    for (var i=0 ; i<arr.length ; i++) {
        if (max === null || parseInt(arr[i]) > parseInt(max))
            max = arr[i];
    }
    return max;
}

function sortByProperty(property){  
    return function(a,b){  
       if(a[property] < b[property])  
          return 1;  
       else if(a[property] > b[property])  
          return -1;  
   
       return 0;  
    }  
 }

 const getVotes = async (word) => {

    let votes = [];
    const results = await admin.firestore().collection("votes")
        .where("word", "==", word)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach(function(doc) {
                votes.push(doc.data().author);
            });

            let array = votes,
            arrCount = array.reduce((a, c) => (a[c] = (a[c] || 0) + 1, a), Object.create(null));
                
            return arrCount;

        });
  

}

function isInJSONArray(arr,value){
    for(let i=0; i < arr.length; i++){
        if(arr[i] === value){
            return true;
        }
    }
    return false;
}

 const updateVotePaidStatus = async(votes) => {

    var db = admin.firestore();

    for(let i=0; i < votes.length; i++){
        let docRef = db.collection("votes")
            .where("Id", "==", votes[i].Id)
            .get()
                .then(function(querySnapshot){
                    querySnapshot.forEach(function(doc) {
                        let votesRef = db.collection("votes").doc(doc.id)
                            .update({
                                status: "paid"
                            })
                    });

                    return 1;
                })
                .catch(error => {
                    throw new Error('Error: Getting document:'); // throw an Error
                });
        }
}

module.exports = { getVersionVoteCounts };
