module.exports = async ({
    deployments,
    getNamedAccounts
}) => {
    console.log("8. Deploy eBNB")
    const { deploy, save } = deployments;
    const { deployer } = await getNamedAccounts()

    const Unitroller = await deployments.get('Unitroller');
    const Model = await deployments.get('BnbInterestRateModel');

    await deploy('CBnb', {
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

    const CERC20 = await deployments.get('CBnb');
    await save("eBNB", CERC20);
};

module.exports.dependencies = ['BnbInterestRateModel', 'Unitroller'];
module.exports.tags = ['eBNB'];