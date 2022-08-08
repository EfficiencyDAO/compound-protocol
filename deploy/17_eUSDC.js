module.exports = async ({
    deployments,
    getNamedAccounts
}) => {
    console.log("17. Deploy eUSDC")
    const { deploy, save } = deployments;
    const { deployer, usdc } = await getNamedAccounts()

    const Unitroller = await deployments.get('Unitroller');
    const Model = await deployments.get('UsdcInterestRateModel');
    const Implementation = await deployments.get('Implementation');

    const eUSDC = await deploy('CErc20Delegator', {
        from: deployer,
        gasLimit: 25000000,
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

    await save("eUSDC", eUSDC);
};

module.exports.dependencies = ['Implementation', 'UsdcInterestRateModel', 'Unitroller'];
module.exports.tags = ['eUSDC'];