// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import "./CBnb.sol";

/**
 * @title Compound's Maximillion Contract
 * @author Compound
 */
contract Maximillion {
    /**
     * @notice The default cBnb market to repay in
     */
    CBnb public cBnb;

    /**
     * @notice Construct a Maximillion to repay max in a CBnb market
     */
    constructor(CBnb cBnb_) public {
        cBnb = cBnb_;
    }

    /**
     * @notice msg.sender sends Bnb to repay an account's borrow in the cBnb market
     * @dev The provided Bnb is applied towards the borrow balance, any excess is refunded
     * @param borrower The address of the borrower account to repay on behalf of
     */
    function repayBehalf(address borrower) public payable {
        repayBehalfExplicit(borrower, cBnb);
    }

    /**
     * @notice msg.sender sends Bnb to repay an account's borrow in a cBnb market
     * @dev The provided Bnb is applied towards the borrow balance, any excess is refunded
     * @param borrower The address of the borrower account to repay on behalf of
     * @param cBnb_ The address of the cBnb contract to repay in
     */
    function repayBehalfExplicit(address borrower, CBnb cBnb_) public payable {
        uint received = msg.value;
        uint borrows = cBnb_.borrowBalanceCurrent(borrower);
        if (received > borrows) {
            cBnb_.repayBorrowBehalf{value: borrows}(borrower);
            payable(msg.sender).transfer(received - borrows);
        } else {
            cBnb_.repayBorrowBehalf{value: received}(borrower);
        }
    }
}
