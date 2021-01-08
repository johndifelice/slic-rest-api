'use strict'

const bsv = require('bsv');
const {Forge} = require('txforge');
const https = require('https');

function Payment(_privKey, _toAddress, _satAmount) {

    var fromAddress = '';
    var toAddress = _toAddress;
    var satAmount = _satAmount;
    var privKey = new bsv.PrivKey().fromString(_privKey);
    this.satoshiBalance;

    console.log('PrivateKey: ', privKey.toString());

    const keyPair = new bsv.KeyPair().fromPrivKey(privKey);
    const pubKey = keyPair.pubKey;
    console.log('Public Key: ',pubKey.toString());

    fromAddress = new bsv.Address().fromPubKey(pubKey);
    console.log('Address: ',fromAddress.toString());

    this.toAddress = toAddress;
    this.satAmount = satAmount;
    

    this.sendPayment = () => {
        // privKey = 'L1FJLDZWMrBR7JmXKPCfzrUZahBWqLdPaGnDjWQJLJFXAKmvp67V'
        //privKey = new bsv.PrivKey().fromString(privKey);
        console.log('PrivateKey: ', privKey.toString());

        const keyPair = new bsv.KeyPair().fromPrivKey(privKey);
        const pubKey = keyPair.pubKey;
        console.log('Public Key: ',pubKey.toString());

        this.fromAddress = new bsv.Address().fromPubKey(pubKey);
        console.log('Address: ',fromAddress.toString());

        //this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.satAmount = satAmount;
       
        //const address = this.fromAddress;

        https.get(`https://api.mattercloud.net/api/v3/main/address/${fromAddress.toString()}/utxo`, (res) => {
            let data = '';
            res.on('data',(chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                let resp = JSON.parse(data);
                console.log(resp);

                let rawTx = buildForge(resp[0]);
                console.log('Raw txt: ', rawTx);

                postRawTx(rawTx);
            });    
        })
    }

    
    this.getBalance = () => {
        return new Promise(resolve => {
            setTimeout(() => {

                https.get(`https://api.mattercloud.net/api/v3/main/address/${fromAddress.toString()}/utxo`, (res) => {
                    let data = '';
                    res.on('data', (chunk) => {
                        data += chunk;
                    });
        
                    res.on('end', () => {
                        let resp = JSON.parse(data);
                        resolve(resp[0].satoshis);
                    });
                });


            },2000);
        })

        
    }

    var postRawTx = (rawTx) => {
            // Send rawTransaction to WhatsOnApp
            const https = require('https');

            const data = JSON.stringify({
                txhex: rawTx
            });

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
                console.log(`statusCode: ${res.statusCode}`)

                res.on('data', d => {
                    //process.stdout.write(d)
                    console.log('Post data: ', d);
                })
            })

            req.on('error', error => {
                console.error(error)
            })

            req.write(data)
            req.end()
    }
    
    var buildForge = (utxo) => {
            const forge  = new Forge ({
                inputs: [utxo],
                outputs: [
                    {
                        to: this.toAddress,
                        satoshis: this.satAmount
                    },
                ],
                changeTo: utxo.address
            });

            forge.build().sign({keyPair});
            
            return forge.tx.toHex();
    }
}


module.exports = { Payment };