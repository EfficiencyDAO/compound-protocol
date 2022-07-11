module.exports = async ({
    deployments,
    getNamedAccounts
}) => {
    console.log("13. Set BUSD price feed")
    const { execute } = deployments;
    const { deployer, busdFeed } = await getNamedAccounts()

    await execute('FeedPriceOracle', {
        from: deployer,
    },
        "setFeed",
        (await deployments.get('eBUSD')).address,
        busdFeed,
        18
    )
    return true
};

module.exports.id = 'setBusdFeed';
module.exports.tags = ['setBusdFeed'];
module.exports.dependencies = ['FeedPriceOracle', 'eBUSD'];