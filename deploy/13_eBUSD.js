module.exports = async ({
    deployments,
    getNamedAccounts
}) => {
    console.log("13. Deploy eBUSD")
    const { deploy, save } = deployments;
    const { deployer, busd } = await getNamedAccounts()

    const Unitroller = await deployments.get('Unitroller');
    const Model = await deployments.get('BusdInterestRateModel');
    const Implementation = await deployments.get('Implementation');

    const eBUSD = await deploy('CErc20Delegator', {
        from: deployer,
        gasLimit: 25000000,
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

    await save("eBUSD", eBUSD);
};

module.exports.dependencies = ['Implementation', 'BusdInterestRateModel', 'Unitroller'];
module.exports.tags = ['eBUSD'];