/* global AlgoSigner */
import React, {useEffect, useState}  from 'react'
import axios from 'axios'
import Popup from 'reactjs-popup';
import  loading from '../../loading2.gif'
import { Algodv2, Indexer, makeAssetTransferTxnWithSuggestedParamsFromObject } from 'algosdk';

// const BASE_URL = "http://127.0.0.1:8000/api"
const BASE_URL = "https://algorand-endpoint.herokuapp.com/api"
const IMAGE_BASE_URL = "https://algorand-endpoint.herokuapp.com"

export default function Trainee({address}) {
    const [isLoading, setIsLoading] = useState(false)
    const [assetList, setAssetList] = useState([])
    const [note, setNote] = useState('')

    const [selectedAssetID, setSelectedAssetID] = useState(null)
    const [selectedAssetIndex, setSelectedAssetIndex] = useState(null)

    const [open, setOpen] = useState(false);
    const closeModal = () => setOpen(false);

    function noteOnChange(e){
      setNote(e.target.value)
    }

    useEffect(()=>{
      setIsLoading(true)
      getAssets()
      setIsLoading(false)
    },[])

    async function getAssets(){
      try{
          let response = await axios.post(`${BASE_URL}/get_assets_trainee`, {
              'address': address
          })
          console.log(response.data)
          let data = response.data;
          if(data!==undefined){
              if(data.success){
                  setAssetList(data.asset_list)
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

  async function update_asset_status(){
    try{
      let response = await axios.post(`${BASE_URL}/set_asset_final_status`, {
          'asset_id': selectedAssetID
      })
      console.log(response.data)
      let data = response.data;
      if(data!==undefined){
          if(data.success){
              alert("Optin success")
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

  async function optin(){
    try{
      if(note.length!==0 && selectedAssetID !== null && selectedAssetIndex !== null){
        setOpen(o => !o)
        setIsLoading(true)
        const algodServer = 'https://testnet-algorand.api.purestake.io/ps2'
        const indexerServer = 'https://testnet-algorand.api.purestake.io/idx2'
        const token = { 'X-API-Key': '3L6Urqa3Bs1PE1ghfZcgx9FHti0mtDSp2ECv3jql' }

        const port = '';

        let algodClient = new Algodv2(token, algodServer, port);
        // let indexerClient = new Indexer(token, indexerServer, port);

        algodClient.healthCheck().do()

        let txParamsJS = await algodClient.getTransactionParams().do()
        console.log(txParamsJS)

        // let result = await AlgoSigner.indexer({
        //   ledger: 'TestNet',
        //   path: `/v2/assets?name=${asset_name}&limit=5`,
        // })

        // let assets
        console.log(address)
        console.log(+selectedAssetIndex)
        // console.log(address)

        const txn = makeAssetTransferTxnWithSuggestedParamsFromObject({
          from: address,
          to: address,
          assetIndex: +selectedAssetIndex,
          note:AlgoSigner.encoding.stringToByteArray(note),
          amount:0,
          suggestedParams: {...txParamsJS}
        })
        console.log("CREATED")

        const txn_b64 = await AlgoSigner.encoding.msgpackToBase64(txn.toByte());
        console.log("ENCODED")
        console.log(txn_b64)

        let signedTxs = await AlgoSigner.signTxn([{txn: txn_b64}]) 
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

        await update_asset_status()
      }
      else{
        alert("All fields are required.")
      }

    }
    catch(e){
      console.log(e)
      alert(e.message)
    }
    finally{
        setIsLoading(false)
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

  function openNotePopup(asset_id, asset_index){
    setSelectedAssetID(asset_id)
    setSelectedAssetIndex(asset_index)
    setOpen(o => !o)
  }



  return (
    <div className='home-div'>
      {isLoading &&
            <div className='loading'>
                <img src={loading}></img>
            </div>}
            <h4>Assets for you</h4>
            {
                assetList.length>0?
                (
                    <div className="asset_list">
                      {  assetList.map(asset=>(
                        <div className="asset" key={asset.id}>
                            <h5 className='asset_content'>{asset.account.first_name} {asset.account.last_name}</h5>
                            <img src={asset.image_url}></img>
                            <div className="" style={{display:'flex', justifyContent:'space-between'}}>
                              <p className='asset_content'>{asset.asset_name}(#{asset.asset_index})</p>
                              {!asset.asset_status && <button className='btn' onClick={()=>openNotePopup(asset.id, asset.asset_index)}>Optin</button>}
                            </div>
                            
                        </div>
                    ))}
                    </div>
                )
                :(
                    <p>No assets found</p>
                )
            }

              <Popup open={open} closeOnDocumentClick onClose={closeModal}>
                  <div className="modal">
                      <a className="close" onClick={closeModal}>
                          &times;
                      </a>
                      {/* <label>
                          Name:
                      </label> */}
                      <div className="header"> Add Note </div>
                      <div className="content">
                        <input type="text" value={note} onChange={noteOnChange} placeholder='Note:' required/>
                        <input type="button" onClick={optin} value="Next"></input>
                      </div>
                  </div>
              </Popup>
    </div>
  )
}
