// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol';
import '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';

error TransferFailed();
error MORE_THAN_ZERO();
error NOT_OWNER();

contract Interaction is OwnableUpgradeable {

    //  msg.sender => tokenIn => tokenOut => amount
    mapping(address=>mapping(address=>mapping(address=>uint256))) public tradeRecord;

    address private constant UniswapRouter = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address private constant UniswapFactory = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;

    IERC20 public tokenA;
    IERC20 public tokenB;

    uint256 private testVal;

    function initUpgrade(uint256 _val) external {
        testVal = _val;
    }

    function trade(
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn,
        uint256 _amountOutMin
    )
    MoreThanZero(_amountIn)
    onlyOwner external
    {
        // transfer money into the contract
        bool success = IERC20(_tokenIn).transferFrom(msg.sender,address(this),_amountIn);
        // if not successful, revert
        if (!success) revert TransferFailed();

        IERC20(_tokenIn).approve(UniswapRouter, _amountIn);

        address[] memory path;
        path = new address[](2);
        path[0] = _tokenIn;
        path[1] = _tokenOut;

        IUniswapV2Router02(UniswapRouter).swapExactTokensForTokens(
            _amountIn,
            _amountOutMin,
            path,
            msg.sender,
            block.timestamp
        );

        tradeRecord[msg.sender][_tokenIn][_tokenOut] =  tradeRecord[msg.sender][_tokenIn][_tokenOut] + _amountIn;
    }

    function withdraw(address _token, uint256 amount) external onlyOwner {
        address payable owner = payable(msg.sender);
        (bool success, ) = owner.call{value: address(this).balance}("");
        if(!success) revert TransferFailed();
    }

    modifier MoreThanZero(uint256 _amount){
        if (_amount == 0) revert MORE_THAN_ZERO();
        _;
    }

    function getTradeBalance(address _tokenIn,address _tokenOut)
    public view returns(uint256){
        return tradeRecord[msg.sender][_tokenIn][_tokenOut];
    }

    function retrieveTestVal() public view returns(uint256){
        return testVal;
    }
}
