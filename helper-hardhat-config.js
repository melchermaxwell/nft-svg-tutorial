const networkConfig = {
    31337: {
        name: 'localhost',
        fee: '100000000000000000',
        keyHash: '0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4',
        jobId: '29fa9aa13bf1468788b7cc4a500a45b8',
        fundAmount: "1000000000000000000"
    },
    137: {
        name: 'polygon',
        linkToken: '0xb0897686c545045aFc77CF20eC7A532E3120E0F1',
        keyHash: '0xf86195cf7690c55907b2b611ebb7343a6f649bff128701cc542f0569e2c549da',
        vrfCoordinator: '0x3d2341ADb2D31f1c5530cDC622016af293177AE0',
        fee: '100000000000000',
        fundAmount: '200000000000000'
    },
    4: {
        name: 'rinkeby',
        linkToken: '0x01be23585060835e02b77ef475b0cc51aa1e0709',
        ethUsdPriceFeed: '0x8A753747A1Fa494EC906cE90E9f37563A8AF630e',
        keyHash: '0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311',
        vrfCoordinator: '0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B',
        oracle: '0x7AFe1118Ea78C1eae84ca8feE5C65Bc76CcF879e',
        jobId: '6d1bfe27e7034b1d87b5270556b17277',
        fee: '100000000000000000',
        fundAmount: "1000000000000000000"
    },
}

module.exports = {
    networkConfig
}