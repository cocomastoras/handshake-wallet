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
const WETH = WETH9[42161];
const TOKENS = [
    new Token(42161, '0xbFd5206962267c7b4b4A8B3D76AC2E1b2A5c4d5e', 18, "OSAK", "OSAK"),
    new Token(42161, '0x6985884C4392D348587B19cb9eAAf157F13271cd', 9, "ZRO", 'ZRO'),
    new Token(42161, '0x0c880f6761F1af8d9Aa9C466984b80DAb9a8c9e8', 18, "PENDLE", 'PENDLE'),
    new Token(42161, '0x11e969e9B3f89cB16D686a03Cd8508C9fC0361AF', 6, "LAVA", 'LAVA'),
    new Token(42161, '0x2C650dAb03A59332e2E0C0C4A7F726913e5028C1', 18, "TAP", 'TAP'),
    new Token(42161, '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4', 18, "LINK", 'LINK'),
    new Token(42161, '0x289ba1701C2F088cf0faf8B3705246331cB8A839', 18, "LPT", 'LPT'),
    new Token(42161, '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a', 18, "GMX", 'GMX'),
    new Token(42161, '0x3082CC23568eA640225c2467653dB90e9250AaA0', 18, "Radiant", 'RDNT'),
    new Token(42161, '0x6985884C4392D348587B19cb9eAAf157F13271cd', 9, "ZRO", 'ZRO'),
    new Token(42161, '0x0c880f6761F1af8d9Aa9C466984b80DAb9a8c9e8', 18, "PENDLE", 'PENDLE'),
    new Token(42161, '0x0CAAdd427A6Feb5B5Fc1137eB05aA7Ddd9c08ce9', 18, "VEE", 'VEE'),
    new Token(42161, '0x11e969e9B3f89cB16D686a03Cd8508C9fC0361AF', 6, "LAVA", 'LAVA'),
    new Token(42161, '0x2C650dAb03A59332e2E0C0C4A7F726913e5028C1', 18, "TAP", 'TAP'),
    new Token(42161, '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4', 18, "LINK", 'LINK'),
    new Token(42161, '0x289ba1701C2F088cf0faf8B3705246331cB8A839', 18, "LPT", 'LPT'),
    new Token(42161, '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a', 18, "GMX", 'GMX'),
    new Token(42161, '0x3082CC23568eA640225c2467653dB90e9250AaA0', 18, "Radiant", 'RDNT'),
    new Token(42161, '0x6985884C4392D348587B19cb9eAAf157F13271cd', 9, "ZRO", 'ZRO'),
    new Token(42161, '0x0c880f6761F1af8d9Aa9C466984b80DAb9a8c9e8', 18, "PENDLE", 'PENDLE'),
    new Token(42161, '0x11e969e9B3f89cB16D686a03Cd8508C9fC0361AF', 6, "LAVA", 'LAVA'),
    new Token(42161, '0x2C650dAb03A59332e2E0C0C4A7F726913e5028C1', 18, "TAP", 'TAP'),
    new Token(42161, '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4', 18, "LINK", 'LINK'),
    new Token(42161, '0x289ba1701C2F088cf0faf8B3705246331cB8A839', 18, "LPT", 'LPT'),
    new Token(42161, '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a', 18, "GMX", 'GMX'),
    new Token(42161, '0x3082CC23568eA640225c2467653dB90e9250AaA0', 18, "Radiant", 'RDNT'),
    new Token(42161, '0x6985884C4392D348587B19cb9eAAf157F13271cd', 9, "ZRO", 'ZRO'),
    new Token(42161, '0x0c880f6761F1af8d9Aa9C466984b80DAb9a8c9e8', 18, "PENDLE", 'PENDLE'),
    new Token(42161, '0x11e969e9B3f89cB16D686a03Cd8508C9fC0361AF', 6, "LAVA", 'LAVA'),
    new Token(42161, '0x2C650dAb03A59332e2E0C0C4A7F726913e5028C1', 18, "TAP", 'TAP'),
    new Token(42161, '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4', 18, "LINK", 'LINK'),
    new Token(42161, '0x289ba1701C2F088cf0faf8B3705246331cB8A839', 18, "LPT", 'LPT'),
    new Token(42161, '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a', 18, "GMX", 'GMX'),
    new Token(42161, '0x3082CC23568eA640225c2467653dB90e9250AaA0', 18, "Radiant", 'RDNT')
]

async function deployRouter() {
    await reset("https://arb-mainnet.g.alchemy.com/v2/Ekq9jAaF-0a3TmfNgSnvm_cLSHl-2OKE", 237915850)
    // Contracts are deployed using the first signer/account by default
    const [owner, feeSink, user] = await ethers.getSigners();
    const Router = await ethers.getContractFactory('RouterUniswapArb')
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
describe("Trading Uniswap Arb", function () {
    it('executes swaps for each token in the list', async function(){
            const {
                router,
                owner,
                feeSink,
                user,
                tokens
            } = await loadFixture(deployRouter);
            for (let i=0; i<8;i++) {
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
        await sellNativeForToken(router, await tokens[0].getAddress(), ethers.parseEther('500'), 10000, user)
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
        const quote = await getOptimalPath(router, await tokens[11].getAddress(), ethers.parseEther('10'), 0, 10)
        // await sellNativeForToken(router, await tokens[0].getAddress(), ethers.parseEther('1'), 10000, user)
        await expect(sellNativeForTokenWithoutQuote(router, await tokens[11].getAddress(), ethers.parseEther('1'), 10, owner, quote)).revertedWithCustomError(router, "V2TooLittleReceived()")
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
        const quote = await getOptimalPath(router, await tokens[0].getAddress(), balance2, 1, 10000)
        await sellTokenForNative(tokens[0], router, balance1, 1, user)
        await expect(sellTokenForNativeWithoutQuote(tokens[0], router, balance2, 10000, owner, quote)).revertedWithCustomError(router, 'V3TooLittleReceived()')
        }).timeout(10000000000000000000000000000000);
    it('should revert if slippage reached v2 on sell', async function(){
        const {
            router,
            owner,
            feeSink,
            user,
            tokens
        } = await loadFixture(deployRouter);
        await sellNativeForToken(router, await tokens[11].getAddress(), ethers.parseEther('5'), 10000, user)
        await sellNativeForToken(router, await tokens[11].getAddress(), ethers.parseEther('1'), 10000, owner)
        const balance1 = await tokens[11].balanceOf(await user.getAddress())
        const balance2 = await tokens[11].balanceOf(await owner.getAddress())
        const quote = await getOptimalPath(router, await tokens[14].getAddress(), balance2, 1, 10000)
        await sellTokenForNative(tokens[11], router, balance1, 10000, user)
        await expect(sellTokenForNativeWithoutQuote(tokens[11], router, balance2, 10000, owner, quote)).revertedWithCustomError(router, 'V2TooLittleReceived()')
        }).timeout(10000000000000000000000000000000);
    it('should revert if not valid version passed on buy', async function(){
        const {
            router,
            owner,
            feeSink,
            user,
            tokens
        } = await loadFixture(deployRouter);
        await expect(sellNativeForTokenMalformedVersion(router, await tokens[0].getAddress(), ethers.parseEther('5'), 10000, user)).revertedWithCustomError(router, 'InvalidVersion()')
        }).timeout(10000000000000000000000000000000);
    it('should revert if not valid version passed on sell', async function(){
        const {
            router,
            owner,
            feeSink,
            user,
            tokens
        } = await loadFixture(deployRouter);
        await sellNativeForToken(router, await tokens[0].getAddress(), ethers.parseEther('5'), 10000, user)
        const balance = await tokens[0].balanceOf(await user.getAddress())
        await expect(sellTokenForNativeMalformedVersion(tokens[0], router, balance, 10000, user)).revertedWithCustomError(router, 'InvalidVersion()')
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
        for (let i=0; i<2;i++) {
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
            await user.getAddress(), WETH.address, await tokens[0].getAddress(), ethers.parseEther('0.1'), 1183206545502194306737541690n, 10000, 1, 0
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
            await user.getAddress(), WETH.address, await tokens[0].getAddress(), ethers.parseEther('0.1'), 1183206545502194306737541690n, 10000, 1, 0
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
            await user.getAddress(), WETH.address, await tokens[0].getAddress(), ethers.parseEther('0.1'), 1171381842739609008958366237n, 10000, 1, ethers.parseEther('0.001')
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