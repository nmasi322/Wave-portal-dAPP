import  React, {useEffect, useState} from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json"

export default function App() {

   const [currentAccount, setCurrentAccount] = useState("")
   const [state, setState] = useState("")
   const [totalWavers, setTotalWavers] = useState([])
   const [waverMessage, setWaverMessage] = useState("")
   const [waveCount, setWaveCount] = useState("");
   const contractAddress = "0xF0aA5acc77834959D19bABd320D395c746CE1028";
   const contractABI = abi.abi
   let account;

   // get all waves from constructor
  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();


        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = waves.map(wave => {
          return{
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
        };
        });

        /*
         * Store data in React State
         */
        setTotalWavers(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

    // check if wallet is conneected
   const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Make sure you have metamask❗️");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      /*
      * Check if we're authorized to access the user's wallet
      */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        account = accounts[0];
        setCurrentAccount(account)
        getAllWaves()
      } else {
        console.log("No authorized account found!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  // connect wallet
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }else{
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        console.log("Connected", accounts[0]);
        alert("Wallet connected successfully ✅")
        setCurrentAccount(accounts[0]);
      }
    } catch (error) {
      console.log(error)
    }
  }

  // get waver message
  const getWaverMessage = (e) => {
    e.preventDefault()
    let message = e.target.value
    setWaverMessage(message)
  }

  // wave
  const wave = async (e)=>{
    e.preventDefault()
    try{
      const {ethereum} = window

      if (ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer)

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        /*
        * Execution of the actual wave from smart contract
        */
        const waveTxn = await wavePortalContract.wave(waverMessage, {gasLimit: 300000});
        setState("Mining...");

        await waveTxn.wait();
        setState(`Mined! Thank you for the wave! I just sent you 0.001 fake eth! 😊`)
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        setWaveCount(count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
      setState(`Wave failed, please wait at least thirty seconds❗️`)
    }
    }

  /** * Listen in for emitter events! */
  useEffect(() => {
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      setTotalWavers(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
    wavePortalContract.on("NewWave", onNewWave);
  }

  return () => {
    if (wavePortalContract) {
      wavePortalContract.off("NewWave", onNewWave);
    }
  };
}, []);

  
  

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])
  
  return (
    <div className="mainContainer">
      <div>
      <div className="dataContainer">
        <div className="header">Hey there! 👋🏾</div>

        <div className="bio">
        I am Divine and this is my wave portal project dApp, built with reactjs, solidity and hardhat 😊 <br /> Connect your Ethereum wallet and wave at me!
        </div>
        <form onSubmit={wave}>
          <input type="text" onChange={getWaverMessage} placeholder="Enter a message for me! :)" name="message" required /> <br />
          {
            currentAccount && <button type="submit" className="waveButton">
            👋🏾 Wave at Me 👋🏾
          </button>
          }
          {
            !currentAccount && <button className="waveButton" onClick={connectWallet}>
            Connect your wallet
          </button>
          }
        </form>
        <div>
          <h3>Note:</h3>
          <p>Before you can send me a wave, you must have some fake eth in your rinkeby metamask wallet</p>
          <p>Your wallet must be rinkeby test network</p>
          <p>Get some fake eth <a href="https://faucets.chain.link/rinkeby">here</a> (rinkeby)</p>
          <p>Now you can send me a wave! Oh, and your wallet address will be printed below :)</p>
          <p>You'll get a little prize if you wave at me :) But you can't wave more than once! After each wave, wait 30 seconds before you can wave again else, it won't work! :)</p>
        </div>
        {
          state && <p className="mineState">{state}</p>
        }
        
      </div>
      <h2 className="wave-head">Total wavers 👋🏾 {waveCount}</h2>
        {
          totalWavers && totalWavers.map((waver, index) => {
            return (
              <div className="wave-table" key={index}>
                <p>Waver address: {waver.address}</p>
                <p>Time waved: {waver.timestamp.toString()}</p>
                <p>Waver message: {waver.message}</p>
              </div>
              )
          })
        }
        <div className="footer">
          <p>Built by <a href="https://twitter.com/divine_edeh1"> Divine</a> 😊</p>
        </div>
      </div>
    </div>
  );
}
