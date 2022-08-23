module.exports = async ({
    deployments,
    getNamedAccounts
}) => {
    console.log("08. Deploy eBNB")
    const { deploy, save, execute } = deployments;
    const { deployer, bnbFeed } = await getNamedAccounts()

    // Fetch Comptroller
    const Unitroller = await deployments.get('Unitroller');

    // Deploy eBNB's Jump Interest Rate Model
    const Model = await deploy('JumpRateModelV2', {
        from: deployer,
        args: [
            (0).toString(), // 0% base rate per year
            (0.11 * 1e18).toString(), // 11% Multiplier per year
            (3.50 * 1e18).toString(), // 350% Jump Multiplier per year
            (0.80 * 1e18).toString(), // 80%  Kink
            deployer
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