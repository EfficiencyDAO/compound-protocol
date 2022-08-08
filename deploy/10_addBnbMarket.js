module.exports = async ({
    deployments,
    getNamedAccounts,
}) => {
    console.log("10. Add BNB Market")
    const { execute } = deployments;
    const { deployer } = await getNamedAccounts()

    await execute('Comptroller', {
        from: deployer
    },
        "_supportMarket",
        (await deployments.get('eBNB')).address
    )
    return true
};

module.exports.id = 'addBnbMarket'
module.exports.tags = ['addBnbMarket'];
module.exports.dependencies = ['Unitroller', 'eBNB'];