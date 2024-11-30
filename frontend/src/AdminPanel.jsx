import React, { useState } from "react";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import { ethers } from "ethers";
import { AIRDROP_ABI, AIRDROP_ADDRESS } from "./utils/config.js";
import { toast } from "react-toastify";

const AdminPanel = () => {
  const [csvData, setCsvData] = useState([]);
  const [batchTokenAmount, setBatchTokenAmount] = useState("");
  const [batchId, setBatchId] = useState("");
  const [isCreatingBatch, setIsCreatingBatch] = useState(false);
  const [isDistributing, setIsDistributing] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data.map((row) => row.address.trim());
        setCsvData(data);
        toast.success("CSV file parsed successfully!");
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
        toast.error("Failed to parse CSV file.");
      },
    });
  };

  const handleCreateBatch = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask is not installed!");
      return;
    }

    if (!batchTokenAmount) {
      toast.error("Please specify the token amount per recipient!");
      return;
    }

    try {
      setIsCreatingBatch(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(AIRDROP_ADDRESS, AIRDROP_ABI, signer);

      // Call the `createBatch` function in the contract
      const tx = await contract.createBatch(ethers.utils.parseUnits(batchTokenAmount, 18));
      await tx.wait();

      toast.success("Batch created successfully!");
    } catch (error) {
      console.error("Error creating batch:", error);
      toast.error("Failed to create batch.");
    } finally {
      setIsCreatingBatch(false);
    }
  };

  const handleDistributeTokens = async () => {

    handleCreateBatch();
    if (!window.ethereum) {
      toast.error("MetaMask is not installed!");
      return;
    }

    if (!csvData.length || !batchTokenAmount) {
      toast.error("Please upload a CSV file and specify the amount!");
      return;
    }

    try {
      setIsDistributing(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(AIRDROP_ADDRESS, AIRDROP_ABI, signer);

      // Call the `distributeTokensBatch` function in the contract
      const tx = await contract.distributeTokensBatch(
        csvData,
        ethers.utils.parseUnits(batchTokenAmount, 18)
      );

      await tx.wait();
      toast.success("Tokens distributed successfully!");
    } catch (error) {
      console.error("Error distributing tokens:", error);
      toast.error("Failed to distribute tokens.");
    } finally {
      setIsDistributing(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!csvData.length) {
      toast.error("No recipients to download!");
      return;
    }

    const csvContent = csvData.map((address) => ({ address }));
    const csvBlob = new Blob([Papa.unparse(csvContent)], {
      type: "text/csv;charset=utf-8;",
    });
    saveAs(csvBlob, "recipients.csv");
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-white">Admin Panel</h2>

      {/* Batch Creation Section */}
      <div className="mb-4">
        <label className="block font-medium mb-2 text-white">
          Token Amount (per recipient):
        </label>
        <input
          type="number"
          value={batchTokenAmount}
          onChange={(e) => setBatchTokenAmount(e.target.value)}
          className="p-2 border border-gray-600 rounded-md w-full text-black"
          placeholder="Enter token amount"
        />
        {/* <button
          onClick={handleCreateBatch}
          disabled={isCreatingBatch}
          className={`bg-blue-500 text-white p-3 rounded-md mt-4 ${
            isCreatingBatch ? "opacity-50" : ""
          }`}
        >
          {isCreatingBatch ? "Creating Batch..." : "Create Batch"}
        </button> */}
      </div>

      {/* CSV Upload Section */}
      <div className="mb-4">
        <label className="block font-medium mb-2 text-white">Upload CSV:</label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="p-2 border border-gray-600 rounded-md"
        />
      </div>

      {/* Distribute Tokens Section */}
      <button
        onClick={handleDistributeTokens}
        disabled={isDistributing}
        className={`bg-green-500 w-full text-white p-3 rounded-md ${
          isDistributing ? "opacity-50" : ""
        }`}
      >
        {isDistributing ? "Distributing..." : "Distribute Tokens"}
      </button>

      {/* Download CSV Section */}
      <button
        onClick={handleDownloadCSV}
        className="bg-yellow-500 w-full text-black p-3 rounded-md mt-4"
      >
        Download CSV Template
      </button>
    </div>
  );
};

export default AdminPanel;
