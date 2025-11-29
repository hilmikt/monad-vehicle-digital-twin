import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Seeding contracts with the account:", deployer.address);

    const contractAddress = "0xFB143834dE4d0C8b44b9EF48630052CEd91Fde66";
    const VehicleNFT = await ethers.getContractFactory("VehicleNFT");
    const vehicleNFT = VehicleNFT.attach(contractAddress);

    // Mint 5 vehicles
    const prices = ["0.01", "0.02", "0.03", "0.04", "0.05"];

    for (let i = 0; i < 5; i++) {
        console.log(`Minting vehicle ${i + 1}...`);
        const tx = await vehicleNFT.mintVehicle(
            deployer.address,
            ethers.parseEther(prices[i]),
            `https://example.com/metadata/${i + 1}`
        );
        await tx.wait();
        console.log(`Vehicle ${i + 1} minted!`);
    }

    console.log("Seeding complete!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
