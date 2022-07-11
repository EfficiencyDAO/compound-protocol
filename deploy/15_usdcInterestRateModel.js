module.exports = async ({
    deployments,
    getNamedAccounts
}) => {
    console.log("15. Deploy USDC Interest Rate Model")
    const { deploy, save } = deployments;
    const { deployer } = await getNamedAccounts()

    await deploy('WhitePaperInterestRateModel', {
        from: deployer,
        args: [
            "20000000000000000",
            "100000000000000000"
        ]
    });

    const Model = await deployments.get('WhitePaperInterestRateModel');
    await save("UsdcInterestRateModel", Model);
};

module.exports.tags = ['UsdcInterestRateModel'];