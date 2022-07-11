module.exports = async ({
    deployments,
    getNamedAccounts
}) => {
    console.log("21. Set USDT price feed")
    const { execute } = deployments;
    const { deployer, bnbFeed } = await getNamedAccounts()

    await execute('FeedPriceOracle', {
        from: deployer,
    },
        "setFeed",
        (await deployments.get('eUSDT')).address,
        bnbFeed,
        18
    )
    return true
};

module.exports.id = 'setUsdtFeed';
module.exports.tags = ['setUsdtFeed'];
module.exports.dependencies = ['FeedPriceOracle', 'eUSDT'];