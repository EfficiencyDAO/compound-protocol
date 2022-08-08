import { expect } from "chai"
import { parseUnits } from "ethers/lib/utils"
import { ethers } from "hardhat"

import {
    init,
    wallets,
    deployEBnb,
    deployComptroller,
    deployUnitroller,
    deployWhitePaperInterestRateModel,
    deployFeedOracle
} from './utils'

let eBNB
let comptroller
let unitroller
let feedOracle

describe("Comptroller Tests | Efficiency Protocol", () => {

    before(async () => {
        await init()
    })

    beforeEach(async () => {
        comptroller = await deployComptroller()
        unitroller = await deployUnitroller()
        feedOracle = await deployFeedOracle()
        await deployWhitePaperInterestRateModel()

        await unitroller.connect(wallets.deployer)._setPendingImplementation(comptroller.address)
        await comptroller.connect(wallets.deployer)._become(unitroller.address)

        eBNB = await deployEBnb()
    })

    describe('set market comptroller', () => {
        it('should not allow a non admin to set comptroller', async () => {
            const nonAdmin = wallets.delegate

            // Fail when setting the comptroller through a non admin
            await expect(eBNB.connect(nonAdmin)._setComptroller(unitroller.address)).to.be.reverted
        })

        it('should allow an admin to set comptroller', async () => {
            const admin = wallets.deployer

            // Pass when setting the comptroller through an admin
            await expect(eBNB.connect(admin)._setComptroller(unitroller.address)).to.not.be.reverted
            expect(await eBNB.comptroller()).to.eq(unitroller.address)
        })
    })

    describe('set support money market', () => {
        before(async () => {
            const admin = wallets.deployer
            eBNB.connect(admin)._setComptroller(unitroller.address)
        })

        it('should fail if token is not eToken', async () => {
            const admin = wallets.deployer
            const invalidAddress = '0xcBb98864Ef56E9042e7d2efef76141f15731B82f'
            const unitrollerProxy = await ethers.getContractAt("Comptroller", unitroller.address)

            await expect(unitrollerProxy.connect(admin)._supportMarket(invalidAddress))
                .to.be.revertedWithoutReason()
        })

        it('should succeed and add market', async () => {
            const admin = wallets.deployer
            const unitrollerProxy = await ethers.getContractAt("Comptroller", unitroller.address)

            await expect(unitrollerProxy.connect(admin)._supportMarket(eBNB.address))
                .to.emit(unitrollerProxy, 'MarketListed')
                .withArgs(eBNB.address)
        })
    })
})

