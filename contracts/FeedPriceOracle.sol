// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import "./PriceOracle.sol";
import "./CErc20.sol";

interface Feed {
    function decimals() external view returns (uint8);
    function latestAnswer() external view returns (int256);
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
}

contract FeedPriceOracle is PriceOracle {
    struct FeedData {
        address addr;
        uint8 tokenDecimals;
        uint8 feedDecimals;
    }

    struct FixedPriceData {
        uint256 price;
        uint256 timestamp;
    }

    address public admin;
    uint8 constant DECIMALS = 36;
    uint constant FIXED_PRICE_BUFFER = 1 hours;
    mapping(address => FeedData) public feeds;
    mapping(address => FixedPriceData) public fixedPrices;
    event NewAdmin(address oldAdmin, address newAdmin);
    
    modifier onlyAdmin() {
      require(msg.sender == admin, "only admin may call");
      _;
    }

    constructor() public {
        admin = msg.sender;
    }

    function setAdmin(address newAdmin) external onlyAdmin() {
        address oldAdmin = admin;
        admin = newAdmin;

        emit NewAdmin(oldAdmin, newAdmin);
    }

    function setFeed(
        CToken cToken_,
        address feed_,
        uint8 underlyingDecimals_
    ) public onlyAdmin {
        uint8 feedDecimals = Feed(feed_).decimals();
        uint8 decimalDelta = DECIMALS - underlyingDecimals_ - feedDecimals;

        feeds[address(cToken_)] = FeedData(feed_, underlyingDecimals_, decimalDelta);
    }

    function removeFeed(CToken cToken_) public onlyAdmin {
        delete feeds[address(cToken_)];
    }

    function setFixedPrice(CToken cToken_, uint256 price) public onlyAdmin {
        fixedPrices[address(cToken_)] = FixedPriceData(price, block.timestamp);
    }

    function removeFixedPrice(CToken cToken_) public onlyAdmin {
        delete fixedPrices[address(cToken_)];
    }

    function getUnderlyingPrice(CToken cToken_)
        public
        view
        override
        returns (uint256)
    {
        FeedData memory feed = feeds[address(cToken_)];

        if (feed.addr != address(0)) {
            (
                uint80 roundId,
                int256 rawPrice,
                ,
                uint256 updatedAt,
                uint80 answeredInRound
            ) = Feed(feed.addr).latestRoundData();

            require(rawPrice > 0, "Price cannot be lower than 0");
            require(updatedAt != 0, "Latest round data is incomplete state");
            require(answeredInRound >= roundId, "Latest price data is stale");
            require(feed.feedDecimals <= DECIMALS, "DECIMAL UNDERFLOW");

            return uint256(rawPrice) * (10**feed.feedDecimals);
        }

        FixedPriceData memory fixedPrice = fixedPrices[address(cToken_)];
        require(fixedPrice.timestamp + FIXED_PRICE_BUFFER >= block.timestamp);
        return fixedPrice.price;
    }
}
