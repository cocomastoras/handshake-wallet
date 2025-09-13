const {
  time,
  loadFixture, reset
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const hre = require('hardhat');
const { ethers } = hre;

async function deployHandler() {
    await reset("https://polygon-mainnet.g.alchemy.com/v2/xkIcuOrk0eDv9TaZxMXtkwptU91055bi", 63468942)
    // Contracts are deployed using the first signer/account by default
    const [owner, feeSink, user] = await ethers.getSigners();
    const Router = await ethers.getContractFactory('RouterUniswapPol')
    const router = await Router.connect(owner).deploy(await owner.getAddress(), await  feeSink.getAddress(), 10000, 10000)
    const ErrorHand = await ethers.getContractFactory('FetchErrorErc20')
    const errorHand = await ErrorHand.connect(owner).deploy()
    return {errorHand, router};
}

describe("Test error contracts", function () {
    it('should work ', async function(){
            const {
                errorHand,
                router
            } = await loadFixture(deployHandler);
            const tokens = ['0xD1E17DD9404674C0AEC7747Ef000902a4D80350a']
        for(let i =0;i<tokens.length;i++){
            try{
                await router.fetchTokenInfo(tokens[i])
            } catch (e) {
                console.log(tokens[i], e)
            }
        }
    }).timeout(10000000000000000000000000000000);
});