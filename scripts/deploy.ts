import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const vehicleNFT = await ethers.deployContract("VehicleNFT");

    await vehicleNFT.waitForDeployment();

    console.log("VehicleNFT deployed to:", await vehicleNFT.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
