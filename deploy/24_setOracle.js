module.exports = async ({
    deployments,
    getNamedAccounts,
}) => {
    console.log("24. Attach Oracle to comptroller")
    const { execute } = deployments;
    const { deployer } = await getNamedAccounts()

    await execute('Comptroller', {
        from: deployer
    },
        "_setPriceOracle",
        (await deployments.get('FeedPriceOracle')).address
    )
    return true
};

module.exports.id = 'setOracle'
module.exports.tags = ['setOracle'];
module.exports.dependencies = ['Unitroller', 'FeedPriceOracle'];