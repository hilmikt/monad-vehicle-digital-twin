// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title VehicleNFT - Car digital twin NFT with marketplace, delivery tracking, and service history
/// @notice Each vehicle is represented as an NFT with price, listing state,
///         delivery stage, and on-chain service history.
contract VehicleNFT is ERC721, Ownable {
    // --------- Types ---------

    /// @notice Delivery lifecycle of the vehicle
    enum DeliveryStage {
        NotStarted,
        InTransit,
        Delivered
    }

    /// @notice Core vehicle state
    struct Vehicle {
        address currentOwner;
        uint256 price;      // in wei
        bool listed;
        DeliveryStage deliveryStage;
    }

    /// @notice On-chain service event associated with a vehicle
    struct ServiceEvent {
        uint256 timestamp;
        string description;
        address addedBy;
    }

    // --------- Storage ---------

    /// @notice Incremental token ID counter
    uint256 private _nextTokenId;

    /// @notice Vehicle data by token ID
    mapping(uint256 => Vehicle) public vehicles;

    /// @notice Service history by token ID
    mapping(uint256 => ServiceEvent[]) private _serviceHistory;

    /// @notice Token URIs by token ID
    mapping(uint256 => string) private _tokenURIs;

    // --------- Events ---------

    event VehicleMinted(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 price,
        string tokenURI
    );

    event VehicleListed(uint256 indexed tokenId, uint256 price);
    event VehicleUnlisted(uint256 indexed tokenId);

    event VehiclePurchased(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 price
    );

    event DeliveryStageAdvanced(
        uint256 indexed tokenId,
        DeliveryStage newStage
    );

    event ServiceEventAdded(
        uint256 indexed tokenId,
        uint256 timestamp,
        string description,
        address indexed addedBy
    );

    // --------- Constructor ---------

    constructor() ERC721("Vehicle Digital Twin", "VDT") Ownable(msg.sender) {}

    // --------- Modifiers ---------

    modifier onlyExistingToken(uint256 tokenId) {
        require(
            _ownerOf(tokenId) != address(0),
            "VehicleNFT: token does not exist"
        );
        _;
    }

    modifier onlyVehicleOwner(uint256 tokenId) {
        require(
            vehicles[tokenId].currentOwner == msg.sender,
            "VehicleNFT: caller is not vehicle owner"
        );
        _;
    }

    // --------- Internal helpers ---------

    function _setTokenURI(
        uint256 tokenId,
        string memory tokenURI_
    ) internal onlyExistingToken(tokenId) {
        _tokenURIs[tokenId] = tokenURI_;
    }

    // --------- Core Functions ---------

    /// @notice Mint a new vehicle NFT and list it for sale
    /// @dev Only contract owner can mint for now (manufacturer / admin)
    /// @param to Initial owner address
    /// @param price Listing price in wei
    /// @param tokenURI_ Metadata URI (e.g., IPFS)
    function mintVehicle(
        address to,
        uint256 price,
        string memory tokenURI_
    ) external onlyOwner {
        require(to != address(0), "VehicleNFT: invalid recipient");
        require(price > 0, "VehicleNFT: price must be > 0");
        require(
            bytes(tokenURI_).length > 0,
            "VehicleNFT: token URI must not be empty"
        );

        uint256 tokenId = ++_nextTokenId;

        _safeMint(to, tokenId);
        _tokenURIs[tokenId] = tokenURI_;

        vehicles[tokenId] = Vehicle({
            currentOwner: to,
            price: price,
            listed: true,
            deliveryStage: DeliveryStage.NotStarted
        });

        emit VehicleMinted(tokenId, to, price, tokenURI_);
        emit VehicleListed(tokenId, price);
    }

    /// @notice List an existing vehicle for sale
    /// @param tokenId Vehicle token ID
    /// @param price Listing price in wei
    function listVehicle(
        uint256 tokenId,
        uint256 price
    ) external onlyExistingToken(tokenId) onlyVehicleOwner(tokenId) {
        require(price > 0, "VehicleNFT: price must be > 0");

        Vehicle storage v = vehicles[tokenId];
        v.listed = true;
        v.price = price;

        emit VehicleListed(tokenId, price);
    }

    /// @notice Unlist a vehicle from sale
    /// @param tokenId Vehicle token ID
    function unlistVehicle(
        uint256 tokenId
    ) external onlyExistingToken(tokenId) onlyVehicleOwner(tokenId) {
        Vehicle storage v = vehicles[tokenId];
        require(v.listed, "VehicleNFT: not listed");

        v.listed = false;

        emit VehicleUnlisted(tokenId);
    }

    /// @notice Purchase a listed vehicle
    /// @param tokenId Vehicle token ID
    function purchaseVehicle(
        uint256 tokenId
    ) external payable onlyExistingToken(tokenId) {
        Vehicle storage v = vehicles[tokenId];
        require(v.listed, "VehicleNFT: not listed for sale");
        require(msg.value == v.price, "VehicleNFT: incorrect price");

        address seller = v.currentOwner;
        require(seller != address(0), "VehicleNFT: invalid seller");
        require(seller != msg.sender, "VehicleNFT: cannot buy own vehicle");

        // Update state before external call
        v.currentOwner = msg.sender;
        v.listed = false;
        v.deliveryStage = DeliveryStage.InTransit;

        // Transfer NFT to buyer
        _safeTransfer(seller, msg.sender, tokenId, "");

        // Payout seller
        (bool success, ) = payable(seller).call{value: msg.value}("");
        require(success, "VehicleNFT: payment transfer failed");

        emit VehiclePurchased(tokenId, seller, msg.sender, v.price);
        emit DeliveryStageAdvanced(tokenId, v.deliveryStage);
    }

    /// @notice Advance the delivery stage for a vehicle
    /// @dev For demo: callable by current owner or contract owner
    /// @param tokenId Vehicle token ID
    function advanceDelivery(
        uint256 tokenId
    ) external onlyExistingToken(tokenId) {
        Vehicle storage v = vehicles[tokenId];

        require(
            msg.sender == v.currentOwner || msg.sender == owner(),
            "VehicleNFT: not authorized to advance delivery"
        );

        if (v.deliveryStage == DeliveryStage.NotStarted) {
            v.deliveryStage = DeliveryStage.InTransit;
        } else if (v.deliveryStage == DeliveryStage.InTransit) {
            v.deliveryStage = DeliveryStage.Delivered;
        } else {
            revert("VehicleNFT: already delivered");
        }

        emit DeliveryStageAdvanced(tokenId, v.deliveryStage);
    }

    /// @notice Add a service event to a vehicle
    /// @dev Any address can add service events in this demo;
    ///      in production, restrict to authorized service centers.
    /// @param tokenId Vehicle token ID
    /// @param description Description of the service performed
    function addServiceEvent(
        uint256 tokenId,
        string calldata description
    ) external onlyExistingToken(tokenId) {
        require(bytes(description).length > 0, "VehicleNFT: empty description");

        ServiceEvent memory ev = ServiceEvent({
            timestamp: block.timestamp,
            description: description,
            addedBy: msg.sender
        });

        _serviceHistory[tokenId].push(ev);

        emit ServiceEventAdded(
            tokenId,
            ev.timestamp,
            ev.description,
            ev.addedBy
        );
    }

    /// @notice Get all service events for a given vehicle
    /// @param tokenId Vehicle token ID
    /// @return Array of ServiceEvent structs
    function getServiceEvents(
        uint256 tokenId
    )
        external
        view
        onlyExistingToken(tokenId)
        returns (ServiceEvent[] memory)
    {
        return _serviceHistory[tokenId];
    }

    /// @notice Get vehicle struct for a given token
    function getVehicle(
        uint256 tokenId
    ) external view onlyExistingToken(tokenId) returns (Vehicle memory) {
        return vehicles[tokenId];
    }

    /// @notice View the token URI for a given token
    function tokenURI(
        uint256 tokenId
    ) public view override onlyExistingToken(tokenId) returns (string memory) {
        string memory uri = _tokenURIs[tokenId];
        require(
            bytes(uri).length > 0,
            "VehicleNFT: token URI not set"
        );
        return uri;
    }

    // --------- Optional: custom burn with cleanup ---------

    /// @notice Burn a vehicle NFT and clean up its data
    /// @dev Only the vehicle owner or contract owner can burn
    function burnVehicle(
        uint256 tokenId
    ) external onlyExistingToken(tokenId) {
        require(
            msg.sender == vehicles[tokenId].currentOwner || msg.sender == owner(),
            "VehicleNFT: not authorized to burn"
        );

        delete vehicles[tokenId];
        delete _serviceHistory[tokenId];
        delete _tokenURIs[tokenId];

        _burn(tokenId);
    }
}
