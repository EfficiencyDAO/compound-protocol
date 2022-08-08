module.exports = async ({
    deployments,
    getNamedAccounts,
}) => {
    console.log("23. Add USDT Market")
    const { execute } = deployments;
    const { deployer } = await getNamedAccounts()

    await execute('Comptroller', {
        from: deployer
    },
        "_supportMarket",
        (await deployments.get('eUSDT')).address
    )
    return true
};

module.exports.id = 'addUsdtMarket'
module.exports.tags = ['addUsdtMarket'];
module.exports.dependencies = ['Unitroller', 'eUSDT'];