import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Seeding dealer vehicles with account:", deployer.address);

    const contractAddress = "0xFB143834dE4d0C8b44b9EF48630052CEd91Fde66";
    const VehicleNFT = await ethers.getContractFactory("VehicleNFT");
    const vehicleNFT = VehicleNFT.attach(contractAddress);

    // Create a random dealer wallet
    const dealer = ethers.Wallet.createRandom();
    console.log("Dealer address:", dealer.address);

    // Mint 2 vehicles to the dealer
    // These will be IDs 6 and 7 (assuming 1-5 exist)
    const prices = ["0.01", "0.02"];

    for (let i = 0; i < 2; i++) {
        console.log(`Minting vehicle for dealer...`);
        const tx = await vehicleNFT.mintVehicle(
            dealer.address,
            ethers.parseEther(prices[i]),
            `https://example.com/metadata/dealer/${i + 1}`
        );
        const receipt = await tx.wait();

        // Find the Token ID from events
        const event = receipt.logs.find((log: any) => {
            try {
                return vehicleNFT.interface.parseLog(log)?.name === "VehicleMinted";
            } catch (e) {
                return false;
            }
        });

        if (event) {
            const parsedLog = vehicleNFT.interface.parseLog(event);
            console.log(`Vehicle minted! Token ID: ${parsedLog?.args[0]}`);
        }
    }

    console.log("Dealer seeding complete!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
