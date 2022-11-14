// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol';
import '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';

    error TransferFailed();
    error MORE_THAN_ZERO();
    error NOT_OWNER();

// add remove liquidity for v2
contract InteractionV2 is OwnableUpgradeable {

    //  msg.sender => tokenIn => tokenOut => amount
    mapping(address=>mapping(address=>mapping(address=>uint256))) public tradeRecord;

    address private constant UniswapRouter = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address private constant UniswapFactory = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;

    IERC20 public tokenA;
    IERC20 public tokenB;

    uint256 private testVal;

    event AddLiquidity(address indexed tokenA,address tokenB,uint256 amountA, uint256 amountB);
    event RemoveLiquidity(address indexed tokenA,address tokenB,uint256 liquidity);

    function initUpgrade(uint256 _val) external {
        testVal = _val;
    }

    function addLiquidity(
        address _tokenA,
        address _tokenB,
        uint256 _amountA,
        uint256 _amountB
    )
    onlyOwner external
    {
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
        bool success = tokenA.transferFrom(msg.sender,address(this),_amountA);
        if (!success) revert TransferFailed();
        bool success1 = tokenB.transferFrom(msg.sender,address(this),_amountB);
        if (!success1) revert TransferFailed();

        IERC20(_tokenA).approve(UniswapRouter,_amountA);
        IERC20(_tokenB).approve(UniswapRouter,_amountB);

        IUniswapV2Router02(UniswapRouter).addLiquidity(
            _tokenA,
            _tokenB,
            _amountA,
            _amountB,
            1,
            1,
            address(this), // recipient address
            block.timestamp
        );
        emit AddLiquidity(_tokenA,_tokenB,_amountA,_amountB);
    }

    function removeLiquidity(address _tokenA,address _tokenB)
    onlyOwner external {
        address pairs= IUniswapV2Factory(UniswapFactory).getPair(_tokenA,_tokenB);

        uint256 liquidity = IERC20(pairs).balanceOf(address(this));
        IERC20(pairs).approve(UniswapRouter,liquidity);
        IUniswapV2Router02(UniswapRouter).removeLiquidity(
            _tokenA,
            _tokenB,
            liquidity,
            1,
            1,
            address(this),
            block.timestamp
        );
        emit RemoveLiquidity(_tokenA,_tokenB,liquidity);
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
        address owner = msg.sender;
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
