import {
    init,
    wallets,
    deployEBnb,
    deployComptroller,
    deployUnitroller,
    deployWhitePaperInterestRateModel
} from './utils'

let eBNB
let comptroller
let unitroller
let whitePaperInterestRateModel

describe("Comptroller Tests | Efficiency Protocol", () => {
    before(async () => {
        await init()
    })

    beforeEach(async () => {
        comptroller = await deployComptroller()
        unitroller = await deployUnitroller()
        whitePaperInterestRateModel = await deployWhitePaperInterestRateModel()

        await unitroller.connect(wallets.deployer)._setPendingImplementation(comptroller.address)
        await comptroller.connect(wallets.deployer)._become(unitroller.address)

        eBNB = await deployEBnb()
    })

    describe('comptroller', () => {
        it('should create and allow admin to set comptroller', async () => {

        })
    })

    describe('set liquidation incentive', () => {

    })

    describe('set price oracle', () => {

    })

    describe('set close factor', () => {

    })

    describe('set collateral factor', () => {

    })

    describe('set support money market', () => {

    })
})

