const {developmentChains} = require("../hardhat-helper");
const {network, ethers, deployments, getNamedAccounts, upgrades} = require("hardhat");
const { expect } = require("chai")
const assert = require("assert");

!developmentChains.includes(network.name) ? describe.skip
    :describe("Test Swap",()=>{
        let contract, proxyContract

        beforeEach(async function(){
            await deployments.fixture(['all'])
            contract = await ethers.getContractFactory('Interaction');
            proxyContract = await upgrades.deployProxy(contract,[5],{initializer:'initUpgrade'})
            await proxyContract.deployed();
        })

        it('retrieve previous value',async ()=>{
            // since initialized as 5, so pass 5 here
            expect((await proxyContract.retrieveTestVal()).toString()).to.equal('5')
        })

        it('upgrade contract',async ()=>{
            const ContractV2 = await ethers.getContractFactory('InteractionV2')
            const contractV2 = await upgrades.upgradeProxy(proxyContract.address,ContractV2)
            await expect(contractV2.removeLiquidity('0x5FbDB2315678afecb367f032d93F642f64180aa3',
                    '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'))
                .to.be.revertedWith('Ownable: caller is not the owner')
        })
    })