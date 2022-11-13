require("@nomicfoundation/hardhat-chai-matchers");
require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("solidity-coverage");
require("hardhat-gas-reporter");
require('@openzeppelin/hardhat-upgrades');
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */

const GOERLI_URL = process.env.GOERLI_RPC || ''
const GOERLI_PRIVATE = process.env.GOERLI_PRIVATE_KEY || ''
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

module.exports = {
  solidity: {
    compilers:[
      {version:"0.8.4"},
      {version:"0.8.0"},
    ]
  },
  defaultNetwork:'hardhat',
  networks:{
    // 必须指定url和accounts
    goerli:{
      url : GOERLI_URL,
      accounts: [`0x${GOERLI_PRIVATE}`],
      chainId:5,
      blockConfirmations:2,
    },
    hardhat:{
      chainId:31337,
      forking: {
        url: GOERLI_URL,
        enabled:false,
        blockNumber:15960757,
      }
    },
  },
  namedAccounts:{
    deployer:{
      default: 0, // here this will by default, the first account as deployer
      1: 0,
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    // coinmarketcap: COINMARKETCAP_API_KEY,
  },
  mocha: {
    timeout: 200000, // 100 seconds max for running tests
  },
};
