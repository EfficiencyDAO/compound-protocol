module.exports = async ({
    deployments,
    getNamedAccounts,
}) => {
    console.log("19. Add USDC Market")
    const { execute } = deployments;
    const { deployer } = await getNamedAccounts()

    await execute('Comptroller', {
        from: deployer
    },
        "_supportMarket",
        (await deployments.get('eUSDC')).address
    )
    return true
};

module.exports.id = 'addUsdcMarket'
module.exports.tags = ['addUsdcMarket'];
module.exports.dependencies = ['Unitroller', 'eUSDC'];