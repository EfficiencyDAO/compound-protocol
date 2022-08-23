module.exports = async ({
    deployments,
    getNamedAccounts,
}) => {
    console.log("01. Deploy Oracle")
    const { deploy, save } = deployments;
    const { deployer } = await getNamedAccounts()

    await deploy('FeedPriceOracle', {
        from: deployer
    });

    await save("FeedPriceOracle", await deployments.get('FeedPriceOracle'));
};