module.exports = async ({
    deployments,
    getNamedAccounts
}) => {
    console.log("09. Deploy eBUSD")
    const { deploy, save, execute } = deployments;
    const { deployer, busd, busdFeed } = await getNamedAccounts()

    // Fetch Comptroller and Delegate Implementation
    const Unitroller = await deployments.get('Unitroller');
    const Implementation = await deployments.get('Implementation');

    // Deploy eBUSD's Whitepaper Interest Rate Model
    const Model = await deploy('WhitePaperInterestRateModel', {
        from: deployer,
        args: [
            "20000000000000000",
            "100000000000000000"
        ]
    });

    // Deploy eBUSD token
    const eBUSD = await deploy('CErc20Delegator', {
        from: deployer,
        args: [
            busd,
            Unitroller.address,
            Model.address,
            "200000000000000000000000000",
            "Efficiency BUSD",
            "eBUSD",
            "8",
            deployer,
            Implementation.address,
            0x00
        ]
    });

    // Connect Chainlink Price Feed
    await execute('FeedPriceOracle', {
        from: deployer,
    },
        "setFeed",
        eBUSD.address,
        busdFeed
    )

    // Add market to Comptroller
    await execute('Comptroller', {
        from: deployer
    },
        "_supportMarket",
        eBUSD.address
    )

    // Save eBUSD Deployment
    await save("eBUSD", eBUSD);
};

module.exports.dependencies = ['Implementation', 'Unitroller'];
module.exports.tags = ['eBUSD'];