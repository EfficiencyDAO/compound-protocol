const hre = require("hardhat")
import { ethers } from 'hardhat'

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
let FeedPriceOracleArtifact

let eff
let eBnb
let eEff
let comptroller
let unitroller
let whitePaperInterestRateModel
let implementation
let signers

export const init = async () => {
    // EFFArtifact = await hre.artifacts.readArtifact('EFF')
    
    CBnbArtifact = await hre.artifacts.readArtifact('CBnb')
    ComptrollerArtifact = await hre.artifacts.readArtifact('Comptroller')
    UnitrollerArtifact = await hre.artifacts.readArtifact('Unitroller')
    TokenErrorReporterArtifact = await hre.artifacts.readArtifact('TokenErrorReporter')
    CErc20DelegatorArtifact = await hre.artifacts.readArtifact('CErc20Delegator')
    WhitePaperInterestRateModel = await hre.artifacts.readArtifact('WhitePaperInterestRateModel')
    FeedPriceOracleArtifact = await hre.artifacts.readArtifact('FeedPriceOracle')

    signers = await hre.ethers.getSigners()

    wallets.admin = signers[0]
    wallets.deployer = signers[1]
    wallets.delegate = signers[2]
}

export const deployEff = async () => {
    const EFF = await ethers.getContractFactory("EFF")
    eff = await EFF.connect(wallets.deployer).deploy(wallets.deployer.address)

    return eff
}

export const deployComptroller = async () => {
    const Comptroller = await ethers.getContractFactory("Comptroller")
    comptroller = await Comptroller.connect(wallets.deployer).deploy();

    return comptroller
}

export const deployUnitroller = async () => {
    const Unitroller = await ethers.getContractFactory("Unitroller")
    unitroller = await Unitroller.connect(wallets.deployer).deploy()

    return unitroller
}

export const deployImplementation = async () => {
    const Implementation = await ethers.getContractFactory("CErc20Delegate")
    implementation = await Implementation.connect(wallets.deployer).deploy()

    return implementation
}

export const deployWhitePaperInterestRateModel = async () => {
    const WhitePaperInterestRateModel = await ethers.getContractFactory("WhitePaperInterestRateModel")
    whitePaperInterestRateModel = await WhitePaperInterestRateModel.connect(wallets.deployer)
    .deploy(
        "20000000000000000",
        "100000000000000000"
    )

    return whitePaperInterestRateModel
}

export const deployEBnb = async () => {
    const EBnb = await ethers.getContractFactory("CBnb")
    eBnb = await EBnb.connect(wallets.deployer)
    .deploy(
        unitroller.address,
        whitePaperInterestRateModel.address,
        "200000000000000000000000000",
        "Efficiency BNB",
        "eBNB",
        "8",
        wallets.deployer.address
    )

    return eBnb
}

export const deployEEff = async () => {
    const EEff = await ethers.getContractFactory("CErc20Delegator")
    eEff = await EEff.connect(wallets.deployer)
        .deploy(
            eff.address,
            unitroller.address,
            whitePaperInterestRateModel.address,
            "200000000000000000000000000",
            "Efficiency eToken",
            "eEFF",
            "8",
            wallets.deployer.address,
            implementation.address,
            0x00
        )

    return eEff
}

export const deployFeedOracle = async () => {
    const FeedPriceOracle = await ethers.getContractFactory("FeedPriceOracle")
    const feedPriceOracle = await FeedPriceOracle.connect(wallets.deployer).deploy()

    return feedPriceOracle
}

export const getUnitrollerProxy = async (unitroller_ = unitroller.address, account = wallets.deployer) => {
    const unitrollerProxy = await ethers.getContractAt(
        "Comptroller",
        unitroller_,
    )

    return unitrollerProxy.connect(wallets.deployer)
}


export const callUnitrollerFunction = async (unitroller_ = unitroller.address, account = wallets.deployer, method, ...args) => {
    const unitrollerProxy = await ethers.getContractAt(
        "Comptroller",
        unitroller_,
    )

    return unitrollerProxy.connect(wallets.deployer).methods[method](...args)
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