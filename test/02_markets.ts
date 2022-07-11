import { expect } from "chai"

import {
    init,
    wallets,
    deployEBnb,
    deployComptroller,
    deployUnitroller,
    supportMarket,
    deployWhitePaperInterestRateModel
} from './utils'

let eBNB: any
let comptroller: any
let unitroller: any
let whitePaperInterestRateModel: any

describe("Markets Tests | Efficiency Protocol", () => {
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
        await supportMarket(unitroller.address, eBNB.address, wallets.deployer)
    })

    describe('enter markets', () => {
        // TODO
    })

    describe('exit markets', () => {
        // TODO
    })
})
