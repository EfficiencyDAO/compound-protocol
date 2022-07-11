module.exports = async ({
    deployments,
    getNamedAccounts,
}) => {
    console.log("14. Add BUSD Market")
    const { execute } = deployments;
    const { deployer } = await getNamedAccounts()

    await execute('Comptroller', {
        from: deployer
    },
        "_supportMarket",
        (await deployments.get('eBUSD')).address
    )
    return true
};

module.exports.id = 'addBusdMarket'
module.exports.tags = ['addBusdMarket'];
module.exports.dependencies = ['Unitroller', 'eBUSD'];