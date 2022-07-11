module.exports = async ({
    deployments,
    getNamedAccounts
}) => {
    console.log("17. Set USDC price feed")
    const { execute } = deployments;
    const { deployer, usdcFeed } = await getNamedAccounts()

    await execute('FeedPriceOracle', {
        from: deployer,
    },
        "setFeed",
        (await deployments.get('eUSDC')).address,
        usdcFeed,
        18
    )
    return true
};

module.exports.id = 'setUsdcFeed';
module.exports.tags = ['setUsdcFeed'];
module.exports.dependencies = ['FeedPriceOracle', 'eUSDC'];