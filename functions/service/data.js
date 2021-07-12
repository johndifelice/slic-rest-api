//payment message:  slic wb: fugacity
'use strict'

//const functions = require("firebase-functions");
//const admin = require("firebase-admin");

const aggregateData = (arr, keyField, sumField) => {
    let sum = 0;
    var arrFinal = [];
    var jsonReturn = [];

    arr.sort(sortByProperty(keyField));
    if(sumField === null){
        let array = arr,
            arrSum = array.reduce((a, c) => (a[c] = (a[c] || 0) + 1, a), Object.create(null));
        
        for (var prop in arrSum) {
            var obj = JSON.parse('{ "' + keyField + '":"' + prop + '", "count":' + arrSum[prop] + '}'); 
            jsonReturn.push(obj);
        } 
    }else {
        let arrReturn = arr;
        let key = 0;
        let previousKey = arrReturn[0][keyField];

        for(let i=0; i < arrReturn.length; i++){
            key = arrReturn[i][keyField];
            if (key === previousKey){
                sum = sum + arrReturn[i][sumField];
            } else {
                arrFinal.push({[keyField]:previousKey,[sumField]:sum});
                sum = 0;
                sum = sum + arrReturn[i][sumField];
            }
            
            previousKey = key;

        }
        arrFinal.push({[keyField]:key,[sumField]:sum});
        console.log('arrFinal: ', arrFinal);

        jsonReturn = arrFinal;
        
    }
    console.log("jsonReturn: ", jsonReturn);
    return jsonReturn;
}

function getFieldNames(jsonArr){
    let fields = [];
    let fieldCount = 0;
    for (let x in jsonArr[0]) {
        fields.push(x);
        fieldCount += 1;
    }

    return fields;
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

// const getVotes = async (word) => {

//     let votes = [];
//     const results = await firebase.firestore().collection("votes")
//         .where("word", "==", word)
//         .get()
//         .then((querySnapshot) => {
//             querySnapshot.forEach(function(doc) {
//                 votes.push(doc.data().Id);
//             });
//         });
  
//         let array = votes,
//         arrCount = array.reduce((a, c) => (a[c] = (a[c] || 0) + 1, a), Object.create(null));
            
//         return arrCount;
// }

//export  { aggregateData };

module.exports = { aggregateData, getFieldNames };
