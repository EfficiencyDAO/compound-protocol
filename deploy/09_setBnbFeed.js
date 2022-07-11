module.exports = async ({
    deployments,
    getNamedAccounts
}) => {
    console.log("9. Set BNB price feed")
    const { execute } = deployments;
    const { deployer, bnbFeed } = await getNamedAccounts()

    await execute('FeedPriceOracle', {
        from: deployer,
    },
        "setFeed",
        (await deployments.get('eBNB')).address,
        bnbFeed,
        18
    )
    return true
};

module.exports.id = 'setBnbFeed';
module.exports.tags = ['setBnbFeed'];
module.exports.dependencies = ['FeedPriceOracle', 'eBNB'];