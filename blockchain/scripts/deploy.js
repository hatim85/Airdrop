const hre = require("hardhat");

async function main() {
  let airdropToken, airdrop;

  try {
    // Deploy AirdropToken (ERC20) contract
    console.log("Deploying AirdropToken...");
    const AirdropToken = await hre.ethers.getContractFactory("AirdropToken");
    airdropToken = await AirdropToken.deploy(100000);
    await airdropToken.waitForDeployment();
    console.log("AirdropToken deployed to:", airdropToken.target);
  } catch (error) {
    console.log("AirdropToken error: ", error.message);
  }

  if (airdropToken) {
    try {
      // Deploy Airdrop contract, passing the address of the deployed AirdropToken contract
      console.log("Deploying Airdrop contract...");
      const Airdrop = await hre.ethers.getContractFactory("Airdrop");
      airdrop = await Airdrop.deploy(airdropToken.target);
      await airdrop.waitForDeployment();
      console.log("Airdrop contract deployed to:", airdrop.target);
    } catch (error) {
      console.log("Airdrop error: ", error.message);
    }
  }

  // if (airdropToken && airdrop) {
  //   try {
  //     // Mint 100,000 tokens (1 lakh tokens)
  //     const mintAmount = hre.ethers.parseUnits("100000", 18); // 100,000 tokens with 18 decimals
  //     console.log(`Minting ${hre.ethers.formatUnits(mintAmount, 18)} tokens to the Airdrop contract...`);
  //     await airdropToken.mint(airdrop.target, mintAmount); // Mint tokens to the Airdrop contract
  //     console.log(`${hre.ethers.formatUnits(mintAmount, 18)} tokens minted to the Airdrop contract`);
  //   } catch (error) {
  //     console.log("Mint error: ", error.message);
  //   }

  //   try {
  //     // Optionally, you can check the balance of the Airdrop contract to confirm the transfer
  //     const airdropBalance = await airdropToken.balanceOf(airdrop.target);
  //     console.log(`Airdrop contract balance: ${hre.ethers.formatUnits(airdropBalance, 18)} tokens`);
  //   } catch (error) {
  //     console.log("Balance error: ", error.message);
  //   }
  // }
}

// Run the main function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
