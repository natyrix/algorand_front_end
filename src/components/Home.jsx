/* global AlgoSigner */
import React, {useState, useEffect}  from 'react'
import axios from 'axios'
import './Home.css'
import MyAlgoConnect from '@randlabs/myalgo-connect';
import loading from '../loading2.gif';




function Home() {
    const [response, setResponse] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [isAccountSelected, setIsAccountSelected] = useState(false)
    const [accounts, setAccounts] = useState([])
    const [selectedAccount, setSetselectedAccount] = React.useState('');


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
    }

    const Dropdown = ({ label, value, options, onChange })=>{
        return (
            <label>
              {label}
              <select value={value} onChange={onChange}>
                {options.map((option) => (
                  <option value={option} key={option}>{option}</option>
                ))}
              </select>
            </label>
          );
    }

    const handleChange = (event) => {
        setSetselectedAccount(event.target.value);
    };


    return (
        <>
            {isLoading &&
                <img src={loading}></img>}
            {accounts.length > 0 && (<Dropdown label="Select accout" value={selectedAccount} onChange={handleChange} options={accounts}/>)}
        </>
        
    )
}

export default Home