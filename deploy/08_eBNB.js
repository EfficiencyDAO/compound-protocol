module.exports = async ({
    deployments,
    getNamedAccounts
}) => {
    console.log("08. Deploy eBNB")
    const { deploy, save, execute } = deployments;
    const { deployer, bnbFeed } = await getNamedAccounts()

    // Fetch Comptroller
    const Unitroller = await deployments.get('Unitroller');

    // Deploy eBNB's Whitepaper Interest Rate Model
    const Model = await deploy('WhitePaperInterestRateModel', {
        from: deployer,
        args: [
            "20000000000000000",
            "100000000000000000"
        ]
    });

    // Deploy eBNB token
    const eBNB = await deploy('CBnb', {
        from: deployer,
        args: [
            Unitroller.address,
            Model.address,
            "200000000000000000000000000",
            "Efficiency BNB",
            "eBNB",
            "8",
            deployer
        ]
    });

    // Connect Chainlink Price Feed
    await execute('FeedPriceOracle', {
        from: deployer,
    },
        "setFeed",
        eBNB.address,
        bnbFeed,
        18
    )

    // Add market to Comptroller
    await execute('Comptroller', {
        from: deployer
    },
        "_supportMarket",
        eBNB.address
    )

    // Save eBNB Deployment
    await save("eBNB", eBNB);
};

module.exports.dependencies = ['Unitroller'];
module.exports.tags = ['eBNB'];