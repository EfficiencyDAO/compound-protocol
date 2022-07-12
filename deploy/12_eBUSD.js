module.exports = async ({
    deployments,
    getNamedAccounts
}) => {
    console.log("12. Deploy eBUSD")
    const { deploy, save } = deployments;
    const { deployer, busd } = await getNamedAccounts()

    const Unitroller = await deployments.get('Unitroller');
    const Model = await deployments.get('BusdInterestRateModel');
    const Implementation = await deployments.get('Implementation');

    await deploy('CErc20Delegator', {
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

    const CERC20 = await deployments.get('CErc20Delegator');
    await save("eBUSD", CERC20);
};

module.exports.dependencies = ['Implementation', 'BusdInterestRateModel', 'Unitroller'];
module.exports.tags = ['eBUSD'];