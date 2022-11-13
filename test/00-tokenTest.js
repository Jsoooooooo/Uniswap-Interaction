const {developmentChains} = require("../hardhat-helper");
const {network, ethers, deployments, getNamedAccounts} = require("hardhat");
const assert = require("assert");

!developmentChains.includes(network.name) ? describe.skip
    :describe("Test MintToken",()=>{
        let deployer,Token
        beforeEach(async function(){
            const accounts = await ethers.getSigners()
            deployer = accounts[0]
            await deployments.fixture(['all'])
            Token = await ethers.getContractAt("Token",'0x5FbDB2315678afecb367f032d93F642f64180aa3')
        })
        it("sets name and symbol",async ()=>{
            const name = (await Token.name()).toString()
            const symbol = (await Token.symbol()).toString()
            assert.equal(name,'Aptos')
            assert.equal(symbol,'apt')
        })
    })