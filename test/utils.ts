const hre = require("hardhat")

export let wallets = {
    deployer: null as any,
    admin: null as any,
    delegate: null as any
}

let EFFArtifact
let CBnbArtifact
let ComptrollerArtifact
let UnitrollerArtifact
let CErc20DelegatorArtifact
let WhitePaperInterestRateModel
let TokenErrorReporterArtifact

let eff
let eBnb
let comptroller
let unitroller
let whitePaperInterestRateModel
let signers

export const init = async () => {
    EFFArtifact = await hre.artifacts.readArtifact('EFF')
    CBnbArtifact = await hre.artifacts.readArtifact('CBnb')
    ComptrollerArtifact = await hre.artifacts.readArtifact('Comptroller')
    UnitrollerArtifact = await hre.artifacts.readArtifact('Unitroller')
    TokenErrorReporterArtifact = await hre.artifacts.readArtifact('TokenErrorReporter')
    CErc20DelegatorArtifact = await hre.artifacts.readArtifact('CErc20Delegator')
    WhitePaperInterestRateModel = await hre.artifacts.readArtifact('WhitePaperInterestRateModel')

    signers = await hre.ethers.getSigners()

    wallets.admin = signers[0]
    wallets.deployer = signers[1]
    wallets.delegate = signers[2]
}

export const deployEff = async () => {
    eff = await hre.waffle.deployContract(wallets.deployer, EFFArtifact, [wallets.deployer.address])
    return eff
}

export const deployComptroller = async () => {
    comptroller = await hre.waffle.deployContract(wallets.deployer, ComptrollerArtifact, [])
    return comptroller
}

export const deployUnitroller = async () => {
    unitroller = await hre.waffle.deployContract(wallets.deployer, UnitrollerArtifact, [])
    return unitroller
}

export const deployWhitePaperInterestRateModel = async () => {
    whitePaperInterestRateModel = await hre.waffle.deployContract(
        wallets.deployer,
        WhitePaperInterestRateModel,
        // Some random numbers taken from one of the deployment scenarios.
        [
            "20000000000000000",
            "100000000000000000"
        ],
    )
    return whitePaperInterestRateModel
}

export const deployEBnb = async () => {
    eBnb = await hre.waffle.deployContract(
        wallets.deployer,
        CBnbArtifact,
        [
            unitroller.address,
            whitePaperInterestRateModel.address,
            "200000000000000000000000000",
            "Efficiency BNB",
            "eBNB",
            "8",
            wallets.deployer.address
        ],
    )

    return eBnb
}

const callUnitrollerFunction = async (method, account, unitroller_) => {
    const unitrollerProxy = await hre.ethers.getContractAt(
        "Comptroller",
        unitroller_,
    )

    return await unitrollerProxy.connect(wallets.deployer).getAccountLiquidity(wallets.deployer)
}

export const supportMarket = async (_unitroller, market, account) => {
    const unitrollerProxy = await hre.ethers.getContractAt("Comptroller", _unitroller)
    return await unitrollerProxy.connect(account)._supportMarket(market)
}

export const enterMarkets = async (_unitroller: string, eTokens: string[], account) => {
    const unitrollerProxy = await hre.ethers.getContractAt("Comptroller", _unitroller)
    return await unitrollerProxy.connect(account).enterMarkets(eTokens)
}

export const checkMembership = async (_unitroller, eToken, account) => {
    const unitrollerProxy = await hre.ethers.getContractAt("Comptroller", _unitroller)
    return await unitrollerProxy.connect(account).checkMembership(account.address, eToken)
}

export const getAssetsIn = async (_unitroller, account) => {
    const unitrollerProxy = await hre.ethers.getContractAt("Comptroller", _unitroller)
    return await unitrollerProxy.connect(account).getAssetsIn(account.address)
}