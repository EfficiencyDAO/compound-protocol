module.exports = async ({
    deployments,
    getNamedAccounts
}) => {
    console.log("16. Deploy eUSDC")
    const { deploy, save } = deployments;
    const { deployer, usdc } = await getNamedAccounts()

    const Unitroller = await deployments.get('Unitroller');
    const Model = await deployments.get('UsdcInterestRateModel');
    const Implementation = await deployments.get('Implementation');

    await deploy('CErc20Delegator', {
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

    const CERC20 = await deployments.get('CErc20Delegator');
    await save("eUSDC", CERC20);
};

module.exports.dependencies = ['Implementation', 'UsdcInterestRateModel', 'Unitroller'];
module.exports.tags = ['eUSDC'];