const {developmentChains} = require("../hardhat-helper");
const {network, ethers, deployments, getNamedAccounts, artifacts} = require("hardhat");
const { expect } = require("chai")
const assert = require("assert");

const walletAddress = process.env.Owner || ''
// deploy at , otherwise error
!developmentChains.includes(network.name) ? describe.skip
    :describe("Test Swap",()=>{
        // address of tokenOut
        const AMOUNT_IN = 100000;
        let deployer,Aptos,WETH,contract

        beforeEach(async function(){
            const accounts = await ethers.getSigners()
            deployer = accounts[0];
            await deployments.fixture(["all"])
            contract = await ethers.getContractAt("Interaction",'0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0');
            Aptos = await ethers.getContractAt('Token','0x5FbDB2315678afecb367f032d93F642f64180aa3');
            WETH = await ethers.getContractAt('Token','0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512');
        })

        it("trade",async ()=>{
            await expect(
                contract.trade(
                    Aptos.address,
                    WETH.address,
                    AMOUNT_IN,
                    1,
                    {from:deployer.address}
                )).to.be.revertedWith('Ownable: caller is not the owner')
        })
    })
// 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