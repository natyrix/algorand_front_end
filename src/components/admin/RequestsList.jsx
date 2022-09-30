/* global AlgoSigner */
import React, {useEffect, useState} from 'react'
import  loading from '../../loading2.gif'
import Popup from 'reactjs-popup';
import axios from 'axios'
import { Algodv2, makeAssetCreateTxnWithSuggestedParamsFromObject } from 'algosdk';


const BASE_URL = "http://127.0.0.1:8000/api"
const IMAGE_BASE_URL = "http://127.0.0.1:8000"


function RequestsList({address}) {
    const [requestsList, setRequestsList] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    const [open, setOpen] = useState(false);
    const closeModal = () => setOpen(false);

    const [assetName, setAssetName] = useState('')
    const [unitName, setUnitName] = useState('')
    const [note, setNote] = useState('')
    const [file, setFile] = useState(null);
    const [recieverAddress, setRecieverAddress] = useState('')


    useEffect(()=>{
        setIsLoading(true)
        getRequestsList()
        setIsLoading(false)
      },[])

    function assetNameOnChange(e){
        setAssetName(e.target.value)
    }
    function unitNameOnChange(e){
        setUnitName(e.target.value)
    }
    function noteOnChange(e){
        setNote(e.target.value)
    }

    const retrieveFile = (e) => {
        setFile(e.target.files[0])
        e.preventDefault();  
      }


    async function getRequestsList(){
        try{
            let response = await axios.post(`${BASE_URL}/get_all_requests`, {
                'address': address
            })
            console.log(response.data)
            let data = response.data;
            if(data!==undefined){
                if(data.success){
                    setRequestsList(data.account_list)
                }else{
                    alert(data.message)
                }
            }else{
                alert("Something went wrong")
            }
        }catch(e){
            console.log(e)
            alert(e.message)
        }
    }

    async function upload_file_and_save(){
        if(recieverAddress !== undefined){
            let formData = new FormData();
            formData.append('file', file)
            formData.append('address', recieverAddress)
            formData.append('asset_id', 'assetID')
            try{
                // let res = await fetch(`${BASE_URL}/file_upload_and_save_asset`, {
                //     method: 'POST',
                //     headers: {
                //         Accept: 'application/json, text/plain, */*'
                //     },
                //     body:formData,
                // })
                let res = await axios.post(`${BASE_URL}/file_upload_and_save_asset`, formData);
                console.log(res)
                let data = res.data;

                if(data!==undefined){
                    if(data.success){
                        // update_asset_index(data.asset.id, 123)
                        await mint(data.asset.id,`${IMAGE_BASE_URL}${data.asset.image_url}`)
                    }else{
                        alert(data.message)
                    }
                }
                else{
                    alert("Something went wrong")
                }

            }catch(e){
                console.log(e)
                alert(e.message)
            }
        }
        else{
            alert("Reciever Address required")
        }
    }

    async function mint(created_id, url){
        if(assetName.length !==0  && unitName.length !==0  && note.length !==0 && file!==null){
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
                    assetURL: url,
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
            alert("All Fields are required")
        }
    }

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

    function createClicked(ad){
        setRecieverAddress(ad)
        setOpen(o => !o)
    }

  return (
    <div className='home-div'>
        {isLoading &&
            <div className='loading'>
                <img src={loading}></img>
            </div>}
        {
            requestsList.length > 0?(
                requestsList.map(r=>(
                    <div className="request_list" key={r.id}>
                        <p>{r.first_name} {r.last_name}({r.address})</p>
                        <button className='btn' onClick={()=>createClicked(r.address)}>Create Asset</button>
                    </div>
                ))
            ):(
                <p>No Request found</p>
            )
        }
        <div className="" >
            <Popup open={open} closeOnDocumentClick onClose={closeModal}>
                <div className="modal" style={{width:'70%'}}>
                    <a className="close" onClick={closeModal}>
                        &times;
                    </a>
                    {/* <label>
                        Name:
                    </label> */}
                    <div className="header"> Create an asset </div>
                    <div className="content">
                        <input type="text" value={assetName} onChange={assetNameOnChange} placeholder='Asset Name:' required/>
                        <input type="text" value={unitName} onChange={unitNameOnChange} placeholder='Unit Name:' required/>
                        <input type="text" value={note} onChange={noteOnChange} placeholder='Note:' required/>
                        <input type="file" name="data" onChange={retrieveFile} />
                        <input type="button" onClick={upload_file_and_save} value="Mint"></input>
                    </div>
                </div>
            </Popup>
        </div>
        
    </div>
  )
}

export default RequestsList