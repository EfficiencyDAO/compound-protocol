module.exports = async ({
    deployments,
    getNamedAccounts
}) => {
    console.log("20. Deploy eUSDT")
    const { deploy, save } = deployments;
    const { deployer, usdt } = await getNamedAccounts()

    const Unitroller = await deployments.get('Unitroller');
    const Model = await deployments.get('UsdtInterestRateModel');
    const Implementation = await deployments.get('Implementation');

    await deploy('CErc20Delegator', {
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

    const CERC20 = await deployments.get('CErc20Delegator');
    await save("eUSDT", CERC20);
};

module.exports.dependencies = ['Implementation', 'UsdtInterestRateModel', 'Unitroller'];
module.exports.tags = ['eUSDT'];