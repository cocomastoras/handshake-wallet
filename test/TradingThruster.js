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
const WETH = WETH9[81457];
const TOKENS = [
    new Token(81457, '0xfd4D19F9FBb9F730C3C88a21755832BD2455144e', 18, "SSS", 'SSS'),
    new Token(81457, '0x5ffd9EbD27f2fcAB044c0f0a26A45Cb62fa29c06', 18, "PAC", 'PacMoon'),
    new Token(81457, '0x67fa2887914fA3729e9EED7630294Fe124f417A0', 18, "YIELD", 'Yield Token'),
    new Token(81457, '0xd43D8aDAC6A4C7d9Aeece7c3151FcA8f23752cf8', 9, "ANDY", 'Andy'),
    new Token(81457, '0x818a92bc81Aad0053d72ba753fb5Bc3d0C5C0923', 18, "JUICE", 'Juice'),
    new Token(81457, '0xA4C7aA67189EC5623121c6C94Ec757DfeD932D4B', 18, "MIA", 'MIA'),
    new Token(81457, '0x129ed667bf8C065fE5f66c9b44B7cB0126D85cC3', 18, "AIWAIFU", 'WAI'),
    new Token(81457, '0xB582Dc28968c725D2868130752aFa0c13EbF9b1a', 18, "BEPE", 'Blast Pepe'),
    new Token(81457, '0x42E12D42b3d6C4A74a88A61063856756Ea2DB357', 18, "ORBIT", 'Orbit protocol'),
    new Token(81457, '0x20fE91f17ec9080E3caC2d688b4EcB48C5aC3a9C', 18, "YES", 'YES'),
    new Token(81457, '0x5FE8534a6F96cb01261Bd96e98c17C2c1Cab3204', 18, "BAJA", 'Baja'),
]
const url = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';
const options = {
  method: 'GET',
  headers: {accept: 'application/json', 'x-cg-demo-api-key': 'CG-CDeBYrThehZqE9FiU5maABYz'}
};

async function deployRouter() {
    await reset("https://blast-mainnet.g.alchemy.com/v2/xkIcuOrk0eDv9TaZxMXtkwptU91055bi", 2486725)
    // Contracts are deployed using the first signer/account by default
    const [owner, feeSink, gasSink, user] = await ethers.getSigners();
    const Router = await ethers.getContractFactory('RouterThruster')
    const router = await Router.connect(owner).deploy(await owner.getAddress(), await  feeSink.getAddress(), await gasSink.getAddress(), 10000, 10000)
    const tokens = TOKENS.map(tk => {
        return new ethers.Contract(tk.address, TOKEN_ABI, owner)
    })
    return {router, owner, feeSink, gasSink, user, tokens};
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
describe("Trading Thruster", function () {
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
        const quote = await getOptimalPath(router, await tokens[0].getAddress(), ethers.parseEther('1'), 0, 10000)
        await sellNativeForToken(router, await tokens[0].getAddress(), ethers.parseEther('100'), 100000, user)
        await expect(sellNativeForTokenWithoutQuote(router, await tokens[0].getAddress(), ethers.parseEther('1'), 10000, owner, quote)).revertedWith("ThrusterRouter: INSUFFICIENT_OUTPUT_AMOUNT")
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
        await sellNativeForToken(router, await tokens[0].getAddress(), ethers.parseEther('5'), 100000, user)
        await sellNativeForToken(router, await tokens[0].getAddress(), ethers.parseEther('1'), 50000, owner)
        const balance1 = await tokens[0].balanceOf(await user.getAddress())
        const balance2 = await tokens[0].balanceOf(await owner.getAddress())
        const quote = await getOptimalPath(router, await tokens[0].getAddress(), balance2, 1, 10000)
        await sellTokenForNative(tokens[0], router, balance1, 100000, user)
        await expect(sellTokenForNativeWithoutQuote(tokens[0], router, balance2, 10000, owner, quote)).revertedWith('ThrusterRouter: INSUFFICIENT_OUTPUT_AMOUNT')
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
        await sellNativeForToken(router, await tokens[0].getAddress(), ethers.parseEther('5'), 100000, user)
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
            await user.getAddress(), '0x4300000000000000000000000000000000000004', await tokens[0].getAddress(), ethers.parseEther('0.1'), 26328886339641025581813354585n, 3000, 0, 0
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
            await user.getAddress(), '0x4300000000000000000000000000000000000004', await tokens[0].getAddress(), ethers.parseEther('0.1'), 26328886339641025581813354585n, 3000, 0, 0
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
            await user.getAddress(), '0x4300000000000000000000000000000000000004', await tokens[0].getAddress(), ethers.parseEther('0.1'), 26065632340915723680337782491n, 3000, 0, ethers.parseEther('0.001')
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


