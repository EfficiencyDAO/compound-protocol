module.exports = async ({
    deployments,
    getNamedAccounts
}) => {
    console.log("11. Deploy eUSDT")
    const { deploy, save, execute } = deployments;
    const { deployer, usdt, usdtFeed } = await getNamedAccounts()

    const Unitroller = await deployments.get('Unitroller');
    const Implementation = await deployments.get('Implementation');
    
    // Deploy eUSDT's Jump Interest Rate Model
    const Model = await deploy('JumpRateModelV2', {
        from: deployer,
        args: [
            (0).toString(), // 0% base rate per year
            (0.045 * 1e18).toString(), // 4.5% Multiplier per year
            (3.50 * 1e18).toString(), // 350% Jump Multiplier per year
            (0.80 * 1e18).toString(), // 80%  Kink
            deployer
        ]
    });

    // Deploy eUSDT token
    const eUSDT = await deploy('CErc20Delegator', {
        from: deployer,
        args: [
            usdt,
            Unitroller.address,
            Model.address,
            "200000000000000000000000000",
            "Efficiency USDT",
            "eUSDT",
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
        eUSDT.address,
        usdtFeed,
        18
    )

    // Add market to Comptroller
    await execute('Comptroller', {
        from: deployer
    },
        "_supportMarket",
        eUSDT.address
    )

    // Save eUSDT Deployment
    await save("eUSDT", eUSDT);
};

module.exports.dependencies = ['Implementation', 'Unitroller'];
module.exports.tags = ['eUSDT'];