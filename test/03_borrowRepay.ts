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
let initialLiquidity = 0
let borrowLiquidity = 0

describe("Borrow & Repay Tests | Efficiency Protocol", () => {
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

    describe('borrow eBNB', () => {
        it('should setup collateral', async () => {

            // Add eBNB collateral
            await expect(eBNB.connect(wallets.deployer)
                .mint({ value: ethers.utils.parseEther("100") }))
                .to.emit(eBNB, 'Mint')
                .to.emit(eBNB, 'Transfer')

            // Add eEFFF collateral
            await expect(eff.approve(eEFF.address, ethers.utils.parseEther('100000')))
                .to.not.be.reverted

            await expect(eEFF.connect(wallets.deployer)
                .mint(ethers.utils.parseEther("100000")))
                .to.emit(eEFF, 'Mint')
                .to.emit(eEFF, 'Transfer')
        })

        it('should validate account liquidity', async () => {
            const troller = await getUnitrollerProxy()
            const [error, liquidity, shortfall] = await troller.getAccountLiquidity(wallets.deployer.address)

            expect(error).to.eq(0)
            expect(shortfall).to.eq(0)
            expect(liquidity).to.be.greaterThan(0)

            initialLiquidity = liquidity
        })

        it('should borrow 5 BNB', async () => {
            const amount = ethers.utils.parseEther('5')

            await expect(eBNB.borrow(amount))
                .to.emit(eBNB, 'Borrow')
                .withArgs(wallets.deployer.address, amount, amount, amount)
        })

        it('should validate account lesser liquidity after borrow', async () => {
            const troller = await getUnitrollerProxy()
            const [error, liquidity, shortfall] = await troller.getAccountLiquidity(wallets.deployer.address)

            expect(error).to.eq(0)
            expect(shortfall).to.eq(0)
            expect(liquidity).to.be.lessThan(initialLiquidity)
            borrowLiquidity = liquidity
        })

        it('should fail to exit market with loan on hand', async () => {
            const troller = await getUnitrollerProxy()

            // Emit Failure with NONZERO_BORROW_BALANCE, EXIT_MARKET_BALANCE_OWED
            await expect(troller.exitMarket(eBNB.address))
                .to.emit(troller, 'Failure')
                .withArgs(12, 2, 0)
        })
    })

    describe('repay eBNB', () => {
        it('should fail to repay more than owed', async () => {
            await expect(eBNB.repayBorrow({ value: ethers.utils.parseEther('10') }))
                .to.be.revertedWithPanic()
        })

        it('should successfully repay loan', async () => {
            // console.log('totalBorrowsCurrent', await eBNB.totalBorrowsCurrent())
            await expect(eBNB.repayBorrow({ value: ethers.utils.parseEther('5') }))
                .to.emit(eBNB, 'RepayBorrow')
        })

        it('should validate account lesser liquidity after borrow', async () => {
            const troller = await getUnitrollerProxy()
            const [error, liquidity, shortfall] = await troller.getAccountLiquidity(wallets.deployer.address)

            expect(error).to.eq(0)
            expect(shortfall).to.eq(0)
            expect(liquidity).to.be.greaterThan(borrowLiquidity)
            expect(liquidity).to.be.lessThan(initialLiquidity)
        })

        it('should fail to exit market due to debt dust', async () => {
            const troller = await getUnitrollerProxy()

            await expect(troller.exitMarket(eBNB.address))
                .to.emit(troller, 'Failure')
        })
    })
})
