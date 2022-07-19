module.exports = async ({
    deployments,
    getNamedAccounts,
}) => {
    console.log("25. Set Collateral Factor")
    const { execute } = deployments;
    const { deployer } = await getNamedAccounts()

    await execute('Unitroller', {
        from: deployer,
    },
        "_setCollateralFactor",
        (await deployments.get('Comptroller')).address,
        (await deployments.get('eBNB')).address,
        '600000000000000000'
    )

    await execute('Unitroller', {
        from: deployer,
    },
        "_setCollateralFactor",
        (await deployments.get('Comptroller')).address,
        (await deployments.get('eBUSD')).address,
        '600000000000000000'
    )

    await execute('Unitroller', {
        from: deployer,
    },
        "_setCollateralFactor",
        (await deployments.get('Comptroller')).address,
        (await deployments.get('eUSDC')).address,
        '600000000000000000'
    )

    await execute('Unitroller', {
        from: deployer,
    },
        "_setCollateralFactor",
        (await deployments.get('Comptroller')).address,
        (await deployments.get('eUSDT')).address,
        '600000000000000000'
    )
    
    return true
};

module.exports.id = 'setCollateralFactor';
module.exports.tags = ['setCollateralFactor'];
module.exports.dependencies = ['Unitroller', 'eBNB', 'eBUSD', 'eUSDC', 'eUSDT'];