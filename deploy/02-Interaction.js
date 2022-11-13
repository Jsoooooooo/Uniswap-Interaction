const { getNamedAccounts, deployments,ethers, network, upgrades} = require("hardhat");
const {verify} = require("../utils/verify");
const {developmentChains, BLOCK_CONFIRMATION} = require("../hardhat-helper");

module.exports = async function({getNamedAccounts,deployments}){
    const { deployer } = await getNamedAccounts()
    const {log,deploy} = deployments

    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : BLOCK_CONFIRMATION

    const interaction = await deploy("Interaction",{
        from:deployer,
        log:true,
        arg:[],
        blockConfirmations: waitBlockConfirmations,
    })

    const contract = await ethers.getContractFactory('Interaction')
    const proxy = await upgrades.deployProxy(contract,[5],{initializer:'initUpgrade'})
    await proxy.deployed();
    const contractV2 = await ethers.getContractFactory("InteractionV2");
    const upgraded = await upgrades.upgradeProxy(proxy.address, contractV2);
    console.log(upgraded.address)

    log("upgrades Deployed!")
    log("----------------------------------------------------------")

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(interaction.address, arguments)
    }
}

module.exports.tags = ['all','interaction']