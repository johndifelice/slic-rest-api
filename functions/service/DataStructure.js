const getHashKey = (hashTable, value) => {
    let keys = [];
    for(let o in hashTable){
        if(hashTable[o] === value){
            keys = keys.concat(o);
        }
    }

    return keys;
}

module.exports = {getHashKey};

