// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

interface IYearnVault is IERC20Metadata {
    function deposit(uint256 _amount) external returns (uint256);

    function withdraw(uint256 maxShares) external returns (uint256);

    function token() external view returns (address);

    function totalAssets() external view returns (uint256);
}
