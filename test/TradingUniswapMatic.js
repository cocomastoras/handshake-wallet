const {
  time,
  loadFixture, reset
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const hre = require('hardhat');
const { ethers } = hre;
const { Currency, Token, WETH9 } = require('@uniswap/sdk-core');
const TOKEN_ABI = [
    {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_spender",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_from",
                "type": "address"
            },
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "name": "",
                "type": "uint8"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "name": "balance",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            },
            {
                "name": "_spender",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "payable": true,
        "stateMutability": "payable",
        "type": "fallback"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "spender",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    }
]
const ERROR_ABI = [
	{
		"inputs": [],
		"name": "V2TooLittleReceived",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "V3TooLittleReceived",
		"type": "error"
	}
]
const WETH = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270';
const TOKENS = [
    new Token(139, '0xA3f751662e282E83EC3cBc387d225Ca56dD63D3A', 18, "APEPE", 'APEPE'),
    new Token(139, '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39', 18, "LINK", 'LINK'),
    new Token(139, '0xD6DF932A45C0f255f85145f286eA0b292B21C90B', 18, "AAVE", 'AAVE'),
    new Token(139, '0x61299774020dA444Af134c82fa83E3810b309991', 18, "RNDR", 'RNDR'),
    new Token(139, '0xfb7f8A2C0526D01BFB00192781B7a7761841B16C', 18, "LRT", 'LRT'),
    new Token(139, '0x111111517e4929D3dcbdfa7CCe55d30d4B6BC4d6', 18, "ICHI", 'ICHI'),
    new Token(139, '0x838C9634dE6590B96aEadC4Bc6DB5c28Fd17E3C2', 9, "FIRE", 'FIRE'),
    new Token(139, '0x8bC3eC2E7973E64be582a90b08caDd13457160fE', 9, "PT", 'PT'),
    new Token(139, '0xA3f751662e282E83EC3cBc387d225Ca56dD63D3A', 18, "APEPE", 'APEPE'),
    new Token(139, '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39', 18, "LINK", 'LINK'),
    new Token(139, '0xD6DF932A45C0f255f85145f286eA0b292B21C90B', 18, "AAVE", 'AAVE'),
    new Token(139, '0x692AC1e363ae34b6B489148152b12e2785a3d8d6', 18, "TRADE", 'TRADE'),
    new Token(139, '0x61299774020dA444Af134c82fa83E3810b309991', 18, "RNDR", 'RNDR'),
    new Token(139, '0xfb7f8A2C0526D01BFB00192781B7a7761841B16C', 18, "LRT", 'LRT'),
    new Token(139, '0x111111517e4929D3dcbdfa7CCe55d30d4B6BC4d6', 18, "ICHI", 'ICHI'),
    new Token(139, '0x838C9634dE6590B96aEadC4Bc6DB5c28Fd17E3C2', 9, "FIRE", 'FIRE'),
    new Token(139, '0xA3f751662e282E83EC3cBc387d225Ca56dD63D3A', 18, "APEPE", 'APEPE'),
    new Token(139, '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39', 18, "LINK", 'LINK'),
    new Token(139, '0xD6DF932A45C0f255f85145f286eA0b292B21C90B', 18, "AAVE", 'AAVE'),
    new Token(139, '0x692AC1e363ae34b6B489148152b12e2785a3d8d6', 18, "TRADE", 'TRADE'),
    new Token(139, '0x61299774020dA444Af134c82fa83E3810b309991', 18, "RNDR", 'RNDR'),
    new Token(139, '0xfb7f8A2C0526D01BFB00192781B7a7761841B16C', 18, "LRT", 'LRT'),
    new Token(139, '0x111111517e4929D3dcbdfa7CCe55d30d4B6BC4d6', 18, "ICHI", 'ICHI'),
    new Token(139, '0x838C9634dE6590B96aEadC4Bc6DB5c28Fd17E3C2', 9, "FIRE", 'FIRE'),
    new Token(139, '0xA3f751662e282E83EC3cBc387d225Ca56dD63D3A', 18, "APEPE", 'APEPE'),
    new Token(139, '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39', 18, "LINK", 'LINK'),
    new Token(139, '0xD6DF932A45C0f255f85145f286eA0b292B21C90B', 18, "AAVE", 'AAVE'),
    new Token(139, '0x692AC1e363ae34b6B489148152b12e2785a3d8d6', 18, "TRADE", 'TRADE'),
    new Token(139, '0x61299774020dA444Af134c82fa83E3810b309991', 18, "RNDR", 'RNDR'),
    new Token(139, '0xfb7f8A2C0526D01BFB00192781B7a7761841B16C', 18, "LRT", 'LRT'),
    new Token(139, '0x111111517e4929D3dcbdfa7CCe55d30d4B6BC4d6', 18, "ICHI", 'ICHI'),
    new Token(139, '0x838C9634dE6590B96aEadC4Bc6DB5c28Fd17E3C2', 9, "FIRE", 'FIRE'),
    new Token(139, '0xA3f751662e282E83EC3cBc387d225Ca56dD63D3A', 18, "APEPE", 'APEPE'),
    new Token(139, '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39', 18, "LINK", 'LINK'),
    new Token(139, '0xD6DF932A45C0f255f85145f286eA0b292B21C90B', 18, "AAVE", 'AAVE'),
    new Token(139, '0x692AC1e363ae34b6B489148152b12e2785a3d8d6', 18, "TRADE", 'TRADE'),
    new Token(139, '0x61299774020dA444Af134c82fa83E3810b309991', 18, "RNDR", 'RNDR'),
    new Token(139, '0xfb7f8A2C0526D01BFB00192781B7a7761841B16C', 18, "LRT", 'LRT'),
    new Token(139, '0x111111517e4929D3dcbdfa7CCe55d30d4B6BC4d6', 18, "ICHI", 'ICHI'),
    new Token(139, '0x838C9634dE6590B96aEadC4Bc6DB5c28Fd17E3C2', 9, "FIRE", 'FIRE')
]

async function deployRouter() {
    await reset("https://polygon-mainnet.g.alchemy.com/v2/xkIcuOrk0eDv9TaZxMXtkwptU91055bi", 60021575)
    // Contracts are deployed using the first signer/account by default
    const [owner, feeSink, user] = await ethers.getSigners();
    const Router = await ethers.getContractFactory('RouterUniswapPol')
    const router = await Router.connect(owner).deploy(await owner.getAddress(), await  feeSink.getAddress(), 10000, 10000)
    const tokens = TOKENS.map(tk => {
        return new ethers.Contract(tk.address, TOKEN_ABI, owner)
    })
    return {router, owner, feeSink, user, tokens};
}
async function getOptimalPath(routerContract, tokenAddress, amountIn, flag, slippage) {
  if (flag === 0) {
    return await routerContract.getOptimalPathBuy.staticCall(tokenAddress, amountIn, slippage).catch({})
  } else {
    return await routerContract.getOptimalPathSell.staticCall(tokenAddress, amountIn, slippage).catch({})
  }
}
async function sellNativeForToken(routerContract, token, amountIn, slippage, account){
    const quote = await getOptimalPath(routerContract, token, amountIn, 0, slippage)
    let commands = ''
    if(quote[0] === 0n) {
      commands = '0x0b08'
    } else {
      commands = '0x0b00'
    }
    console.log(quote)
    const signer = routerContract.connect(account)
    const txn = await signer.sellNativeForToken(token, quote[1], quote[0], quote[2], commands, {value: amountIn})
    const rsp = await txn.wait();
    return rsp['hash']
}
async function sellNativeForTokenReturnTxn(routerContract, token, amountIn, slippage, account){
    const quote = await getOptimalPath(routerContract, token, amountIn, 0, slippage)
    let commands = ''
    if(quote[0] === 0n) {
      commands = '0x0b08'
    } else {
      commands = '0x0b00'
    }
    const signer = routerContract.connect(account)
    return await signer.sellNativeForToken(token, quote[1], quote[0], quote[2], commands, {value: amountIn})
}
async function sellNativeForTokenWithoutQuote(routerContract, token, amountIn, slippage, account, quote){
    let commands = ''
    if(quote[0] === 0n) {
      commands = '0x0b08'
    } else {
      commands = '0x0b00'
    }
    const signer = routerContract.connect(account)
    const txn = await signer.sellNativeForToken(token, quote[1], quote[0], quote[2], commands, {value: amountIn})
    const rsp = await txn.wait();
    return rsp['hash']
}
async function sellNativeForTokenMalformedVersion(routerContract, token, amountIn, slippage, account){
    const quote = await getOptimalPath(routerContract, token, amountIn, 0, slippage)
    let commands = ''
    if(quote[0] === 0n) {
      commands = '0x0b08'
    } else {
      commands = '0x0b00'
    }
    const signer = routerContract.connect(account)
    const txn = await signer.sellNativeForToken(token, quote[1], 2, quote[2], commands, {value: amountIn})
    const rsp = await txn.wait();
    return rsp['hash']
}
async function sellTokenForNative(tokenContract, routerContract, amountIn, slippage, account){
    let signer = tokenContract.connect(account)
    const appTxn = await signer.approve(await routerContract.getAddress(), amountIn)
    await appTxn.wait()
    const quote = await getOptimalPath(routerContract, await tokenContract.getAddress(), amountIn, 1, slippage)
    let commands = '';
    if(quote[0] === 0n) {
      commands = '0x08'
    } else {
      commands = '0x00'
    }
    console.log(quote)
    signer = routerContract.connect(account)
    const txn = await signer.sellTokenForNative(await tokenContract.getAddress(), amountIn, quote[1], quote[0], quote[2], commands)
    const rsp = await txn.wait();
    return rsp['hash']
}
async function sellTokenForNativeWithoutQuote(tokenContract, routerContract, amountIn, slippage, account, quote){
    let signer = tokenContract.connect(account)
    const appTxn = await signer.approve(await routerContract.getAddress(), amountIn)
    await appTxn.wait()
    let commands = '';
    if(quote[0] === 0n) {
      commands = '0x08'
    } else {
      commands = '0x00'
    }
    signer = routerContract.connect(account)
    const txn = await signer.sellTokenForNative(await tokenContract.getAddress(), amountIn, quote[1], quote[0], quote[2], commands)
    const rsp = await txn.wait();
    return rsp['hash']
}
async function sellTokenForNativeMalformedVersion(tokenContract, routerContract, amountIn, slippage, account){
    let signer = tokenContract.connect(account)
    const appTxn = await signer.approve(await routerContract.getAddress(), amountIn)
    await appTxn.wait()
    const quote = await getOptimalPath(routerContract, await tokenContract.getAddress(), amountIn, 1, slippage)
    let commands = '';
    if(quote[0] === 0n) {
      commands = '0x08'
    } else {
      commands = '0x00'
    }
    signer = routerContract.connect(account)
    const txn = await signer.sellTokenForNative(await tokenContract.getAddress(), amountIn, quote[1], 2, quote[2], commands)
    const rsp = await txn.wait();
    return rsp['hash']
}
describe("Trading Uniswap Matic", function () {
    it('executes swaps for each token in the list', async function(){
            const {
                router,
                owner,
                feeSink,
                user,
                tokens
            } = await loadFixture(deployRouter);
            for (let i=0; i<5;i++) {
                console.log(i)
                const buyTxn = await sellNativeForToken(router, await tokens[i].getAddress(), ethers.parseEther('1'), 100000, user)
                const balance = await tokens[i].balanceOf(await user.getAddress())
                const sellTxn = await sellTokenForNative(tokens[i], router, balance, 100000, user)
            }
        }).timeout(10000000000000000000000000000000);
    it('should revert if slippage reached v3 on buy', async function(){
        const {
            router,
            owner,
            feeSink,
            user,
            tokens
        } = await loadFixture(deployRouter);
        const quote = await getOptimalPath(router, await tokens[0].getAddress(), ethers.parseEther('10'), 0, 10000)
        // await sellNativeForToken(router, await tokens[0].getAddress(), ethers.parseEther('500'), 10000, user)
        await expect(sellNativeForTokenWithoutQuote(router, await tokens[0].getAddress(), ethers.parseEther('1'), 10000, owner, quote)).revertedWithCustomError(router, 'V3TooLittleReceived()')
        }).timeout(10000000000000000000000000000000);
    it('should revert if slippage reached v2 on buy', async function(){
        const {
            router,
            owner,
            feeSink,
            user,
            tokens
        } = await loadFixture(deployRouter);
        const quote = await getOptimalPath(router, await tokens[7].getAddress(), ethers.parseEther('10'), 0, 10000)
        await expect(sellNativeForTokenWithoutQuote(router, await tokens[7].getAddress(), ethers.parseEther('1'), 10000, owner, quote)).revertedWithCustomError(router, "V2TooLittleReceived()")
        }).timeout(10000000000000000000000000000000);
    it('should revert if slippage reached v3 on sell', async function(){
        const {
            router,
            owner,
            feeSink,
            user,
            tokens
        } = await loadFixture(deployRouter);
        await sellNativeForToken(router, await tokens[0].getAddress(), ethers.parseEther('500'), 10000, user)
        await sellNativeForToken(router, await tokens[0].getAddress(), ethers.parseEther('1'), 10000, owner)
        const balance1 = await tokens[0].balanceOf(await user.getAddress())
        const balance2 = await tokens[0].balanceOf(await owner.getAddress())
        const quote = await getOptimalPath(router, await tokens[0].getAddress(), 2n*balance2, 1, 10000)
        await sellTokenForNative(tokens[0], router, balance1, 1, user)
        await expect(sellTokenForNativeWithoutQuote(tokens[0], router, balance2, 100, owner, quote)).revertedWithCustomError(router, 'V3TooLittleReceived()')
        }).timeout(10000000000000000000000000000000);
    it('should revert if slippage reached v2 on sell', async function(){
        const {
            router,
            owner,
            feeSink,
            user,
            tokens
        } = await loadFixture(deployRouter);
        await sellNativeForToken(router, await tokens[7].getAddress(), ethers.parseEther('1'), 100000, owner)
        const balance2 = await tokens[7].balanceOf(await owner.getAddress())
        const quote = await getOptimalPath(router, await tokens[7].getAddress(), 4n*balance2, 1, 10000)
        await expect(sellTokenForNativeWithoutQuote(tokens[7], router, balance2, 10000, owner, quote)).revertedWithCustomError(router, 'V2TooLittleReceived()')
        }).timeout(10000000000000000000000000000000);
    it('should revert if not valid version passed on buy', async function(){
        const {
            router,
            owner,
            feeSink,
            user,
            tokens
        } = await loadFixture(deployRouter);
        await expect(sellNativeForTokenMalformedVersion(router, await tokens[14].getAddress(), ethers.parseEther('5'), 10000, user)).revertedWithCustomError(router, 'InvalidVersion()')
        }).timeout(10000000000000000000000000000000);
    it('should revert if not valid version passed on sell', async function(){
        const {
            router,
            owner,
            feeSink,
            user,
            tokens
        } = await loadFixture(deployRouter);
        await sellNativeForToken(router, await tokens[14].getAddress(), ethers.parseEther('5'), 10000, user)
        const balance = await tokens[14].balanceOf(await user.getAddress())
        await expect(sellTokenForNativeMalformedVersion(tokens[14], router, balance, 10000, user)).revertedWithCustomError(router, 'InvalidVersion()')
        }).timeout(10000000000000000000000000000000);
    it('returns info for a bunch of tokens', async function(){
        const {
            router,
            owner,
            feeSink,
            user,
            tokens
        } = await loadFixture(deployRouter);
        const addresses = TOKENS.map(token => {return token.address})
        await router.fetchTokensInfo(addresses)
    }).timeout(10000000000000000000000000000000);
    it('returns info for a single token', async function(){
        const {
            router,
            owner,
            feeSink,
            user,
            tokens
        } = await loadFixture(deployRouter);
        const address = TOKENS[0].address
        await router.fetchTokenInfo(address)
    }).timeout(10000000000000000000000000000000);
    it('sends contract balance to fee sink', async function(){
        const {
            router,
            owner,
            feeSink,
            user,
            tokens
        } = await loadFixture(deployRouter);
        for (let i=0; i<3;i++) {
            const buyTxn = await sellNativeForToken(router, await tokens[i].getAddress(), ethers.parseEther('1'), 100000, user)
            const balance = await tokens[i].balanceOf(await user.getAddress())
            const sellTxn = await sellTokenForNative(tokens[i], router, balance, 100000, user)
        }
        const balancePre = await ethers.provider.getBalance(await feeSink.getAddress())
        await router.withdrawFees()
        const balanceAfter = await ethers.provider.getBalance(await feeSink.getAddress())
        expect(balanceAfter > balancePre)
    }).timeout(10000000000000000000000000000000);
    it('should have 0 trading fees if token is whitelisted', async function(){
        const {
            router,
            owner,
            feeSink,
            user,
            tokens
        } = await loadFixture(deployRouter);
        await router.addToTokenAllowlist([await tokens[0].getAddress()])
        await expect(sellNativeForTokenReturnTxn(router, await tokens[0].getAddress(), ethers.parseEther('0.1'), 100000, user)).to.emit(
            router, "SwapExecuted"
        ).withArgs(
            await user.getAddress(), WETH, await tokens[0].getAddress(), ethers.parseEther('0.1'), 17074172070366187920010n, 100, 1, 0
        )
    }).timeout(10000000000000000000000000000000);
    it('should have 0 trading fees if user is whitelisted', async function(){
        const {
            router,
            owner,
            feeSink,
            user,
            tokens
        } = await loadFixture(deployRouter);
        await router.addToAllowlist([await user.getAddress()])
        await expect(sellNativeForTokenReturnTxn(router, await tokens[0].getAddress(), ethers.parseEther('0.1'), 100000, user)).to.emit(
            router, "SwapExecuted"
        ).withArgs(
            await user.getAddress(), WETH, await tokens[0].getAddress(), ethers.parseEther('0.1'), 17074172070366187920010n, 100, 1, 0
        )
    }).timeout(10000000000000000000000000000000);
    it('should have trading fees if token is not whitelisted', async function(){
        const {
            router,
            owner,
            feeSink,
            user,
            tokens
        } = await loadFixture(deployRouter);
        await expect(sellNativeForTokenReturnTxn(router, await tokens[0].getAddress(), ethers.parseEther('0.1'), 100000, user)).to.emit(
            router, "SwapExecuted"
        ).withArgs(
            await user.getAddress(), WETH, await tokens[0].getAddress(), ethers.parseEther('0.1'), 16903430439573112220623n, 100, 1, ethers.parseEther('0.001')
        )
    }).timeout(10000000000000000000000000000000);
    it('should revert if contract frozen', async function(){
        const {
            router,
            owner,
            feeSink,
            user,
            tokens
        } = await loadFixture(deployRouter);
        await router.freezeContract()
        await expect(sellNativeForTokenReturnTxn(router, await tokens[0].getAddress(), ethers.parseEther('1'), 100000, user)).revertedWith('CF')
    }).timeout(10000000000000000000000000000000);
    it('should revert if user denylisted', async function(){
        const {
            router,
            owner,
            feeSink,
            user,
            tokens
        } = await loadFixture(deployRouter);
        await router.addToDenylist([await user.getAddress()])
        await expect(sellNativeForTokenReturnTxn(router, await tokens[0].getAddress(), ethers.parseEther('1'), 100000, user)).revertedWith('DL')
    }).timeout(10000000000000000000000000000000);
    it('sends contract token balance to fee sink', async function(){
        const {
            router,
            owner,
            feeSink,
            user,
            tokens
        } = await loadFixture(deployRouter);
        const buyTxn = await sellNativeForToken(router, await tokens[0].getAddress(), ethers.parseEther('1'), 100000, user)
        const balance = await tokens[0].balanceOf(await user.getAddress())
        await tokens[0].connect(user).transfer(await router.getAddress(), balance)
        await router.withdrawToken([await tokens[0].getAddress()])
        expect(await tokens[0].balanceOf(await feeSink.getAddress())).eq(balance)
    }).timeout(10000000000000000000000000000000);
});