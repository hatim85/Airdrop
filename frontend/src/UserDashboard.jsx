import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { AIRDROP_ABI, AIRDROP_ADDRESS } from "./utils/config";

const UserDashboard = () => {
  const [balance, setBalance] = useState("0");
  const [loading, setLoading] = useState(false);

  const fetchBalance = async () => {
    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(AIRDROP_ADDRESS, AIRDROP_ABI, signer);

      const userAddress = await signer.getAddress();
      const userBalance = await contract.getUserBalance(userAddress);
      setBalance(ethers.utils.formatUnits(userBalance, 18));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{
    fetchBalance();
  },[balance])

  const handleWithdraw = async () => {
    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(AIRDROP_ADDRESS, AIRDROP_ABI, signer);

      const tx = await contract.withdrawTokens();
      await tx.wait();
      toast.success("Tokens withdrawn successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Error withdrawing tokens!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 w-[50vw] bg-gray-800 text-white rounded">
      <h1 className="text-xl font-bold">User Dashboard</h1>
      {/* <button
        className="w-full p-2 bg-blue-500 rounded"
        onClick={fetchBalance}
        disabled={loading}
      >
        {loading ? "Fetching Balance..." : "Fetch Balance"}
      </button> */}
      <p className="mt-2">Your Balance: {balance} Tokens</p>
      <button
        className="w-full p-2 mt-2 bg-green-500 rounded"
        onClick={handleWithdraw}
        disabled={loading}
      >
        {loading ? "Withdrawing..." : "Withdraw Tokens"}
      </button>
    </div>
  );
};

export default UserDashboard;
