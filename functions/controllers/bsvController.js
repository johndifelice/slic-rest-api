const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const bsv = require("bsv");
const {Forge} = require("txforge");
const bsvApp = express();
const { OP_RETURN_KEY, SATOSHIS_PER_BSV } = require("../constants/key-constants");

const satoshisPerBSV = SATOSHIS_PER_BSV;
const PRIVKEY = "L1FJLDZWMrBR7JmXKPCfzrUZahBWqLdPaGnDjWQJLJFXAKmvp67V";

bsvApp.use(cors({origin: true}));

bsvApp.get("/utxos/:address", async (req, res) => {
    const utxos = await getUtxos(req.params.address);   

    res.status(200).send(JSON.stringify({"utxos": utxos}));
});

bsvApp.get("/utxos/balance/:address", async (req, res) => {
    const axios = require('axios');
    const json = await axios.get(`https://api.mattercloud.net/api/v3/main/address/${req.params.address}/utxo`);
    `https://api.mattercloud.net/api/v3/main/address/${address.toString()}/utxo`

    res.status(200).send(JSON.stringify({"utxos": json["data"]}));
});

bsvApp.get("/rawtx/:fromAddress/:toAddress/:satAmount/:opReturn", async (req, res) => {
    let _fromAddress = req.params.fromAddress;
    let _toAddress = req.params.toAddress;
    let _satAmount = req.params.satAmount;
    let _opReturn = req.params.opReturn;

    var utxos = await getUtxos(req.params.fromAddress);   

    try{
        let rawTx = buildForge(utxos, _toAddress, _satAmount, _opReturn);
        //console.log("rawTx in api:", JSON.stringify(rawTx));
        res.status(200).send(JSON.stringify({"rawTx":rawTx}));
    } catch (error){
        res.status(500).send(`An error has ocurred: ${error}`);
    }
});

bsvApp.post("/payment/send/", async (req, res) => {
    const payment = req.body;
    //console.log("payment:", JSON.stringify(payment));
    //console.log("before getUtxos");
    var utxos = await getUTXOs2(payment.fromAddress);
    //console.log("after getUtxos");
    //console.log("payment/send/ utxos:", utxos);
    //console.log("before buildForge");
    let rawTx = buildForge(utxos, payment.toAddress, payment.satAmount, payment.opReturn);
    //console.log("payment/send rawtx:", JSON.stringify(rawTx));
    //console.log("before postRawTx");
    postRawTx(rawTx);

    res.status(201).send(JSON.stringify({"payment rawTx": rawTx}));
    
});

bsvApp.post("/key/", async (req, res) => {
    const privKey = bsv.PrivKey.fromRandom();
    const keyPair = new bsv.KeyPair().fromPrivKey(privKey);
    const pubKey = keyPair.pubKey;
    const address = new bsv.Address().fromPubKey(pubKey);

    json = {
        "address" : address.toString(),
        "privKey" : keyPair.privKey.toString(),
        "pubKey" : keyPair.pubKey.toString()
    };

    res.status(201).send(JSON.stringify(json));
});

bsvApp.post("/key/:privKey", async (req, res) => {
    const privKey = bsv.PrivKey.fromString(req.params.privKey);
    const keyPair = new bsv.KeyPair().fromPrivKey(privKey);
    const pubKey = keyPair.pubKey;
    const address = new bsv.Address().fromPubKey(pubKey);

    json = {
        "address" : address.toString(),
        "privKey" : keyPair.privKey.toString(),
        "pubKey" : keyPair.pubKey.toString()
    };

    res.status(201).send(JSON.stringify(json));
});

async function getUtxos(address){
    
    const axios = require('axios');
    const json = await axios.get(`https://api.mattercloud.net/api/v3/main/address/${address}/utxo`);
    //console.log("getUtxos json:", JSON.stringify(json));
    var utxos = json["data"];
    //console.log("json[data] from getUtxos:", JSON.stringify(utxos));
    
    return utxos;
}

async function getUTXOs2(fromAddress){
    return new Promise(resolve => {
        setTimeout(() => {
            let utxos;
            const https = require('https');
            https.get(`https://api.mattercloud.net/api/v3/main/address/${fromAddress.toString()}/utxo`, (res) => {
                let data = '';
                res.on('data',(chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    utxos = JSON.parse(data);
                    resolve(utxos);
                });    

                res.on('error', error => {
                    console.error(error)
                })
            });    
        },2000);
    });
}


async function getAddress(paymail){
    let jsonAddress = await axios.get('https://api.polynym.io/getAddress/' + paymail);

    return jsonAddress["address"];
}

async function getRate(){
    let jsonRate = await axios.get('https://api.whatsonchain.com/v1/bsv/main/exchangerate');
    let rate = jsonRate["data"]["rate"];
    console.log("rate: ",rate);
    return rate;
}

function postRawTx(rawTx){
    // Send rawTransaction to WhatsOnChain
    try{
    const https = require('https');

    const data = JSON.stringify({
        txhex: rawTx
    });
    //console.log("data:", data);

    const options = {
        hostname: 'api.whatsonchain.com',
        port: 443,
        path: '/v1/bsv/main/tx/raw',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    }

    const req = https.request(options, res => {
        //console.log(`statusCode: ${res.statusCode}`)

        res.on('data', d => {
            //process.stdout.write(d)
            //console.log('Post data: ', JSON.stringify(d));
        })
    })

    req.on('error', error => {
        console.error(error)
    })

    req.write(data)
    req.end()
} catch (error){
    console.log("postRawTx error:", JSON.stringify(error));
    return null;
}
}

function buildForge(_utxo, _toAddress, _satAmount, _opReturn){
    //console.log("Beginning of buildForge");
    //console.log("utxos buildForge:", JSON.stringify(_utxo));
    try{
        
        const opReturnKey = OP_RETURN_KEY;//"19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut";
        //console.log("buildForge PRIVKEY");
        const _privKey = new bsv.PrivKey().fromString(PRIVKEY);
        //console.log("buildforge _privKey:",JSON.stringify(_privKey));
        const keyPair = new bsv.KeyPair().fromPrivKey(_privKey);

        //console.log("buildforge keyPair: ", JSON.stringify(keyPair));

        //console.log("utxos: ", JSON.stringify(_utxo));
        const forge  = new Forge ({
            inputs: [_utxo],
            outputs: [
                {
                    to: _toAddress,
                    satoshis: _satAmount
                },
                {
                    data: [opReturnKey,_opReturn,'utf-8']
                }
            ],
            changeTo: _utxo[0].address
        });

        //console.log("forge: ", JSON.stringify(forge));
        //console.log("KEYPAIR in build:", JSON.stringify(keyPair));
        
        forge.build().sign({keyPair});
        
        //console.log("rawTx in build:", JSON.stringify(forge.tx.toHex()));
        //console.log("End of buildForge");

        return forge.tx.toHex();
    } catch (error){
            console.log("error:", error);
            return null;
    }
}

exports.bsv = functions.https.onRequest(bsvApp);