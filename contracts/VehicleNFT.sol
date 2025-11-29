// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VehicleNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    enum DeliveryStage {
        NotStarted,
        InTransit,
        Delivered
    }

    struct Vehicle {
        address currentOwner;
        uint256 price;
        bool listed;
        DeliveryStage deliveryStage;
    }

    struct ServiceEvent {
        uint256 timestamp;
        string description;
        address addedBy;
    }

    // Mapping from token ID to Vehicle details
    mapping(uint256 => Vehicle) public vehicles;
    // Mapping from token ID to list of service events
    mapping(uint256 => ServiceEvent[]) public serviceHistory;

    event VehicleMinted(uint256 indexed tokenId, address owner, uint256 price, string tokenURI);
    event VehicleListed(uint256 indexed tokenId, uint256 price);
    event VehicleUnlisted(uint256 indexed tokenId);
    event VehiclePurchased(uint256 indexed tokenId, address from, address to, uint256 price);
    event DeliveryStageAdvanced(uint256 indexed tokenId, DeliveryStage newStage);
    event ServiceEventAdded(uint256 indexed tokenId, uint256 timestamp, string description, address addedBy);

    constructor() ERC721("VehicleNFT", "VNFT") Ownable(msg.sender) {}

    /**
     * @dev Mints a new vehicle NFT.
     * @param to The address that will own the minted NFT.
     * @param price The listing price in wei.
     * @param uri The token URI.
     */
    function mintVehicle(address to, uint256 price, string memory uri) external onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _mint(to, tokenId);
        _setTokenURI(tokenId, uri);

        vehicles[tokenId] = Vehicle({
            currentOwner: to,
            price: price,
            listed: true,
            deliveryStage: DeliveryStage.NotStarted
        });

        emit VehicleMinted(tokenId, to, price, uri);
        emit VehicleListed(tokenId, price);
    }

    /**
     * @dev Lists a vehicle for sale.
     * @param tokenId The ID of the token to list.
     * @param price The price in wei.
     */
    function listVehicle(uint256 tokenId, uint256 price) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        vehicles[tokenId].listed = true;
        vehicles[tokenId].price = price;
        emit VehicleListed(tokenId, price);
    }

    /**
     * @dev Unlists a vehicle.
     * @param tokenId The ID of the token to unlist.
     */
    function unlistVehicle(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        vehicles[tokenId].listed = false;
        emit VehicleUnlisted(tokenId);
    }

    /**
     * @dev Purchases a listed vehicle.
     * @param tokenId The ID of the token to purchase.
     */
    function purchaseVehicle(uint256 tokenId) external payable {
        Vehicle storage vehicle = vehicles[tokenId];
        require(vehicle.listed, "Vehicle not listed");
        require(msg.value == vehicle.price, "Incorrect price");

        address seller = vehicle.currentOwner;
        address buyer = msg.sender;

        // Transfer funds to seller
        (bool sent, ) = payable(seller).call{value: msg.value}("");
        require(sent, "Failed to send Ether");

        // Transfer NFT
        _transfer(seller, buyer, tokenId);

        // Update vehicle state
        vehicle.currentOwner = buyer;
        vehicle.listed = false;
        vehicle.deliveryStage = DeliveryStage.InTransit;

        emit VehiclePurchased(tokenId, seller, buyer, msg.value);
    }

    /**
     * @dev Advances the delivery stage of a vehicle.
     * @param tokenId The ID of the token.
     */
    function advanceDelivery(uint256 tokenId) external {
        Vehicle storage vehicle = vehicles[tokenId];
        require(msg.sender == vehicle.currentOwner || msg.sender == owner(), "Not authorized");

        if (vehicle.deliveryStage == DeliveryStage.NotStarted) {
            vehicle.deliveryStage = DeliveryStage.InTransit;
        } else if (vehicle.deliveryStage == DeliveryStage.InTransit) {
            vehicle.deliveryStage = DeliveryStage.Delivered;
        }
        // If Delivered, do nothing

        emit DeliveryStageAdvanced(tokenId, vehicle.deliveryStage);
    }

    /**
     * @dev Adds a service event to the vehicle history.
     * @param tokenId The ID of the token.
     * @param description The description of the service.
     */
    function addServiceEvent(uint256 tokenId, string calldata description) external {
        // In production, this should be restricted to authorized service centers.
        serviceHistory[tokenId].push(ServiceEvent({
            timestamp: block.timestamp,
            description: description,
            addedBy: msg.sender
        }));

        emit ServiceEventAdded(tokenId, block.timestamp, description, msg.sender);
    }

    /**
     * @dev Returns the service history for a vehicle.
     * @param tokenId The ID of the token.
     */
    function getServiceEvents(uint256 tokenId) external view returns (ServiceEvent[] memory) {
        return serviceHistory[tokenId];
    }

    // The following functions are overrides required by Solidity.

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
