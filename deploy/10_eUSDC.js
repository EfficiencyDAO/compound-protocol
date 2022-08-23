module.exports = async ({
    deployments,
    getNamedAccounts
}) => {
    console.log("10. Deploy eUSDC")
    const { deploy, save, execute } = deployments;
    const { deployer, usdc, usdcFeed } = await getNamedAccounts()

    // Fetch Comptroller and Delegate Implementation
    const Unitroller = await deployments.get('Unitroller');
    const Implementation = await deployments.get('Implementation');

    // Deploy eUSDC's Whitepaper Interest Rate Model
    const Model = await deploy('WhitePaperInterestRateModel', {
        from: deployer,
        args: [
            "20000000000000000",
            "100000000000000000"
        ]
    });

    // Deploy eUSDC token
    const eUSDC = await deploy('CErc20Delegator', {
        from: deployer,
        args: [
            usdc,
            Unitroller.address,
            Model.address,
            "200000000000000000000000000",
            "Efficiency USDC",
            "eUSDC",
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
        eUSDC.address,
        usdcFeed,
        18
    )

    // Add market to Comptroller
    await execute('Comptroller', {
        from: deployer
    },
        "_supportMarket",
        eUSDC.address
    )

    // Save eUSDC Deployment
    await save("eUSDC", eUSDC);
};

module.exports.dependencies = ['Implementation', 'Unitroller'];
module.exports.tags = ['eUSDC'];