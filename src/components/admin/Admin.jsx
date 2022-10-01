/* global AlgoSigner */
import React, {useState, useEffect} from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { create } from 'ipfs-http-client'
import Popup from 'reactjs-popup';
import axios from 'axios'
import { Algodv2, makeAssetCreateTxnWithSuggestedParamsFromObject } from 'algosdk';
import  loading from '../../loading2.gif'
import MyAlgoConnect from '@randlabs/myalgo-connect';
import RequestsList from './RequestsList';
import NFTs from './NFTs';
// import fs from 'fs'

// import {Buffer} from 'buffer';
// Buffer.from('anything','base64');
window.Buffer = window.Buffer || require("buffer").Buffer; 

const BASE_URL = "https://algorand-endpoint.herokuapp.com/api"
const IMAGE_BASE_URL = "https://algorand-endpoint.herokuapp.com"


export default function Admin({address}) {
    const [isLoading, setIsLoading] = useState(false)
    const [recieverAddress, setRecieverAddress] = useState('')
    const [assetName, setAssetName] = useState('')
    const [unitName, setUnitName] = useState('')
    const [accounts, setAccounts] = useState([])
    const [note, setNote] = useState('')
    const [file, setFile] = useState(null);
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [open, setOpen] = useState(false);
    const closeModal = () => setOpen(false);

    function firstNameOnChange(e){
        setFirstName(e.target.value)
    }
    function lastNameOnChange(e){
        setLastName(e.target.value)
    }

    useEffect(()=>{
        setIsLoading(true)
        getAccounts()
        setIsLoading(false)
      },[])

    async function getAccounts(){
        await AlgoSigner.connect({
            ledger: 'TestNet'
          });
        const accts = await AlgoSigner.accounts({
            ledger: 'TestNet'
          });
        let fetchedAccounts = accts
        // console.log(fetchedAccounts)
        // console.log(fetchedAccounts.length)
        let ac = []
        for(let i=0;i<fetchedAccounts.length;i++){
            ac.push(fetchedAccounts[i].address)
            // console.log(fetchedAccounts[i].address)
        }
        // console.log(ac)
        setAccounts([])
        setAccounts(ac)
        setRecieverAddress(ac[0])
    }

    const Dropdown = ({ label, value, options, onChange })=>{
        return (
            <>
              <p>{label}</p>
              <select value={value} onChange={onChange}>
                {options.map((option) => (
                  <option value={option} key={option}>{option}</option>
                ))}
              </select>
            </>
          );
    }

    const handleChange = (event) => {
        setRecieverAddress(event.target.value);
    };

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

    async function update_asset_index(id, asset_index){
        try{
            let response = await axios.post(`${BASE_URL}/set_asset_index`, {
                'asset_id': id,
                'asset_index': asset_index
            })
            console.log(response.data)
            let data = response.data;
            if(data!==undefined){
                if(data.success){
                    alert("Asset created")
                }else{
                    alert(data.message)
                }
            }
            else{
                alert("Something went wrong")
            }
        }
        catch(e){
            console.log(e)
            alert(e.message)
        }
    }

    async function upload_file_and_save(assetID){
        if(assetID !== undefined){
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
            alert("Asset ID required")
        }
    }

    async function check_account(e){
        e.preventDefault()
        setIsLoading(true)
        console.log(recieverAddress)
        try{
            let response = await axios.post(`${BASE_URL}/check_account`, {
                'address': recieverAddress
            })
            console.log(response.data)
            let data = response.data;
            if(data!==undefined){
                if(data.success){
                    console.log("REGISTERED")
                    await upload_file_and_save(e);
                }
                else{
                    if(data.status_code!==undefined){
                        if(data.status_code === 111){
                            console.log("REGISTER")
                            setOpen(o => !o)
                        }
                    }
                    else{
                        alert(data.message)
                    }
                }
            }else{
                alert("Something went wrong")
            }
        }
        catch(e){
            alert(e.message)
        }
        finally{
            setIsLoading(false)
        }
    }

    async function registerButtonClicked(e){
        e.preventDefault()
        console.log("Registering")
        console.log(firstName)
        console.log(lastName)

        if(firstName.length !== 0 && lastName.length!==0){
            try{
                setIsLoading(true)
                let response = await axios.post(`${BASE_URL}/create_account`, {
                    'address': recieverAddress,
                    'first_name': firstName,
                    'last_name': lastName
                })
                console.log(response.data)
                
                let data = response.data;
                if(data!==undefined){
                    if(data.success){
                        upload_file_and_save(e)
                    }
                    else{
                        alert(data.message)
                    }
                }else{
                    alert("Something went wrong")
                }
            }
            catch(e){
                alert(e.message)
            }
            finally{
                setIsLoading(false)
            }
        }
        else{
            alert("All fields are required.")
        }
    }



    async function mint(created_id, url){
        if(recieverAddress.length !==0 && assetName.length !==0  && unitName.length !==0  && note.length !==0 && file!==null){
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
                    // assetURL: url,
                    assetURL: "http://google.com",
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

                if(txInfo['asset-index']!==undefined){
                    update_asset_index(created_id, txInfo['asset-index'])
                }


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
    


    const retrieveFile = (e) => {
        // const data = e.target.files[0];
        // const reader = new window.FileReader();
        // reader.readAsArrayBuffer(data);
        // reader.onloadend = () => {
        //     setFile(Buffer(reader.result));
        // }
        setFile(e.target.files[0])
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
                    {accounts.length > 0 ? (
                        <>
                            <Dropdown label="Select accout" value={recieverAddress} onChange={handleChange} options={accounts}/>
                            <br />
                        </>
                    ):
                    <input type="text" value={recieverAddress} onChange={recieverAddressOnChange} placeholder='Reciever Address:' required/>}
                    
                    <input type="text" value={assetName} onChange={assetNameOnChange} placeholder='Asset Name:' required/>
                    <input type="text" value={unitName} onChange={unitNameOnChange} placeholder='Unit Name:' required/>
                    <input type="text" value={note} onChange={noteOnChange} placeholder='Note:' required/>
                    <input type="file" name="data" onChange={retrieveFile} />

                    <input type="button" onClick={check_account} value="Mint"></input>
                </form>
                <Popup open={open} closeOnDocumentClick onClose={closeModal}>
                    <div className="modal">
                        <a className="close" onClick={closeModal}>
                            &times;
                        </a>
                        {/* <label>
                            Name:
                        </label> */}
                        <div className="header"> user not found, register </div>
                        <div className="content">
                            <input type="text" value={firstName} onChange={firstNameOnChange} placeholder='First Name:'/>
                            <input type="text" value={lastName} onChange={lastNameOnChange} placeholder='Last Name:'/>    
                            <input type="button" onClick={registerButtonClicked} value="Register"></input>
                        </div>
                    </div>
                </Popup>

            </TabPanel>
            <TabPanel>
                <h2>Requests</h2>
                <RequestsList address={address}/>
            </TabPanel>
            <TabPanel>
                <h2>NFTs</h2>
                <NFTs address={address}/>
            </TabPanel>
        </Tabs>
    </div>
  )
}
