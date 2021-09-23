// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
//import "base64-sol/base64.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

contract RandomSVG is ERC721URIStorage, VRFConsumerBase {
    bytes32 public keyHash;
    uint256 public fee;
    uint256 public tokenCounter;

    //SVG Params
    uint256 public maxNumberofPaths;
    uint256 public maxNumberofPathCommands;
    uint256 public size;
    string[] public pathCommands;
    string[] public colors;

    mapping(bytes32 => address) public requestIdToSender;
    mapping(bytes32 => uint256) public requestIdToTokenId;
    mapping(uint256 => uint256) public tokenIdToRandomNumber;

    event requestedRandomSVG(bytes32 indexed requestId, uint256 indexed tokenId);
    event CreatedUnfinishedRandomSVG(uint256 indexed tokenId, uint256 randomNumber);
    event CreatedRandomSVG(uint256 indexed tokenId, string _tokenId, string tokenURI);
    //indexing an event means it is going to be a topic

    constructor(address _VRFCoordinator, address _LinkToken, bytes32 _keyHash, uint256 _fee) ERC721("RandomSVG", "rsNFT") 
    VRFConsumerBase(_VRFCoordinator, _LinkToken)
    {
        fee = _fee;
        keyHash = _keyHash;
        tokenCounter = 0;
        maxNumberofPaths = 10;
        maxNumberofPathCommands = 5;
        size = 500;
        pathCommands =["M","L"];
        colors=["red","blue","green","yellow","black","white"];
    }

    function create() public returns (bytes32 requestId){
        requestId = requestRandomness(keyHash, fee);
        requestIdToSender[requestId]= msg.sender;
        uint256 tokenId = tokenCounter;
        requestIdToTokenId[requestId] = tokenId;
        tokenCounter = tokenCounter +1;
        emit requestedRandomSVG(requestId, tokenId);
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomNumber) internal override {
        //internal override (ONLY the VRFCoordinator) overriding the implemnentation of fulfill randomness
        address nftOwner = requestIdToSender[requestId];
        uint256 tokenId = requestIdToTokenId[requestId];
        _safeMint(nftOwner, tokenId);
        tokenIdToRandomNumber[tokenId] = randomNumber;
        emit CreatedUnfinishedRandomSVG(tokenId, randomNumber);
    }

    function finishMint (uint256 _tokenId) public {
        //check to see if it's been minted and a random number is returned
        require(bytes(tokenURI(_tokenId)).length <= 0,"tokenURI is already all set");
        require(tokenCounter > _tokenId, "TokenId has not been minted yet");
        require(tokenIdToRandomNumber[_tokenId] > 0, "Need to wait for VRF");
        uint256 randomNumber = tokenIdToRandomNumber[_tokenId];
        string memory svg = generateSVG(randomNumber);
        string memory imageURI = svgToImageURI(svg);
        string memory tokenURI = formatTokenURI(imageURI);
        _setTokenURI(_tokenId, tokenURI);
        emit CreatedRandomSVG(_tokenId, svg);
    }

    function generateSVG(uint256 _randomNumber) public view returns(string memory finalSvg){
        uint256 maxNumberofPaths = (_randomNumber % maxNumberofPaths) + 1;
        finalSvg = string(abi.encodePacked("<svg xmlns='http://www.w3.org/2000/svg' height='",uint2str(size),"'width='", uint2str(size), "'>"));
    }

    function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
}
