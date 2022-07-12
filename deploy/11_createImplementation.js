module.exports = async ({
    deployments,
    getNamedAccounts,
}) => {
    console.log("11. Create Implementation")
    const { deploy, save } = deployments;
    const { deployer } = await getNamedAccounts()

    await deploy('CErc20Delegate', {
        from: deployer
    });

    const Implementation = await deployments.get('CErc20Delegate');
    await save("Implementation", Implementation);
};

module.exports.tags = ['Implementation'];