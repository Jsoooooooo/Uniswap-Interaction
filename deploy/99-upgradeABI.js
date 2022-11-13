const { frontEndAbiFile } = require("../hardhat-helper");
const fs = require("fs");
const { ethers } = require("hardhat");

module.exports = async () => {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Writing to front end...")
        await updateAbi()
        console.log("Written ..........")
    }
}

async function updateAbi() {
    const contract = await ethers.getContractFactory('Interaction')
    fs.writeFileSync(frontEndAbiFile, contract.interface.format(ethers.utils.FormatTypes.json))
}

module.exports.tags = ["all", "frontend"]