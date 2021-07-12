// import firebase from '../../Firebase';

// const getArrays = async (docRef, type) => {

//     let json = docRef.data();
//     for (var key in json.definitions) {
//         var item = json.definitions[key];
//             switch(type){
//                 case "def" :
//                     return item.defVersions;
//                     break;
//                 case "img" :
//                     return item.images;
//                     break;
//                 case "pro" :
//                     return item.pronunciations;
//                     break;
//                 case "part" :
//                     return item.partOfSpeech;
//                     break;
//                 }
//     }
       
// }

// const getDefinitions = async (word, defId, docRef) => {
//     if (docRef){
//         return getArrays(word,defId,"def",docRef);
//     } else {
//         return getArrays(word,defId,"def");
//     }
// }

// const getImages = async (word, defId, docRef) => {
//     if (docRef){
//         return getArrays(word, defId,"img",docRef);
//     } else {
//         return getArrays(word, defId,"img");
//     }

// }

// const getPronunciations = async (word, defId, docRef) => {

//     if (docRef){
//         return getArrays(word, defId,"pro",docRef);
//     } else {
//         return getArrays(word, defId,"pro");
//     }
// }

// const getPartsOfSpeech = async (word, defId, docRef) => {

//     if (docRef){
//         return getArrays(word, defId,"part",docRef);
//     } else {
//         return getArrays(word, defId,"part");
//     }
// }


// export {getDefinitions, getImages, getPronunciations, getPartsOfSpeech};