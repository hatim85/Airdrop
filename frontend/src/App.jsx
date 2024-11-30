import React, { useState, useEffect } from "react";
import AdminPanel from "./AdminPanel";
import UserDashboard from "./UserDashboard";
import { ethers } from "ethers";
import { AIRDROP_ABI, AIRDROP_ADDRESS } from "./utils/config.js"; // Adjust path as needed
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [networkError, setNetworkError] = useState("");
  const STAKING_NETWORK_ID = "0x103D"; // Hardhat default network chain ID

  // Connect Wallet Functionality
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed!");
      return;
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      setWalletAddress(address);

      checkNetwork(provider);
      checkAdminStatus(address, signer);
    } catch (error) {
      console.error("Failed to connect wallet:", error.message);
      toast.error("Failed to connect wallet");
    }
  };

  // Check Network
  const checkNetwork = async (provider) => {
    if (!window.ethereum) return;

    try {
      const network = await provider.getNetwork();
      console.log("Current Network:", network.chainId);
      if (network.chainId !== parseInt(STAKING_NETWORK_ID, 16)) {
        setNetworkError("Please switch to the Hardhat network.");
      } else {
        setNetworkError("");
      }
    } catch (error) {
      console.error("Error checking network:", error);
      toast.error("Error checking network");
    }
  };

  // Switch to Hardhat Network
  const switchNetwork = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed!");
      return;
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: STAKING_NETWORK_ID }],
      });
      setNetworkError("");
    } catch (switchError) {
      if (switchError.code === 4902) {
        addNetwork();
      } else {
        console.error("Error switching network:", switchError);
      }
    }
  };

  const addNetwork = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed!");
      return;
    }

    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: STAKING_NETWORK_ID,
            chainName: "CrossFi Testnet",
            rpcUrls: ["https://rpc.testnet.ms"],
            nativeCurrency: {
              name: "CrossFi",
              symbol: "XFI",
              decimals: 18
            },
            blockExplorerUrls: ["https://testnet.crossfi.io"],
          },
        ],
      });  
    } catch (addError) {
      console.error("Error adding network:", addError);
    }
  };

  // Check Admin Status
  const checkAdminStatus = async (address, signer) => {
    try {
      const contract = new ethers.Contract(AIRDROP_ADDRESS, AIRDROP_ABI, signer);
      const adminAddress = await contract.admin(); // Fetch admin address from the contract
      setIsAdmin(address.toLowerCase() === adminAddress.toLowerCase());
    } catch (error) {
      console.error("Error checking admin status:", error);
      toast.error("Error checking admin status");
    }
  };

  // Shorten Wallet Address
  const shortenAddress = (address) =>
    `${address.slice(0, 5)}...${address.slice(address.length - 4)}`;

  // Automatically reconnect wallet if user has previously connected
  useEffect(() => {
    const savedAddress = localStorage.getItem("walletAddress");
    const timestamp = localStorage.getItem("timestamp");

    if (savedAddress && timestamp && Date.now() - parseInt(timestamp) < 3600000) {
      connectWallet();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center flex-col text-white p-5">
      <button
        onClick={connectWallet}
        className="wallet-btn bg-custom-mid-dark-purple bg-blue-600 absolute right-0 m-5 p-3 text-center rounded-md"
      >
        {!walletAddress ? "Connect Wallet" : shortenAddress(walletAddress)}
      </button>

      {networkError && (
        <div className="w-auto m-5 p-5 absolute bg-red-500 text-white">
          {networkError}
          <button
            onClick={switchNetwork}
            className="ml-4 p-5 outline-none rounded-md bg-blue-500"
          >
            Switch Network
          </button>
        </div>
      )}

      <h1 className="text-3xl font-bold text-center mb-6">Airdrop DApp</h1>
      <div className="m-auto">
        {isAdmin ? <AdminPanel /> : <UserDashboard />}
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;