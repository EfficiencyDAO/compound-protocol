module.exports = async ({
    deployments,
    getNamedAccounts
}) => {
    console.log("12. Deploy eBUSD")
    const { deploy, save } = deployments;
    const { deployer, busd } = await getNamedAccounts()

    const Unitroller = await deployments.get('Unitroller');
    const Model = await deployments.get('BusdInterestRateModel');

    await deploy('CErc20Immutable', {
        from: deployer,
        args: [
            busd,
            Unitroller.address,
            Model.address,
            "200000000000000000000000000",
            "Efficiency BUSD",
            "eBUSD",
            "8",
            deployer
        ]
    });

    const CERC20 = await deployments.get('CErc20Immutable');
    await save("eBUSD", CERC20);
};

module.exports.dependencies = ['BusdInterestRateModel', 'Unitroller'];
module.exports.tags = ['eBUSD'];