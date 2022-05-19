// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "../libraries/Swaps.sol";
import "../interfaces/IPipeline.sol";

contract PurePipeline is IPipeline {
    using Swaps for IRegistry;

    string public constant PIPELINE_NAME = "PurePipeline";

    // MUTATIVE FUNCTIONS

    function deposit(
        IRegistry registry,
        address vault,
        address tokenIn,
        uint256 amountIn
    ) external override returns (uint256 price) {
        uint256 amountOut;
        if (tokenIn != vault) {
            amountOut = registry.swap(tokenIn, vault, amountIn);
        } else {
            amountOut = amountIn;
        }

        // TODO: Here should be actual price estimation using pricefeeds
        price = amountOut;
    }

    function withdraw(
        IRegistry registry,
        address vault,
        address tokenOut,
        uint256 shareNum,
        uint256 shareDenom
    ) external override returns (uint256 amountOut) {
        uint256 amountToWithdraw = (IERC20(vault).balanceOf(address(this)) *
            shareNum) / shareDenom;
        if (tokenOut != vault) {
            amountOut = registry.swap(vault, tokenOut, amountToWithdraw);
        } else {
            amountOut = amountToWithdraw;
        }
    }

    // VIEW FUNCTIONS

    function getUnderlying(address vault)
        external
        pure
        override
        returns (address[] memory tokens)
    {
        tokens = new address[](1);
        tokens[0] = vault;
    }

    function getPrice(
        IRegistry,
        address vault,
        address account
    ) external view override returns (uint256) {
        // TODO: Here should be actual price estimation using pricefeeds
        uint256 balance = IERC20(vault).balanceOf(account);
        uint8 decimals = IERC20Metadata(vault).decimals();
        if (decimals < 18) {
            return balance * 10**(18 - decimals);
        } else {
            return balance / 10**(decimals - 18);
        }
    }
}