import './App.css';
import Home from './components/Home';
import  logo from './logo.svg'

function App() {


  return (
    <>
      <div style={{zIndex:'155'}}>
        <ul>
          <li>
            <div className='' style={{justifyContent:'center', paddingTop:'6px'}}>
                <img src={logo}></img>
            </div>
          </li>
          <li><a href="#">10Academy</a></li>
        </ul>
      </div>
      <div className="App">
        <Home/>
      </div>
    </>
    
  );
}

export default App;
