/* global AlgoSigner */
import React, {useState, useEffect} from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { create } from 'ipfs-http-client'
import { Algodv2, makeAssetCreateTxnWithSuggestedParamsFromObject } from 'algosdk';
import  loading from '../../loading2.gif'
import MyAlgoConnect from '@randlabs/myalgo-connect';

// import {Buffer} from 'buffer';
// Buffer.from('anything','base64');
window.Buffer = window.Buffer || require("buffer").Buffer; 

export default function Admin({address}) {
    const [isLoading, setIsLoading] = useState(false)
    const [recieverAddress, setRecieverAddress] = useState('')
    const [assetName, setAssetName] = useState('')
    const [unitName, setUnitName] = useState('')
    const [note, setNote] = useState('')
    const [file, setFile] = useState(null);

    function recieverAddressOnChange(e){
        setRecieverAddress(e.target.value)
    }
    function assetNameOnChange(e){
        setAssetName(e.target.value)
    }
    function unitNameOnChange(e){
        setUnitName(e.target.value)
    }
    function noteOnChange(e){
        setNote(e.target.value)
    }

    async function mint(e){
        e.preventDefault()
        if(recieverAddress.length !==0 && assetName.length !==0  && unitName.length !==0  && note.length !==0 ){
            try{
                setIsLoading(true)
                const server = 'https://testnet-algorand.api.purestake.io/ps2'
                const token = { 'X-API-Key': '3L6Urqa3Bs1PE1ghfZcgx9FHti0mtDSp2ECv3jql' }
                const port = '';

                let algodClient = new Algodv2(token, server, port);
                let health = await algodClient.healthCheck().do()
                
                let txParamsJS = await algodClient.getTransactionParams().do()
                console.log(txParamsJS)

                const txn = makeAssetCreateTxnWithSuggestedParamsFromObject({
                    from: address,
                    assetName: assetName,
                    unitName: unitName,
                    total: 1,
                    decimals: 0,
                    assetURL: "https:google.com",
                    note: AlgoSigner.encoding.stringToByteArray(note),
                    suggestedParams: {...txParamsJS}
                })
                console.log("CREATED")

                const txn_b64 = AlgoSigner.encoding.msgpackToBase64(txn.toByte());
                console.log("ENCODED")


                // const myAlgoConnect = new MyAlgoConnect();

                let signedTxs = await AlgoSigner.signTxn([{txn: txn_b64}])

                // const signedTxs = await myAlgoConnect.signBytes(txn_b64, address);

                console.log("SIGNED TXS")
                console.log(signedTxs)

                let tx = await AlgoSigner.send({
                    ledger: 'TestNet',
                    tx: signedTxs[0].blob
                  })

                console.log("SEND:")
                console.log(tx)
                  
                let d = await AlgoSigner.algod({
                    ledger: 'TestNet',
                    path: '/v2/transactions/pending/' + tx.txId
                  })
                
                console.log("D")
                console.log(d)
                let txInfo = await waitForConfirmation( algodClient, tx.txId)
                console.log("TX INFO")
                console.log(txInfo)
                
            }catch(e){
                console.log(e)
                alert(e.message)
            }finally{
                setIsLoading(false)
            }
        }else{
            alert("Address required")
        }
    }

    // async function waitForConfirmation(txId, client){
    //     const status = await client.status().do();
    //     let lastRound = status["last-round"];
    //     let pendingInfo = await client.pendingTransactionInformation(txId).do();
    //     while (pendingInfo["confirmed-round"] !== null && pendingInfo["confirmed-round"] > 0){
    //         lastRound++;
    //         await client.statusAfterBlock(lastRound).do();
    //         pendingInfo = await client.pendingTransactionInformation(txId).do();
    //     }
    //     return pendingInfo;
    // }

    const waitForConfirmation = async function (algodclient, txId) {
        let response = await algodclient.status().do();
        let lastround = response["last-round"];
        while (true) {
            const pendingInfo = await algodclient.pendingTransactionInformation(txId).do();
            if (pendingInfo["confirmed-round"] !== null && pendingInfo["confirmed-round"] > 0) {
                //Got the completed Transaction
                console.log("Transaction " + txId + " confirmed in round " + pendingInfo["confirmed-round"]);
                return pendingInfo;
            }
            lastround++;
            await algodclient.statusAfterBlock(lastround).do();
        }
    };
    


    const retrieveFile = (e) => {
        const data = e.target.files[0];
        const reader = new window.FileReader();
        reader.readAsArrayBuffer(data);
        reader.onloadend = () => {
            setFile(Buffer(reader.result));
        }
        e.preventDefault();  
      }

  return (
    <div className="home-div">
        {isLoading &&
            <div className='loading'>
                <img src={loading}></img>
            </div>}
        <Tabs>
            <TabList style={{backgroundColor:'white'}}>
                <Tab>Mint</Tab>
                <Tab>Requests</Tab>
                <Tab>NFTs</Tab>
            </TabList>

            <TabPanel>
                <h2>Mint</h2>
                <form action="">
                    <input type="text" value={recieverAddress} onChange={recieverAddressOnChange} placeholder='Reciever Address:' required/>
                    <input type="text" value={assetName} onChange={assetNameOnChange} placeholder='Asset Name:' required/>
                    <input type="text" value={unitName} onChange={unitNameOnChange} placeholder='Unit Name:' required/>
                    <input type="text" value={note} onChange={noteOnChange} placeholder='Note:' required/>
                    <input type="file" name="data" onChange={retrieveFile} />

                    <input type="button" onClick={mint} value="Mint"></input>
                </form>
            </TabPanel>
            <TabPanel>
                <h2>Requests</h2>
            </TabPanel>
            <TabPanel>
                <h2>NFTs</h2>
            </TabPanel>
        </Tabs>
    </div>
  )
}
