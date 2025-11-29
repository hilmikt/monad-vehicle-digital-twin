import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Seeding Rivian fleet with account:", deployer.address);

    const contractAddress = "0xFB143834dE4d0C8b44b9EF48630052CEd91Fde66";
    const VehicleNFT = await ethers.getContractFactory("VehicleNFT");
    const vehicleNFT = VehicleNFT.attach(contractAddress);

    // Create a random dealer wallet (or use the same one if we knew it, but new one is safer to avoid nonce issues)
    // Actually, let's use a fresh wallet for the fleet to keep it clean.
    const fleetDealer = ethers.Wallet.createRandom();
    console.log("Fleet Dealer address:", fleetDealer.address);

    // Mint 20 Rivian R1Ts
    // Price: 0.04 ETH
    const price = "0.04";
    const batchSize = 20;

    console.log(`Minting ${batchSize} Rivians...`);

    for (let i = 0; i < batchSize; i++) {
        const tx = await vehicleNFT.mintVehicle(
            fleetDealer.address,
            ethers.parseEther(price),
            `https://example.com/metadata/rivian-fleet/${i + 1}`
        );
        await tx.wait();
        console.log(`Rivian ${i + 1}/${batchSize} minted.`);
    }

    console.log("Rivian fleet seeding complete!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
