module.exports = async ({
    deployments,
    getNamedAccounts
}) => {
    console.log("21. Deploy Lockdrop Contracts")
    const { deploy, save } = deployments;
    const { deployer } = await getNamedAccounts()

    const durations = [
        { eTokens: ['eBNB', 'eBUSD', 'eUSDC', 'eUSDT'], durationMo: 1 },
        { eTokens: ['eBNB', 'eBUSD', 'eUSDC', 'eUSDT'], durationMo: 3 },
        { eTokens: ['eBNB', 'eBUSD', 'eUSDC', 'eUSDT'], durationMo: 6 },
        { eTokens: ['eBNB', 'eBUSD', 'eUSDC', 'eUSDT'], durationMo: 12 }
    ]
    
    for (let i = 0; i < durations.length; i++) {
        const duration = durations[i]
        const durationMo = duration.durationMo
        const eTokens = duration.eTokens

        const dateEndDate = new Date();
        dateEndDate.setHours(dateEndDate.getHours() + durationMo);
        const tsEndDate = Math.round(dateEndDate / 1000)
    
        // Deploy Lockdrop Contracts
        for (let e = 0; e < eTokens.length; e++) {
            const eToken = eTokens[e]
            
            const eTokenContract = await deployments.get(eToken)
            const lockdropContract = await deploy('Lockdrop', {
                from: deployer,
                args: [
                    `${eToken} | ${durationMo} mo | Efficiency DAO Lockdrop V1`,
                    eTokenContract.address,
                    tsEndDate
                ]
            });
            
            await save(`${eToken}Lockdrop${durationMo}Mo`, lockdropContract)
        }
    }
};

module.exports.dependencies = [];
module.exports.tags = ['Lockdrop'];