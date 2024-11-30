import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

// Contract details
const CONTRACT_ADDRESS = "<your_contract_address>";
const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "recipients",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "amounts",
        "type": "uint256[]"
      }
    ],
    "name": "distributeTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdrawTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getContractBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "balances",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [balance, setBalance] = useState(0);
  const [contractBalance, setContractBalance] = useState(0);
  const [userAddress, setUserAddress] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [amounts, setAmounts] = useState([]);

  useEffect(() => {
    const init = async () => {
      const ethereum = window.ethereum;
      if (!ethereum) {
        alert("MetaMask is required to use this app.");
        return;
      }

      const _provider = new ethers.providers.Web3Provider(ethereum);
      const _signer = _provider.getSigner();
      const _contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, _signer);

      setProvider(_provider);
      setSigner(_signer);
      setContract(_contract);

      const address = await _signer.getAddress();
      setUserAddress(address);

      const userBalance = await _contract.balances(address);
      setBalance(ethers.utils.formatEther(userBalance));

      const contractBal = await _contract.getContractBalance();
      setContractBalance(ethers.utils.formatEther(contractBal));
    };

    init();
  }, []);

  const distributeTokens = async () => {
    if (!recipients.length || !amounts.length) {
      alert("Please provide recipients and amounts.");
      return;
    }

    try {
      const tx = await contract.distributeTokens(recipients, amounts.map(amt => ethers.utils.parseEther(amt)));
      await tx.wait();
      alert("Tokens distributed successfully!");
    } catch (error) {
      console.error(error);
      alert("Error distributing tokens.");
    }
  };

  const withdrawTokens = async () => {
    try {
      const tx = await contract.withdrawTokens();
      await tx.wait();
      alert("Tokens withdrawn successfully!");
      const updatedBalance = await contract.balances(userAddress);
      setBalance(ethers.utils.formatEther(updatedBalance));
    } catch (error) {
      console.error(error);
      alert("Error withdrawing tokens.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>AirFlow Airdrop Distributor</h1>

      <section>
        <h2>Admin Dashboard</h2>
        <textarea
          placeholder="Enter recipients (comma-separated)"
          onChange={(e) => setRecipients(e.target.value.split(","))}
        />
        <textarea
          placeholder="Enter amounts (comma-separated)"
          onChange={(e) => setAmounts(e.target.value.split(","))}
        />
        <button onClick={distributeTokens}>Distribute Tokens</button>
      </section>

      <section>
        <h2>User Dashboard</h2>
        <p>Your Address: {userAddress}</p>
        <p>Your Balance: {balance} ETH</p>
        <p>Contract Balance: {contractBalance} ETH</p>
        <button onClick={withdrawTokens}>Withdraw Tokens</button>
      </section>
    </div>
  );
}

export default App;