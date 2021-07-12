//import firebase from '../../Firebase';
const {getDoc} = require('./Document');
const { getVoteSum } = require('./Vote');

const getArrays = async (word, defId, type,opts) => {
    let docRef = null;

    if(opts){
        docRef = opts;
    } else {
        docRef = await getDoc(word);
    }

    let json = docRef.data();
    var returnVal;
    for (var key in json.definitions) {
        var item = json.definitions[key];
       
            switch(type){
                case "def" :
                    returnVal = item.defVersions;
                    break;
                case "img" :
                    returnVal = item.images;
                    break;
                case "pro" :
                    returnVal = item.pronunciations;
                    break;
                case "part" :
                    returnVal = item.partOfSpeech;
                    break;
                }

                return returnVal;
    }
}

const getDefinitions = async (word, defId, docRef) => {
    if (!docRef){
        return getArrays(word,defId,"def");
    } else {
        return getArrays(word,defId,"def",docRef);
    }
}

const getImages = async (word, defId, docRef) => {
    if (docRef){
        return getArrays(word, defId,"img",docRef);
    } else {
        return getArrays(word, defId,"img");
    }

}

const getPronunciations = async (word, defId, docRef) => {

    if (docRef){
        return getArrays(word, defId,"pro",docRef);
    } else {
        return getArrays(word, defId,"pro");
    }
}

const getPartsOfSpeech = async (word, defId, docRef) => {

    if (docRef){
        return getArrays(word, defId,"part",docRef);
    } else {
        return getArrays(word, defId,"part");
    }
}

module.exports = { getPartsOfSpeech, getPronunciations, getImages, getDefinitions }

