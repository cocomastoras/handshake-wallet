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
const WETH = WETH9[56];
const TOKENS = [
    new Token(56, '0x59F4F336Bf3D0C49dBfbA4A74eBD2a6aCE40539A', 9, "CAT", 'Catcoin'),
    new Token(56, '0x3419875B4D3Bca7F3FddA2dB7a476A79fD31B4fE', 18, "DZHV", 'DizzyHavoc'),
    new Token(56, '0xDC8C8221B8e27DFDA87A6D56DC5899A65087b6f4', 18, "FLOKITA", 'FLOKITA'),
    new Token(56, '0x4615C8E2db74517a34712C9BdEA5C418D999014B', 9, "GROKCAT", 'GROK CAT'),
    new Token(56, '0x2dDb89a10Bf2020d8CaE7C5d239b6F38bE9d91D9', 18, "SHOKI", 'Shoki'),
    new Token(56, '0x0DceE5F694E492F0DD842a7FBE5BEd4C6E4665a6', 18, "CATBOY", 'CATBOY'),
    new Token(56, '0xBb2826Ab03B6321E170F0558804F2B6488C98775', 9, "BabyBonk", 'Baby bonk'),
    new Token(56, '0x57B478bbd84eCD5D2F1a98f3D556e1fB2d51dcE1', 18, "PAPE", 'PanicApeToken'),
    new Token(56, '0xf48f91df403976060cC05dBbf8A0901b09fdeFd4', 18, "MINU", 'Minu'),
    new Token(56, '0x2528A195D09EEA15e07BB9CbbcE62BedBb5eF721', 18, "DGW", 'DegenWin'),
    new Token(56, '0x9D6dB6382444b70a51307A4291188f60D4EEF205', 9, "BabyPepe", 'Baby Pepe'),
    new Token(56, '0xa587Fb0e8bcF14d95aCA76ab7111cDc79bF2397B', 18, "MIDA", 'Midareum'),
    new Token(56, '0x9eC02756A559700d8D9e79ECe56809f7bcC5dC27', 18, "WHY", 'why'),
    new Token(56, '0x9eC02756A559700d8D9e79ECe56809f7bcC5dC27', 18, "WKC", 'WIKI CAT'),
]
const url = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';
const options = {
  method: 'GET',
  headers: {accept: 'application/json', 'x-cg-demo-api-key': 'CG-CDeBYrThehZqE9FiU5maABYz'}
};

async function deployRouter() {
    // 37912040
    await reset("https://bnb-mainnet.g.alchemy.com/v2/xkIcuOrk0eDv9TaZxMXtkwptU91055bi", 37912040)

    // Contracts are deployed using the first signer/account by default
    const [owner, feeSink, user] = await ethers.getSigners();
    const Router = await ethers.getContractFactory('RouterPancake')
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
describe("Trading Pancake", function () {
    it('executes swaps for each token in the list', async function(){
        const {
            router,
            owner,
            feeSink,
            user,
            tokens
        } = await loadFixture(deployRouter);
        for (let i=0; i<tokens.length;i++) {
            console.log(i)
            const buyTxn = await sellNativeForToken(router, await tokens[i].getAddress(), ethers.parseEther('0.1'), 100000, user)
            const balance = await tokens[i].balanceOf(await user.getAddress())
            const sellTxn = await sellTokenForNative(tokens[i], router, balance, 200000, user)
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
        const quote = await getOptimalPath(router, await tokens[1].getAddress(), ethers.parseEther('1'), 0, 10000)
        await sellNativeForToken(router, await tokens[1].getAddress(), ethers.parseEther('500'), 10000, user)
        await expect(sellNativeForTokenWithoutQuote(router, await tokens[1].getAddress(), ethers.parseEther('1'), 10000, owner, quote)).revertedWithCustomError(router, 'V3TooLittleReceived()')
        }).timeout(10000000000000000000000000000000);
    it('should revert if slippage reached v2 on buy', async function(){
        const {
            router,
            owner,
            feeSink,
            user,
            tokens
        } = await loadFixture(deployRouter);
        const quote = await getOptimalPath(router, await tokens[0].getAddress(), ethers.parseEther('100'), 0, 10000)
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
        await sellNativeForToken(router, await tokens[1].getAddress(), ethers.parseEther('500'), 10000, user)
        await sellNativeForToken(router, await tokens[1].getAddress(), ethers.parseEther('1'), 10000, owner)
        const balance1 = await tokens[1].balanceOf(await user.getAddress())
        const balance2 = await tokens[1].balanceOf(await owner.getAddress())
        const quote = await getOptimalPath(router, await tokens[1].getAddress(), balance2, 1, 10000)
        await sellTokenForNative(tokens[1], router, balance1, 10000, user)
        await expect(sellTokenForNativeWithoutQuote(tokens[1], router, balance2, 10000, owner, quote)).revertedWithCustomError(router, 'V3TooLittleReceived()')
        }).timeout(10000000000000000000000000000000);
    it('should revert if slippage reached v2 on sell', async function(){
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
        await sellTokenForNative(tokens[0], router, balance1, 10000, user)
        await expect(sellTokenForNativeWithoutQuote(tokens[0], router, balance2, 10000, owner, quote)).revertedWithCustomError(router, 'V2TooLittleReceived()')
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
        for (let i=0; i<tokens.length;i++) {
            const buyTxn = await sellNativeForToken(router, await tokens[i].getAddress(), ethers.parseEther('0.1'), 100000, user)
            const balance = await tokens[i].balanceOf(await user.getAddress())
            const sellTxn = await sellTokenForNative(tokens[i], router, balance, 200000, user)
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
            await user.getAddress(), WETH.address, await tokens[0].getAddress(), ethers.parseEther('0.1'), 65330608002058294887n, 0, 0, 0
        )
    }).timeout(10000000000000000000000000000000)
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
            await user.getAddress(), WETH.address, await tokens[0].getAddress(), ethers.parseEther('0.1'), 65330608002058294887n, 0, 0, 0
        )
    }).timeout(10000000000000000000000000000000)
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
            await user.getAddress(), WETH.address, await tokens[0].getAddress(), ethers.parseEther('0.1'), 64677350663743489183n, 0, 0, ethers.parseEther('0.001')
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
