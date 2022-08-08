module.exports = async ({
    deployments,
    getNamedAccounts
}) => {
    console.log("22. Set USDT price feed")
    const { execute } = deployments;
    const { deployer, usdtFeed } = await getNamedAccounts()

    await execute('FeedPriceOracle', {
        from: deployer,
    },
        "setFeed",
        (await deployments.get('eUSDT')).address,
        usdtFeed,
        18
    )
    return true
};

module.exports.id = 'setUsdtFeed';
module.exports.tags = ['setUsdtFeed'];
module.exports.dependencies = ['FeedPriceOracle', 'eUSDT'];