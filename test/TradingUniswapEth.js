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
const WETH = WETH9[1];
const TOKENS = [
    new Token(1, '0xEE2a03Aa6Dacf51C18679C516ad5283d8E7C2637', 9, "NEIRO", 'NEIRO'),
    new Token(1, '0x2E6a60492fB5b58F5b5D08c7cAFc75e740E6Dc8e', 9, "TSUJI", 'TSUJI'),
    new Token(1, '0xaaeE1A9723aaDB7afA2810263653A34bA2C21C7a', 18, "MOG", 'MOG'),
    new Token(1, '0x777BE1c6075c20184C4fd76344b7b0B7c858fe6B', 18, "BAR", 'BAR'),
    new Token(1, '0x3fFEea07a27Fab7ad1df5297fa75e77a43CB5790', 18, "PEIPEI", 'PEiPEI'),
    new Token(1, '0x72e4f9F808C49A2a61dE9C5896298920Dc4EEEa9', 18, "BITCOIN", 'BITCOIN'),
    new Token(1, '0xD29DA236dd4AAc627346e1bBa06A619E8c22d7C5', 9, "MAGA", 'MAGA'),
    new Token(1, '0x576e2BeD8F7b46D34016198911Cdf9886f78bea7', 9, "TRUMP", 'TRUMP'),
    new Token(1, '0x38E68A37E401F7271568CecaAc63c6B1e19130B4', 18, "BANANA", "BANANA"),
    new Token(1, '0xA35923162C49cF95e6BF26623385eb431ad920D3', 18, "TURBO", 'TURBO'),
    new Token(1, '0xEE2a03Aa6Dacf51C18679C516ad5283d8E7C2637', 9, "NEIRO", 'NEIRO'),
    new Token(1, '0x2E6a60492fB5b58F5b5D08c7cAFc75e740E6Dc8e', 9, "TSUJI", 'TSUJI'),
    new Token(1, '0xaaeE1A9723aaDB7afA2810263653A34bA2C21C7a', 18, "MOG", 'MOG'),
    new Token(1, '0x777BE1c6075c20184C4fd76344b7b0B7c858fe6B', 18, "BAR", 'BAR'),
    new Token(1, '0x3fFEea07a27Fab7ad1df5297fa75e77a43CB5790', 18, "PEIPEI", 'PEiPEI'),
    new Token(1, '0x72e4f9F808C49A2a61dE9C5896298920Dc4EEEa9', 18, "BITCOIN", 'BITCOIN'),
    new Token(1, '0xD29DA236dd4AAc627346e1bBa06A619E8c22d7C5', 9, "MAGA", 'MAGA'),
    new Token(1, '0x576e2BeD8F7b46D34016198911Cdf9886f78bea7', 9, "TRUMP", 'TRUMP'),
    new Token(1, '0x38E68A37E401F7271568CecaAc63c6B1e19130B4', 18, "BANANA", "BANANA"),
    new Token(1, '0xA35923162C49cF95e6BF26623385eb431ad920D3', 18, "TURBO", 'TURBO'),
    new Token(1, '0xEE2a03Aa6Dacf51C18679C516ad5283d8E7C2637', 9, "NEIRO", 'NEIRO'),
    new Token(1, '0x2E6a60492fB5b58F5b5D08c7cAFc75e740E6Dc8e', 9, "TSUJI", 'TSUJI'),
    new Token(1, '0xaaeE1A9723aaDB7afA2810263653A34bA2C21C7a', 18, "MOG", 'MOG'),
    new Token(1, '0x777BE1c6075c20184C4fd76344b7b0B7c858fe6B', 18, "BAR", 'BAR'),
    new Token(1, '0x3fFEea07a27Fab7ad1df5297fa75e77a43CB5790', 18, "PEIPEI", 'PEiPEI'),
    new Token(1, '0x72e4f9F808C49A2a61dE9C5896298920Dc4EEEa9', 18, "BITCOIN", 'BITCOIN'),
    new Token(1, '0xD29DA236dd4AAc627346e1bBa06A619E8c22d7C5', 9, "MAGA", 'MAGA'),
    new Token(1, '0x576e2BeD8F7b46D34016198911Cdf9886f78bea7', 9, "TRUMP", 'TRUMP'),
    new Token(1, '0x38E68A37E401F7271568CecaAc63c6B1e19130B4', 18, "BANANA", "BANANA"),
    new Token(1, '0xA35923162C49cF95e6BF26623385eb431ad920D3', 18, "TURBO", 'TURBO'),
    new Token(1, '0xEE2a03Aa6Dacf51C18679C516ad5283d8E7C2637', 9, "NEIRO", 'NEIRO'),
    new Token(1, '0x2E6a60492fB5b58F5b5D08c7cAFc75e740E6Dc8e', 9, "TSUJI", 'TSUJI'),
    new Token(1, '0xaaeE1A9723aaDB7afA2810263653A34bA2C21C7a', 18, "MOG", 'MOG'),
    new Token(1, '0x777BE1c6075c20184C4fd76344b7b0B7c858fe6B', 18, "BAR", 'BAR'),
    new Token(1, '0x3fFEea07a27Fab7ad1df5297fa75e77a43CB5790', 18, "PEIPEI", 'PEiPEI'),
    new Token(1, '0x72e4f9F808C49A2a61dE9C5896298920Dc4EEEa9', 18, "BITCOIN", 'BITCOIN'),
    new Token(1, '0xD29DA236dd4AAc627346e1bBa06A619E8c22d7C5', 9, "MAGA", 'MAGA'),
    new Token(1, '0x576e2BeD8F7b46D34016198911Cdf9886f78bea7', 9, "TRUMP", 'TRUMP'),
    new Token(1, '0x38E68A37E401F7271568CecaAc63c6B1e19130B4', 18, "BANANA", "BANANA"),
    new Token(1, '0xA35923162C49cF95e6BF26623385eb431ad920D3', 18, "TURBO", 'TURBO')
]

async function deployRouter() {
    await reset("https://eth-mainnet.g.alchemy.com/v2/xkIcuOrk0eDv9TaZxMXtkwptU91055bi", 20425360)
    // Contracts are deployed using the first signer/account by default
    const [owner, feeSink, user] = await ethers.getSigners();
    const Router = await ethers.getContractFactory('RouterUniswapEth')
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
describe("Trading Uniswap Eth", function () {
    it('executes swaps for each token in the list', async function(){
            const {
                router,
                owner,
                feeSink,
                user,
                tokens
            } = await loadFixture(deployRouter);
            for (let i=0; i<10;i++) {
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
        const quote = await getOptimalPath(router, await tokens[9].getAddress(), ethers.parseEther('10'), 0, 100)
        await sellNativeForToken(router, await tokens[9].getAddress(), ethers.parseEther('990'), 10000, user)
        await expect(sellNativeForTokenWithoutQuote(router, await tokens[9].getAddress(), ethers.parseEther('1'), 100, owner, quote)).revertedWithCustomError(router, 'V3TooLittleReceived()')
        }).timeout(10000000000000000000000000000000);
    it('should revert if slippage reached v2 on buy', async function(){
        const {
            router,
            owner,
            feeSink,
            user,
            tokens
        } = await loadFixture(deployRouter);
        const quote = await getOptimalPath(router, await tokens[0].getAddress(), ethers.parseEther('1'), 0, 10000)
        await sellNativeForToken(router, await tokens[0].getAddress(), ethers.parseEther('1'), 10000, user)
        await expect(sellNativeForTokenWithoutQuote(router, await tokens[0].getAddress(), ethers.parseEther('1'), 10000, owner, quote)).revertedWithCustomError(router, "V2TooLittleReceived()")
        }).timeout(10000000000000000000000000000000);
    it('should revert if slippage reached v3 on sell', async function(){
        const {
            router,
            owner,
            feeSink,
            user,
            tokens
        } = await loadFixture(deployRouter);
        await sellNativeForToken(router, await tokens[9].getAddress(), ethers.parseEther('500'), 10000, user)
        await sellNativeForToken(router, await tokens[9].getAddress(), ethers.parseEther('1'), 10000, owner)
        const balance1 = await tokens[9].balanceOf(await user.getAddress())
        const balance2 = await tokens[9].balanceOf(await owner.getAddress())
        const quote = await getOptimalPath(router, await tokens[9].getAddress(), balance2, 1, 10000)
        await sellTokenForNative(tokens[9], router, balance1, 1, user)
        await expect(sellTokenForNativeWithoutQuote(tokens[9], router, balance2, 10000, owner, quote)).revertedWithCustomError(router, 'V3TooLittleReceived()')
        }).timeout(10000000000000000000000000000000);
    it('should revert if slippage reached v2 on sell', async function(){
        const {
            router,
            owner,
            feeSink,
            user,
            tokens
        } = await loadFixture(deployRouter);
        await sellNativeForToken(router, await tokens[1].getAddress(), ethers.parseEther('5'), 10000, user)
        await sellNativeForToken(router, await tokens[1].getAddress(), ethers.parseEther('1'), 10000, owner)
        const balance1 = await tokens[1].balanceOf(await user.getAddress())
        const balance2 = await tokens[1].balanceOf(await owner.getAddress())
        const quote = await getOptimalPath(router, await tokens[1].getAddress(), balance2, 1, 10000)
        await sellTokenForNative(tokens[1], router, balance1, 10000, user)
        await expect(sellTokenForNativeWithoutQuote(tokens[1], router, balance2, 10000, owner, quote)).revertedWithCustomError(router, 'V2TooLittleReceived()')
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
        for (let i=0; i<8;i++) {
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
            await user.getAddress(), WETH.address, await tokens[0].getAddress(), ethers.parseEther('0.1'), 2861616887779n, 0, 0, 0
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
            await user.getAddress(), WETH.address, await tokens[0].getAddress(), ethers.parseEther('0.1'), 2861616887779n, 0, 0, 0
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
            await user.getAddress(), WETH.address, await tokens[0].getAddress(), ethers.parseEther('0.1'), 2833015702334n, 0, 0, ethers.parseEther('0.001')
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