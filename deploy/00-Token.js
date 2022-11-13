const { getNamedAccounts, deployments,ethers, network} = require("hardhat");
const {verify} = require("../utils/verify");
const {developmentChains, BLOCK_CONFIRMATION} = require("../hardhat-helper");

module.exports = async function({getNamedAccounts,deployments}){
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : BLOCK_CONFIRMATION

    let name= "Aptos"
    let symbol = "apt"
    let initialSupply = ethers.utils.parseEther("100000");
    let args= [name,symbol,initialSupply]

    const token0 = await deploy("Aptos",{
        contract: "Token",
        from:deployer,
        log:true,
        args:args,
        blockConfirmations: waitBlockConfirmations
    })

    const token1 = await deploy("WETH",{
        contract: "Token",
        from:deployer,
        log:true,
        args:args,
        blockConfirmations: waitBlockConfirmations
    })

    log("Mocks Deployed!")
    log("----------------------------------------------------------")

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(token0.address, arguments)
        await verify(token1.address, arguments)
    }
}

module.exports.tags = ['all','token']