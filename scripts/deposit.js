const { ethers } = require('hardhat')

const COMPTROLLER_ABI = [
    "function claimComp(address) public",
    "function claimComp(address holder,address[] cTokens) public",
    "function compBorrowerIndex(address, address) public view returns (uint256)",
    "function compBorrowState(address) public view returns (uint224, uint32)",
    "function compSpeeds(address) public view returns (uint256)",
    "function compSupplierIndex(address, address) public view returns (uint256)",
    "function compSupplyState(address) public view returns (uint224, uint32)",
    "function enterMarkets(address[]) returns (uint[])",
    "function exitMarket(address) returns (uint256)",
    "function getAccountLiquidity(address) external view returns (uint256, uint256, uint256)",
    "function getAllMarkets() public view returns (address[])",
    "function getAssetsIn(address) view returns (address[])",
    "function markets(address) external view returns (bool, uint256, bool)",
    "function borrowGuardianPaused(address) external view returns (bool)",
    "function mintGuardianPaused(address) external view returns (bool)",
    "function collateralGuardianPaused(address) external view returns (bool)",
    "function pauseGuardian() public view returns (address)",
    "function admin() public view returns (address)",
    "function liquidationIncentiveMantissa() public view returns (uint256)",
    "function liquidateCalculateSeizeTokens(address ctokenBorrowed, address ctokenSeize, uint256 repayAmount) public view returns (uint256, uint256)",
    "function _setCollateralFactor(address, uint)"
]

const CBNB_ABI = [
    "function borrow(uint256) returns (uint256)",
    "function mint() payable",
    "function redeemUnderlying(uint256) returns (uint256)",
    "function redeem(uint256) returns (uint256)",
    "function repayBorrow() payable",
    "function balanceOf(address) external view returns (uint256)",
    "function liquidateBorrow(uint256 amount, address account, address ctoken) external returns (uint)",
    "function supplyRatePerBlock() external view returns (uint256)",
    "function getCash() external view returns (uint256)",
    "function exchangeRateCurrent() public view returns (uint256)",
    "function borrowBalanceStored(address) external view returns (uint256)",
    "event Failure(uint256 error, uint256 info, uint256 detail)",
];


const CTOKEN_ABI = [
    "function balanceOf(address) external view returns (uint256)",
    "function allowance(address, address) external view returns (uint256)",
    "function borrow(uint256) returns (uint256)",
    "function borrowBalanceStored(address) external view returns (uint256)",
    "function borrowIndex() public view returns (uint256)",
    "function borrowRatePerBlock() external view returns (uint256)",
    "function exchangeRateCurrent() public view returns (uint256)",
    "function exchangeRateStored() public view returns (uint256)",
    "function getCash() external view returns (uint256)",
    "function mint(uint256) returns (uint256)",
    "function redeemUnderlying(uint256) returns (uint256)",
    "function redeem(uint256) returns (uint256)",
    "function repayBorrow(uint256) returns (uint256)",
    "function supplyRatePerBlock() external view returns (uint256)",
    "function totalBorrowsCurrent() external view returns (uint256)",
    "function totalBorrows() external view returns (uint256)",
    "function totalReserves() external view returns (uint256)",
    'function totalSupply() external view returns (uint256)',
    "function reserveFactorMantissa() external view returns (uint256)",
    "function underlying() external view returns (address)",
    "function decimals() view returns (uint8)",
    "function interestRateModel() view returns (address)",
    "function liquidateBorrow(address account, uint256 amount, address ctoken) external returns (uint)",
    "function getAccountSnapshot(address account) external view returns (uint, uint, uint, uint)",
    "event Failure(uint256 error, uint256 info, uint256 detail)",
];

const ERC20_ABI = [
    "function allowance(address, address) external view returns (uint256)",
    "function approve(address, uint256)",
    "function decimals() view returns (uint8)",
    "function balanceOf(address) external view returns (uint256)",
    "function totalSupply() external view returns (uint256)",
    "event Transfer(address indexed from, address indexed to, uint256 amount)",
];
const ORACLE_ABI = [
    'function getUnderlyingPrice(address) public view returns (uint)',
    'function feeds(address) public view returns (address)',
    'function setFixedPrice(address, uint256)',
    'function removeFeed(address)'
]
const COMPTROLLER_ADDRESS = '0x46965b86D806978103c54d506126E7862e208c3D'
const ORACLE_ADDRESS = '0x31fd64cf3e5641B7c5128F9d71AcF2ed4DEE98dB'
const eBNB_ADDRESS = '0x72982dD30bD30f3F93aBE3a0cACc57b56e3365C5'
const eBUSD_ADDRESS = '0xa5100B05df7c1d0109603ec9BF161A9F8cc4c74D'
const eUSDT_ADDRESS = '0x79871d84174D810307740af82f802134479fecBd'
const eUSDC_ADDRESS = '0x2784F624B2f8DaE1F0e9f4eb9899C07b6DD11E2C'

const BUSD_ADDRESS = '0xed24fc36d5ee211ea25a80239fb8c4cfd80f12ee'
const BUSD_SLOT = 1;

const toBytes32 = (bn) => {
    return ethers.utils.hexlify(ethers.utils.zeroPad(bn.toHexString(), 32));
};

const setStorageAt = async (address, index, value) => {
    await ethers.provider.send("hardhat_setStorageAt", [address, index, value]);
    await ethers.provider.send("evm_mine", []);
};

async function fund() {
    const [deployer] = await ethers.getSigners();

    new ethers.Contract(BUSD_ADDRESS, ERC20_ABI, deployer);
    const locallyManipulatedBalance = ethers.utils.parseUnits("12000");

    const userAddress = await deployer.getAddress();

    const index = ethers.utils.solidityKeccak256(
        ["uint256", "uint256"],
        [userAddress, BUSD_SLOT]
    );

    // Manipulate local balance (needs to be bytes32 string)
    await setStorageAt(
        BUSD_ADDRESS,
        index.toString(),
        toBytes32(locallyManipulatedBalance).toString()
    );
}

async function main() {
    const [deployer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(deployer.address)
    
    // Funds
    // await fund()
    const eBnbContract = await new ethers.Contract(eBNB_ADDRESS, CBNB_ABI, deployer);
    const eBusdContract = await new ethers.Contract(eBUSD_ADDRESS, CTOKEN_ABI, deployer);
    const busdContract = await new ethers.Contract(BUSD_ADDRESS, ERC20_ABI, deployer)
    console.log('Account:', deployer.address)
    console.log("Eth Funds:", ethers.utils.formatEther(balance));
    console.log('BUSD Funds', await busdContract.balanceOf(deployer.address))
    console.log('eBNB Funds', await eBnbContract.balanceOf(deployer.address))
    console.log('eBUSD Funds', await eBusdContract.balanceOf(deployer.address))
    console.log('eUSDC Funds', await eBnbContract.balanceOf(deployer.address))
    console.log('eUSDT Funds', await eBnbContract.balanceOf(deployer.address))

    // Fork the comptroller & E contracts
    const comptrollerContract = new ethers.Contract(COMPTROLLER_ADDRESS, COMPTROLLER_ABI, deployer);
    await comptrollerContract._setCollateralFactor(eBNB_ADDRESS, "500000000000000000")
    await comptrollerContract._setCollateralFactor(eBUSD_ADDRESS, "500000000000000000")
    await comptrollerContract._setCollateralFactor(eUSDC_ADDRESS, "500000000000000000")
    await comptrollerContract._setCollateralFactor(eUSDT_ADDRESS, "500000000000000000")
    await comptrollerContract.enterMarkets([eBNB_ADDRESS, eBUSD_ADDRESS, eUSDC_ADDRESS, eUSDT_ADDRESS])

    // Chainlink Contracts
    const feedOracle = await new ethers.Contract(ORACLE_ADDRESS, ORACLE_ABI, deployer)
    await feedOracle.removeFeed(eBNB_ADDRESS)
    await feedOracle.removeFeed(eBUSD_ADDRESS)
    await feedOracle.removeFeed(eUSDC_ADDRESS)
    await feedOracle.removeFeed(eUSDT_ADDRESS)
    await feedOracle.setFixedPrice(eUSDT_ADDRESS, '1000045500000000000')
    await feedOracle.setFixedPrice(eUSDC_ADDRESS, '1000045500000000000')
    await feedOracle.setFixedPrice(eBUSD_ADDRESS, '1000045500000000000')
    await feedOracle.setFixedPrice(eBNB_ADDRESS, '257770000000000000000')
    console.log('BNB Price:', (await feedOracle.getUnderlyingPrice(eBNB_ADDRESS)))
    console.log('BUSD Price:', (await feedOracle.getUnderlyingPrice(eBUSD_ADDRESS)))
    console.log('USDC Price:', (await feedOracle.getUnderlyingPrice(eUSDC_ADDRESS)))
    console.log('USDT Price:', (await feedOracle.getUnderlyingPrice(eUSDT_ADDRESS)))


    // Mint 100 eBNB of eTokens
    // console.log('eBNB Deposit 1 BNB =========================================')
    // await eBnbContract.connect(deployer).mint({ value: ethers.utils.parseEther("120")  })

    // Withdraw 50 BNB of eTokens
    // await eBnbContract.redeemUnderlying(ethers.utils.parseEther("25"))
    // console.log('borrowBalanceStored:', await eBnbContract.balanceOf(deployer.address))
    // console.log('getCash:', await eBnbContract.getCash())
    // console.log('supplyRatePerBlock:', await eBnbContract.supplyRatePerBlock())

    // Mint 100 eBUSD of eTokens
    // console.log('eBUSD Deposit 100 BUSD =========================================')
    // const busd = await new ethers.Contract(BUSD_ADDRESS, ERC20_ABI, deployer);
    // await busd.approve(eBUSD_ADDRESS, ethers.utils.parseEther('1000'))
    // await eBusdContract.mint(ethers.utils.parseEther('1000'))

    // Borrow 0.5 BNB of eTokens
    console.log('eBNB Borrow 0.5 BNB =============================== ')
    await eBnbContract.borrow(ethers.utils.parseEther('5'))

    // Repay 0.5 BNB of eTokens
    // console.log('eBNB Repay 0.5 BNB =============================== ')
    // console.log(await eBnbContract.connect(deployer).repayBorrow({ value: ethers.utils.parseEther('0.5') }))

    console.log('Comptroller: getAccountLiquidity:', await comptrollerContract.getAccountLiquidity(deployer.address))
    
    console.log('eBUSD Market =========================================')
    console.log('BUSD: exchangeRateCurrent:', await eBusdContract.exchangeRateCurrent())
    console.log('BUSD: Deposit Balance:', await eBusdContract.balanceOf(deployer.address))
    console.log('BUSD: Borrow Balance:', await eBusdContract.borrowBalanceStored(deployer.address))

    console.log('eBNB Market =========================================')
    console.log('BNB: exchangeRateCurrent:', await eBnbContract.exchangeRateCurrent())
    console.log('BNB: Deposit Balance:', await eBnbContract.balanceOf(deployer.address))
    console.log('BNB: Borrow Balance:', await eBnbContract.borrowBalanceStored(deployer.address))
}

// Execute script
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});