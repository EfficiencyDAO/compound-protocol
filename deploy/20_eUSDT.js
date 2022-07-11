module.exports = async ({
    deployments,
    getNamedAccounts
}) => {
    console.log("20. Deploy eUSDT")
    const { deploy, save } = deployments;
    const { deployer, usdt } = await getNamedAccounts()

    const Unitroller = await deployments.get('Unitroller');
    const Model = await deployments.get('UsdtInterestRateModel');

    await deploy('CErc20Immutable', {
        from: deployer,
        args: [
            usdt,
            Unitroller.address,
            Model.address,
            "200000000000000000000000000",
            "Efficiency USDT",
            "eUSDT",
            "8",
            deployer
        ]
    });

    const CERC20 = await deployments.get('CErc20Immutable');
    await save("eUSDT", CERC20);
};

module.exports.dependencies = ['UsdtInterestRateModel', 'Unitroller'];
module.exports.tags = ['eUSDT'];