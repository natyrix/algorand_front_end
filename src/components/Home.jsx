import React, {useState, useEffect}  from 'react'
import axios from 'axios'
import MyAlgoConnect from '@randlabs/myalgo-connect';
import loading from '../loading2.gif';


function Home() {
    const [response, setResponse] = useState({})
    const [isLoading, setIsLoading] = useState(false)

    useEffect(()=>{
        setIsLoading(true)
        connectWallet()
        setIsLoading(false)
      },[])

    async function connectWallet(){
        const myAlgoConnect = new MyAlgoConnect();
        const acc = await myAlgoConnect.connect();
        console.log(acc[0].address)
    }
    return (
        <>
      {/* <h1>My Application</h1> */}
      {isLoading 
?<img src={loading}></img>:<div>Home</div>}
    </>
        
    //     {isLoading
    //   <img src={loading}></img>
    //         :<div>Home</div>}
        
        
    )
}

export default Home