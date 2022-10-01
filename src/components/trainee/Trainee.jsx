import React, {useEffect, useState}  from 'react'
import axios from 'axios'
import  loading from '../../loading2.gif'

const BASE_URL = "http://127.0.0.1:8000/api"
const IMAGE_BASE_URL = "http://127.0.0.1:8000"

export default function Trainee({address}) {
    const [isLoading, setIsLoading] = useState(false)
    const [assetList, setAssetList] = useState([])

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
                              <p className='asset_content'>#{asset.asset_index}</p>
                              {!asset.asset_status && <button className='btn'>Optin</button>}
                            </div>
                            
                        </div>
                    ))}
                    </div>
                )
                :(
                    <p>No assets found</p>
                )
            }
    </div>
  )
}
