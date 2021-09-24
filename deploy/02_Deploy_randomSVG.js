const { networkConfig } = require("../helper-hardhat-config");
const fs = require("fs");

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();
  log(`ChainId: ${chainId}`)

  let linkTokenAddress;
  let vrfCoordinatorAddress;

  log("-----------------");
  if (chainId == 31337) {
    log(`Local Network`);
    let linkToken = await get("LinkToken");
    linkTokenAddress = linkToken.address;
    let VRFCoordinatorMock = await get("VRFCoordinatorMock");
    vrfCoordinatorAddress = VRFCoordinatorMock.address;
    //additionalMessage = " --linkaddress " + linkTokenAddress
    log(`Link Token Address: ${linkTokenAddress}`)
    log(`VRF Coordinator Address: ${vrfCoordinatorAddress}`)
  } else {
    linkTokenAddress = networkConfig[chainId]["linkToken"];
    vrfCoordinatorAddress = networkConfig[chainId]["vrfCoordinator"];
  }
  const keyHash = networkConfig[chainId]["keyHash"];
  log(`keyHash: ${keyHash}`)
  const fee = networkConfig[chainId]["fee"];
  log(`fee: ${fee}`)
  let args = [vrfCoordinatorAddress, linkTokenAddress, keyHash, fee];
  log("----------------------------------------------------");

  const RandomSVG = await deploy("RandomSVG", {
    from: deployer,
    args: args,
    log: true,
  });
  log(`You have deployed an NFT contract to ${RandomSVG.address}`);
  const networkName = networkConfig[chainId]["name"];
  log(
    `Verify with:\n npx hardhat verify --network ${networkName} ${
      RandomSVG.address
    } ${args.toString().replace(/,/g, " ")}`
  );
  const RandomSVGContract = await ethers.getContractFactory("RandomSVG");
  const accounts = await ethers.getSigners();
  const signer = accounts[2];
  const randomSVG = new ethers.Contract(RandomSVG.address, RandomSVGContract.interface, signer)

  //fund with LINK
  log(`Fund with LINK`)
  const fundAmount = networkConfig[chainId]["fundAmount"];
  const linkTokenContract = await ethers.getContractFactory("LinkToken");
  const linkToken = new ethers.Contract(linkTokenAddress, linkTokenContract.interface, signer)
  let fund_tx = await linkToken.transfer(RandomSVG.address, fundAmount);
  await fund_tx.wait(1);


  //create NFT


  tx = await randomSVG.create({ gasLimit: 300000 });
  let receipt = await tx.wait(1);
  let tokenId = receipt.events[3].topics[2];
  log(`You've made your NFT! This is token number ${tokenId.toString()}`);

  
//   const fundAmount = networkConfig[chainId]["fundAmount"];
//   log(`Fund amount :${fundAmount}`)
//   const linkToken = new ethers.Contract(
//     linkTokenAddress,
//     linkTokenContract.interface,
//     signer
//   );
//   log(linkToken.address)
//   let fund_tx = await linkToken.transfer(RandomSVG.address, fundAmount);
//   await fund_tx.wait(1);

//   log("made it here");

//   //create NFT! by calling a random number
//   let creation_tx = await randomSVG.create({ gasLimit: 300000 });
//   let receipt = await creation_tx.wait(1);
//   let tokenId = receipt.events[3].topics[2];
//   log(`You've made your NFT! This is token number ${tokenId.toString()}`);

  if (chainId != 31337) {
    await new Promise((r) => setTimeout(r, 180000));
    log(`Now let's finsih the mint...`);
    tx = await randomSVG.finishMint(tokenId, { gasLimit: 4000000 });
    await tx.wait(1);
    log(`You can view the tokenURI here ${await randomSVG.tokenURI(tokenId)}`);
  } else {
    const VRFCoordinatorMock = await deployments.get("VRFCoordinatorMock");
    vrfCoordinator = await ethers.getContractAt(
      "VRFCoordinatorMock",
      VRFCoordinatorMock.address,
      signer
    );
    let transactionResponse = await vrfCoordinator.callBackWithRandomness(
      receipt.logs[3].topics[1],
      77777,
      randomSVG.address
    );
    await transactionResponse.wait(1);
    log(`Now let's finsih the mint...`);
    tx = await randomSVG.finishMint(tokenId, { gasLimit: 2000000 });
    await tx.wait(1);
    log(`You can view the tokenURI here ${await randomSVG.tokenURI(tokenId)}`);
  }
};
module.exports.tags = ["all", "rsvg"];
