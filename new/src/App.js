import { useState, useEffect } from "react";
import "./App.css";
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
import Funder from "./contracts/Funder.json";

function App() {
  const [web3Api, setWeb3Api] = useState({provider: null,web3: null,contract:null})
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [reload, setReload]=useState(false);

  const Reload=()=>{
    setReload(!reload); //browser reloads automatically
  }

  useEffect(()=>{
    const loadProvider = async () => {
      const provider = await detectEthereumProvider();
      if (provider) {
        provider.request({ method: "eth_requestAccounts" });
        const web3 = new Web3(provider);
        
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = Funder.networks[networkId];
        const contract = new web3.eth.Contract(Funder.abi,deployedNetwork.address );
        

        setWeb3Api({provider,web3,contract});}
    }
    loadProvider();
  },[])
  //console.log(web3Api);
  
  useEffect(() => {
    const getAccount = async () => {
      const accounts = await web3Api.web3.eth.getAccounts();
      setAccount(accounts[0]);
    };
    web3Api.web3 && getAccount();
  }, [web3Api.web3]);
  //console.log(account);
 
 useEffect(() => {
    const loadBalance = async () => {
      const { contract, web3 } = web3Api;
      const add=contract._address;
      console.log(add);
      const balance = await web3.eth.getBalance(add);
      setBalance(web3.utils.fromWei(balance, "ether"));
    };
    web3Api.contract && loadBalance();
  }, [web3Api,reload]);
  
  const transferFund=async()=>{
    const {contract,web3}=web3Api;
    const amount=web3.utils.toWei("2","ether");
    await contract.methods.transfer().send({from:account,value:amount});
    Reload();
  }

  const WithdrawFund=async()=>{
    const {contract,web3}=web3Api;
    const amount=web3.utils.toWei("2","ether");
    await contract.methods.withdraw(amount).send({from:account});
    Reload();
  }
   
  


  return (
    <>
    <div class="card text-center">
      <div class="card-header">Funding</div>
      <div class="card-body">
        <h5 class="card-title">Balance: {balance? balance:"cannot fetch"} ETH </h5>
        <p class="card-text">
          Account :{account ? account : "not connected"}

        </p>
        {/* <button
          type="button"
          class="btn btn-success"
          onClick={async () => {
            const accounts = await window.ethereum.request({
              method: "eth_requestAccounts",
            });
            console.log(accounts);
          }}
        >
          Connect to metamask
        </button> */}
        &nbsp;
        <button type="button" class="btn btn-success  " onClick={transferFund} >
          Transfer
        </button>
        &nbsp;
        <button type="button" class="btn btn-primary " onClick={WithdrawFund}>
          Withdraw
        </button>
      </div>
      <div class="card-footer text-muted">Code</div>
    </div>
  </>
  );
}

export default App;
