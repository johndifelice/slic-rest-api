'use strict'

function Payment(_privKey){
    const bsv = require('bsv');
    const {Forge} = require('txforge');
    const https = require('https');

    this.privKey = new bsv.PrivKey().fromString(_privKey);
    this.keyPair = new bsv.KeyPair().fromPrivKey(this.privKey);
    this.pubKey = this.keyPair.pubKey;
    //this.fromAddress = new bsv.Address().fromPubKey(this.pubKey);

    this.toAddress = '';
    this.satAmount = '';
    this.satoshiBalance;
    
    this.sendPayment = (_toAddress, _satAmount,_opReturn) => {
        this.toAddress = _toAddress;
        this.satAmount = _satAmount;
        
        return new Promise(resolve => {
            
            setTimeout(() => {
                // privKey = 'L1FJLDZWMrBR7JmXKPCfzrUZahBWqLdPaGnDjWQJLJFXAKmvp67V'
                //privKey = new bsv.PrivKey().fromString(privKey);
                console.log('PrivateKey: ', this.privKey.toString());

                //const keyPair = new bsv.KeyPair().fromPrivKey(this.privKey);
                //const pubKey = keyPair.pubKey;
                console.log('Public Key: ',this.pubKey.toString());

                //this.fromAddress = new bsv.Address().fromPubKey(this.pubKey);
                this.fromAddress = new bsv.Address().fromString("1AMzdZFfkJC7PnxXQndCPKp2q2v8TZSW9E")
                console.log('fromAddress: ',this.fromAddress.toString());
            
                https.get(`https://api.mattercloud.net/api/v3/main/address/${this.fromAddress.toString()}/utxo`, (res) => {
                    console.log("Before mattercloud utxo get.")
                    let data = '';
                    res.on('data',(chunk) => {
                        data += chunk;
                    });

                    res.on('end', () => {
                        console.log("After mattercloud utxo get.")
                        let resp = JSON.parse(data);
                        //console.log(resp);
                        console.log("utxo: ", resp);
                        console.log("data: ",data);
                        let rawTx = buildForge(resp[0]);
                        console.log('Raw txt: ', rawTx);

                        postRawTx(rawTx);
                        console.log("SUCCESS");
                        resolve('SUCCESS');
                    });    

                    res.on('error', error => {
                        console.error("Error:",error)
                    })
                })

            },2000);    
        })
    }

    
    this.getBalance = () => {
        return new Promise(resolve => {
            setTimeout(() => {

                https.get(`https://api.mattercloud.net/api/v3/main/address/${this.fromAddress.toString()}/utxo`, (res) => {
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
            console.log("In buildForge");
            //console.log("utxo: ", utxo);
            console.log("build-forge opReturn: ", _opReturn);
            try{
                const forge  = new Forge ({
                    inputs: [utxo],
                    outputs: [
                        {
                            to: this.toAddress,
                            satoshis: this.satAmount
                        }
                        // ,
                        // {
                        //     data:['19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut','opReturn value','utf-8']
                        // }
                    ],
                    changeTo: utxo.address
                });
            } catch (error){
                log.console("buildForge Error: ", error);
            }

            console.log("forge: ", forge);

            forge.build().sign({keyPair});
            
            console.log("Raw transaction: ", forge.tx.toHex());
            return forge.tx.toHex();
    }
}


module.exports = { Payment };