import { HardhatUserConfig } from "hardhat/config"

import "@nomiclabs/hardhat-waffle"
import '@nomiclabs/hardhat-etherscan'
import 'hardhat-deploy'

require('dotenv').config()

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            {
                version: "0.8.14",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            }
        ]
    },
    defaultNetwork: "hardhat",
    networks: {
        localhost: {},
        hardhat: {},
        bsc: {
            url: `https://bsc-dataseed.binance.org`,
            chainId: 56,
            accounts: [process.env.MAINNET_PRIVKEY as string, process.env.DELEGATOR_PRIVKEY as string]
        },
        bscTestnet: {
            url: "https://data-seed-prebsc-1-s1.binance.org:8545",
            chainId: 97,
            accounts: [process.env.TESTNET_PRIVKEY as string, process.env.DELEGATOR_PRIVKEY as string]
        }
    },
    etherscan: {
        apiKey: process.env.BSCSCAN_API_KEY
    },
    namedAccounts: {
        deployer: {
            default: 0
        },
        busd: {
            56: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
            97: '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee'
        },
        usdc: {
            56: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
            97: '0x64544969ed7EBf5f083679233325356EbE738930'
        },
        usdt: {
            56: '0x55d398326f99059ff775485246999027b3197955',
            97: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd'
        },
        bnbFeed: {
            31337: '0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526',
            56: '0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE',
            97: '0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526'
        },
        busdFeed: {
            31337: '0x9331b55D9830EF609A2aBCfAc0FBCE050A52fdEa',
            56: '0xcBb98864Ef56E9042e7d2efef76141f15731B82f',
            97: '0x9331b55D9830EF609A2aBCfAc0FBCE050A52fdEa'
        },
        usdcFeed: {
            31337: '0x90c069C4538adAc136E051052E14c1cD799C41B7',
            56: '0x51597f405303C4377E36123cBc172b13269EA163',
            97: '0x90c069C4538adAc136E051052E14c1cD799C41B7'
        },
        usdtFeed: {
            31337: '0xEca2605f0BCF2BA5966372C99837b1F182d3D620',
            56: '0xB97Ad0E74fa7d920791E90258A6E2085088b4320',
            97: '0xEca2605f0BCF2BA5966372C99837b1F182d3D620'
        }
    }
}

export default config