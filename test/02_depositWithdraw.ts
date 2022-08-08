import { expect } from "chai"
import { formatUnits, parseEther, parseUnits } from "ethers/lib/utils"
import { ethers } from "hardhat"

import {
    init,
    wallets,
    deployEBnb,
    deployComptroller,
    deployUnitroller,
    deployWhitePaperInterestRateModel,
    deployFeedOracle,
    deployImplementation,
    supportMarket,
    getUnitrollerProxy,
    deployEEff,
    deployEff
} from './utils'

let eff
let eBNB
let eEFF
let comptroller
let unitroller
let feedOracle

describe("Deposit & Withdraw Tests | Efficiency Protocol", () => {
    before(async () => {
        await init()

        comptroller = await deployComptroller()
        unitroller = await deployUnitroller()
        feedOracle = await deployFeedOracle()
        await deployWhitePaperInterestRateModel()
        await deployImplementation()
        eff = await deployEff()

        await unitroller.connect(wallets.deployer)._setPendingImplementation(comptroller.address)
        await comptroller.connect(wallets.deployer)._become(unitroller.address)

        eBNB = await deployEBnb()
        eEFF = await deployEEff()

        await supportMarket(unitroller.address, eBNB.address, wallets.deployer)
        await supportMarket(unitroller.address, eEFF.address, wallets.deployer)
    })

    describe('market prep', () => {
        it('should set price feeds for eTokens', async () => {
            const troller = await getUnitrollerProxy()

            await expect(feedOracle.setFixedPrice(eBNB.address, parseEther('257')))
                .to.not.be.reverted

            await expect(feedOracle.setFixedPrice(eEFF.address, parseEther('1')))
                .to.not.be.reverted

            await expect(troller._setPriceOracle(feedOracle.address))
                .to.emit(troller, 'NewPriceOracle')
        })

        it('should set collateral factor for eTokens', async () => {
            const troller = await getUnitrollerProxy()
            const collateralFactor = '500000000000000000'

            await expect(troller._setCollateralFactor(eBNB.address, collateralFactor))
                .to.emit(troller, 'NewCollateralFactor')
                .withArgs(eBNB.address, 0, collateralFactor)

            await expect(troller._setCollateralFactor(eEFF.address, collateralFactor))
                .to.emit(troller, 'NewCollateralFactor')
                .withArgs(eEFF.address, 0, collateralFactor)
        })

        it('should enter markets', async () => {
            const troller = await getUnitrollerProxy()

            await expect(troller.enterMarkets([eBNB.address, eEFF.address]))
                .to.emit(troller, 'MarketEntered')
        })
    })

    describe('deposits eBnb', () => {
        it('should fail to mint if insufficient underlying balance', async () => {
            await expect(eBNB.connect(wallets.deployer)
                .mint({ value: ethers.utils.parseEther("1000000") }))
                .to.be.rejected
        })

        it('should pass if sufficient underlying balance', async () => {
            await expect(eBNB.connect(wallets.deployer)
                .mint({ value: ethers.utils.parseEther("2") }))
                .to.emit(eBNB, 'Mint')
                .to.emit(eBNB, 'Transfer')
        })

        it('should validate minted eToken balance', async () => {
            const snapshot = await eBNB.getAccountSnapshot(wallets.deployer.address)
            const eTokens = parseFloat(formatUnits(snapshot[1]))
            const exRate = parseFloat(formatUnits(snapshot[3]))

            expect(eTokens * exRate).to.eq(2)
        })
    })

    describe('deposits eBusd', () => {
        it('should fail if no approval approval', async () => {
            expect(await eff.allowance(wallets.deployer.address, eEFF.address))
                .to.eq(0)
        })

        it('should grant approval', async () => {
            await expect(eff.approve(eEFF.address, ethers.utils.parseEther('1000')))
                .to.not.be.reverted
        })

        it('should allow with approval of 1000 token spend', async () => {
            expect(await eff.allowance(wallets.deployer.address, eEFF.address))
                .to.eq(ethers.utils.parseEther('1000'))
        })

        it('should pass with approval and sufficient underlying balance', async () => {
            await expect(eEFF.connect(wallets.deployer)
                .mint(ethers.utils.parseEther("100")))
                .to.emit(eEFF, 'Mint')
                .to.emit(eEFF, 'Transfer')
        })

        it('should validate minted eToken balance', async () => {
            const snapshot = await eEFF.getAccountSnapshot(wallets.deployer.address)
            const eTokens = parseFloat(formatUnits(snapshot[1]))
            const exRate = parseFloat(formatUnits(snapshot[3]))

            expect(eTokens * exRate).to.eq(100)
        })
    })

    describe('withdrawals eBnb', () => {
        it('should fail if insufficient eToken balance', async () => {
            await expect(eBNB.redeemUnderlying(ethers.utils.parseEther("25000")))
                .to.be.revertedWithCustomError(eBNB, 'RedeemComptrollerRejection')
        })

        it('should pass with sufficient eToken balance', async () => {
            await expect(eBNB.redeemUnderlying(ethers.utils.parseEther("1")))
                .to.emit(eBNB, 'Redeem')
                .to.emit(eBNB, 'Transfer')
        })

        it('should validate remaining eToken balance', async () => {
            const snapshot = await eBNB.getAccountSnapshot(wallets.deployer.address)
            const eTokens = parseFloat(formatUnits(snapshot[1]))
            const exRate = parseFloat(formatUnits(snapshot[3]))

            expect(eTokens * exRate).to.eq(1)
        })
    })

    describe('withdrawals eBusd', () => {
        it('should fail if insufficient eToken balance', async () => {
            await expect(eEFF.redeemUnderlying(ethers.utils.parseEther("25000")))
                .to.be.reverted
        })

        it('should pass with sufficient eToken balance', async () => {
            await expect(eEFF.redeemUnderlying(ethers.utils.parseEther("50")))
                .to.emit(eEFF, 'Redeem')
                .to.emit(eEFF, 'Transfer')
        })

        it('should validate remaining eToken balance', async () => {
            const snapshot = await eEFF.getAccountSnapshot(wallets.deployer.address)
            const eTokens = parseFloat(formatUnits(snapshot[1]))
            const exRate = parseFloat(formatUnits(snapshot[3]))

            expect(eTokens * exRate).to.eq(50)
        })
    })
})