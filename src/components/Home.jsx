/* global AlgoSigner */
import React, {useState, useEffect}  from 'react'
import axios from 'axios'
import './Home.css'
import MyAlgoConnect from '@randlabs/myalgo-connect';
import loading from '../loading2.gif';
import Popup from 'reactjs-popup';
import Trainee from './trainee/Trainee';
import Admin from './admin/Admin';


const BASE_URL = "https://algorand-endpoint.herokuapp.com/api"



function Home() {
    // const [response, setResponse] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [isAccountSelected, setIsAccountSelected] = useState(false)
    const [accounts, setAccounts] = useState([])
    const [selectedAccount, setSetselectedAccount] = React.useState('');

    const [isAdmin, setIsAdmin] = useState(false)
    const [isTrainee, setIsTrainee] = useState(false)

    const [open, setOpen] = useState(false);
    const closeModal = () => setOpen(false);

    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")

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
        setSetselectedAccount(ac[0])
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
        setSetselectedAccount(event.target.value);
    };

    async function nextButtonClicked(e){
        e.preventDefault()
        setIsLoading(true)
        console.log(selectedAccount)
        try{
            let response = await axios.post(`${BASE_URL}/check_account`, {
                'address': selectedAccount
            })
            console.log(response.data)
            let data = response.data;
            if(data!==undefined){
                if(data.success){
                    console.log("REGISTERED")
                    if(data.account.is_admin){
                        setIsAdmin(true)
                    }
                    else{
                        setIsTrainee(true)
                    }
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

        if(firstName.length != 0 && lastName.length!=0){
            try{
                setIsLoading(true)
                let response = await axios.post(`${BASE_URL}/create_account`, {
                    'address': selectedAccount,
                    'first_name': firstName,
                    'last_name': lastName
                })
                console.log(response.data)
                
                let data = response.data;
                if(data!==undefined){
                    if(data.success){
                        setOpen(false)
                        setIsTrainee(true)
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

    function logout(){
        setIsAdmin(false)
        setIsTrainee(false)
    }

    if(isTrainee){
        return (
            <div className="home-div">
                <button onClick={logout} className='logoutbtn'>Logout</button>
                <Trainee address={selectedAccount}/>
            </div>
        )

    }
    if(isAdmin){
        return(
            <div className="home-div">
                <button onClick={logout} className='logoutbtn'>Logout</button>
                <Admin address={selectedAccount}/>
            </div>
        )
    }

    return (
        <div className='home-div'>
            {isLoading &&
                <div className='loading'>
                    <img src={loading}></img>
                </div>}
            <>
                {accounts.length > 0 && (
                    <>
                        <Dropdown label="Select accout" value={selectedAccount} onChange={handleChange} options={accounts}/>
                        <br />
                        <input type="button" onClick={nextButtonClicked} value="Next>>"></input>
                    </>
                )}
                <Popup open={open} closeOnDocumentClick onClose={closeModal}>
                    <div className="modal">
                        <a className="close" onClick={closeModal}>
                            &times;
                        </a>
                        {/* <label>
                            Name:
                        </label> */}
                        <div className="header"> New user registeration </div>
                        <div className="content">
                            <input type="text" value={firstName} onChange={firstNameOnChange} placeholder='First Name:'/>
                            <input type="text" value={lastName} onChange={lastNameOnChange} placeholder='Last Name:'/>    
                            <input type="button" onClick={registerButtonClicked} value="Register"></input>
                        </div>
                    </div>
                </Popup>
            </>    
            
            
        </div>
        
    )
}

export default Home