import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/JokePortal.json'

// A hook to get the Ethereum object from MetaMask 
const useEthereumObject = (props) => {
  const [ethereumObject, setEthereumObject] = useState(null);


  useEffect(() => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return
    }

    console.log("We have the ethereum object", ethereum);
    setEthereumObject(ethereum)
  });


  return ethereumObject;
}

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [message, setMessage] = useState();
  const [allJokes, setAllJokes] = useState([]);
  const [jokeValue, setJokeValue] = useState('');
  setJokeValue

  const ethereumObject = useEthereumObject()

  /**
   * Create a variable here that holds the contract address after you deploy!
   */
  const contractAddress = "0xDf66a52e5faEF548696A58F5251eC8f40b77736A";
  const contractABI = abi.abi

  /*
   * Create a method that gets all waves from your contract
   */
  const getAllJokes = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const jokePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

      /*
        * Call the getAllJokes method from your Smart Contract
        */
      const jokes = await jokePortalContract.getAllJokes();

      if (jokes.length) {
        let jokesCleaned = [];
        jokes.forEach(joke => {
          jokesCleaned.push({
            address: joke.joker,
            timestamp: new Date(joke.timestamp * 1000),
            message: joke.message
          });
        });

        setAllJokes(jokesCleaned);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const checkIfWalletIsConnected = async () => {
    try {
      const accounts = await ethereumObject.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error)
    }
  }

  /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const accounts = await ethereumObject.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const handleTextAreaChange = (e) => {
    setJokeValue(e.target.value);
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const jokePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      setMessage('Getting your signiture...\nPlease sign to send your clap to the Rinkeby Ethereum Test Network.');


      const clapTXN = await jokePortalContract.joke(jokeValue);
      setMessage(`Mining... ${clapTXN.hash}\nThanks for signing. `);

      await clapTXN.wait();
      setMessage(`Mined -- ${clapTXN.hash}\nYour clap is on the blockchain now! Thank you so much!`);

      /*
        * Call the getAllJokes method from your Smart Contract
        */
      const jokes = await jokePortalContract.getAllJokes();

      if (jokes.length) {
        let jokesCleaned = [];
        jokes.forEach(joke => {
          jokesCleaned.push({
            address: joke.joker,
            timestamp: new Date(joke.timestamp * 1000),
            message: joke.message
          });
        });

        setAllJokes(jokesCleaned);
      }
    } catch (error) {
      console.log(error);
    }
  }

  /*
  * This runs our function when the page loads.
  */
  useEffect(() => {
    if (!ethereumObject) {
      console.log("Get MetaMask!");
      return;
    }

    checkIfWalletIsConnected();
    getAllJokes();
  }, [ethereumObject])

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          👋 Hey there!
          </div>
        <div className="bio">
          I'm working on becoming a Web3 dev. I also love jokes and want to hear your best joke when I'm done with this dApp! In the meantime, clap clap clap!
          </div>
        <form onSubmit={(e) => handleSubmit(e)}>
          {/*TODO: add label*/}
          <textarea id="w3review" name="w3review" rows="4" cols="50" onChange={handleTextAreaChange} value={jokeValue} />
          <button type="submit" className="waveButton">
            <strong>Submit joke!</strong>
          </button>
        </form>
        <button className="connectButton" onClick={connectWallet}>
          <strong> {currentAccount ? "Wallet connected 🟢" : "Connect wallet ⚪"}</strong>
        </button>
        {message && <pre className="message">
          {message}
        </pre>}

        {allJokes.map((joke, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {joke.address}</div>
              <div>Time: {joke.timestamp.toString()}</div>
              <div>Message: {joke.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
}
