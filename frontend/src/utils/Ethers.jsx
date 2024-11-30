import { ethers } from "ethers";
import { AIRDROP_ABI,AIRDROP_ADDRESS,AIRDROP_TOKEN_ABI,AIRDROP_TOKEN_ADDRESS } from "./config.js";

function Ethers() {
    if (!window.ethereum) {
        alert("MetaMask is not installed!");
        return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(AIRDROP_ADDRESS, AIRDROP_ABI, signer);

    const ADToken = new ethers.Contract(AIRDROP_TOKEN_ADDRESS, AIRDROP_TOKEN_ABI, signer);

    return { provider, signer, contract, ADToken };

}

export default Ethers