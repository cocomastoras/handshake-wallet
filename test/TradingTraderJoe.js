const {
  time,
  loadFixture,
  reset
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
const WETH = WETH9[43114];
const TOKENS = [
    new Token(43114, '0x420FcA0121DC28039145009570975747295f2329', 18, "COQ", 'COQINU'),
    new Token(43114, '0x65378b697853568dA9ff8EaB60C13E1Ee9f4a654', 18, "HUSKY", 'Husky'),
    new Token(43114, '0xE8385CECb013561b69bEb63FF59f4d10734881f3', 18, "GEC", 'Gecko Inu'),
    new Token(43114, '0x4F94b8AEF08c92fEfe416af073F1Df1E284438EC', 18, "WOLF", 'Landwolf'),
    new Token(43114, '0x184ff13B3EBCB25Be44e860163A5D8391Dd568c1', 18, "KIMBO", 'Kimbo'),
    new Token(43114, '0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd', 18, "JOE", 'JoeToken'),
    new Token(43114, '0xD5D053D5B769383e860d1520Da7a908E00919F36', 18, "JUICE", 'JUICE'),
    new Token(43114, '0xAcFb898Cff266E53278cC0124fC2C7C94C8cB9a5', 18, "NOCHILL", 'AVAX HAS NO CHILL'),
    new Token(43114, '0x8aD25B0083C9879942A64f00F20a70D3278f6187', 18, "MEOW", 'MeowCat'),
    new Token(43114, '0xEbB5d4959B2FbA6318FbDa7d03cd44aE771fc999', 18, "KONG", 'KONG'),
    new Token(43114, '0x5Ac04b69bDE6f67C0bd5D6bA6fD5D816548b066a', 18, "TECH", 'NumberGoUpTech'),
    new Token(43114, '0x87bbFc9DCB66Caa8ce7582A3F17B60a25cd8A248', 18, "$Td", 'Big Red'),
    new Token(43114, '0x96E1056a8814De39c8c3Cd0176042d6ceCD807d7', 18, "OSAK", 'Osaka Protocol'),
    new Token(43114, '0x88F89BE3E9b1dc1C5F208696fb9cABfcc684bD5F', 18, "FLD", 'Fold'),
]
const url = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';
const options = {
  method: 'GET',
  headers: {accept: 'application/json', 'x-cg-demo-api-key': 'CG-CDeBYrThehZqE9FiU5maABYz'}
};

async function deployRouter() {
    // Contracts are deployed using the first signer/account by default
    await reset('https://api.avax.network/ext/bc/C/rpc', 45548639)
    const [owner, feeSink, user] = await ethers.getSigners();
    const Router = await ethers.getContractFactory('RouterTraderJoe')
    const router = await Router.connect(owner).deploy(await owner.getAddress(), await feeSink.getAddress(), 10000)
    const ILBRouter = await ethers.getContractAt('ILBRouter', '0xb4315e873dBcf96Ffd0acd8EA43f689D8c20fB30')
    const tokens = TOKENS.map(tk => {
        return new ethers.Contract(tk.address, TOKEN_ABI, owner)
    })
    return {router, owner, feeSink, user, tokens, ILBRouter};
}

describe("Trading TraderJoe", function () {
    it('executes swaps for each token in the list', async function(){
        const {
            router,
            owner,
            feeSink,
            user,
            tokens,
            ILBRouter
        } = await loadFixture(deployRouter);
        for (let i=0; i<tokens.length;i++) {
            console.log(i)
            let quote = await router.findBestPathFromAmountIn(WETH.address, await tokens[i].getAddress(), ethers.parseEther('0.99'))
            let versions = [...quote[3]];
            let binSteps = [...quote[2]];
            let virtualAmountOut = quote[5][1]
            await router.connect(user).sellNativeForToken(await tokens[i].getAddress(), 50, versions, binSteps, virtualAmountOut, {value: ethers.parseEther('1')})
            const balance = await tokens[i].balanceOf(await user.getAddress())
            quote = await router.connect(user).findBestPathFromAmountIn(await tokens[i].getAddress(), WETH.address, balance)
            versions = [...quote[3]];
            binSteps = [...quote[2]];
            virtualAmountOut = quote[5][1]
            await tokens[i].connect(user).approve(await router.getAddress(), balance)
            const sellTxn = await router.connect(user).sellTokenForNative(balance, await tokens[i].getAddress(), 50, versions, binSteps, virtualAmountOut)
        }
    }).timeout(10000000000000000000000000000000);
    it('should revert if slippage reached on buy', async function(){
        const {
            router,
            owner,
            feeSink,
            user,
            tokens,
            ILBRouter
        } = await loadFixture(deployRouter);
        let quote = await router.findBestPathFromAmountIn(WETH.address, await tokens[0].getAddress(), ethers.parseEther('495'))
        let quote2 = await router.findBestPathFromAmountIn(WETH.address, await tokens[0].getAddress(), ethers.parseEther('0.099'))
        let versions = [...quote[3]];
        let binSteps = [...quote[2]];
        let virtualAmountOut = quote[5][1]
        await router.connect(user).sellNativeForToken(await tokens[0].getAddress(), 50, versions, binSteps, virtualAmountOut, {value: ethers.parseEther('500')})
        versions = [...quote2[3]];
        binSteps = [...quote2[2]];
        virtualAmountOut = quote2[5][1]
        await expect(router.sellNativeForToken(await tokens[0].getAddress(), 10, versions, binSteps, virtualAmountOut, {value: ethers.parseEther('0.1')})).revertedWithCustomError(ILBRouter, 'LBRouter__InsufficientAmountOut(uint256 amountOutMin, uint256 amountOut)')
    }).timeout(10000000000000000000000000000000);
    it('should revert if slippage reached on sell', async function(){
        const {
            router,
            owner,
            feeSink,
            user,
            tokens,
            ILBRouter
        } = await loadFixture(deployRouter);
        let quote = await router.findBestPathFromAmountIn(WETH.address, await tokens[0].getAddress(), ethers.parseEther('10'))
        let versions = [...quote[3]];
        let binSteps = [...quote[2]];
        let virtualAmountOut = quote[5][1]
        await router.connect(user).sellNativeForToken(await tokens[0].getAddress(), 50, versions, binSteps, virtualAmountOut, {value: ethers.parseEther('500')})
        versions = [...quote2[3]];
        binSteps = [...quote2[2]];
        virtualAmountOut = quote2[5][1]
        await expect(router.sellNativeForToken(await tokens[0].getAddress(), 10, versions, binSteps, virtualAmountOut, {value: ethers.parseEther('0.1')})).revertedWithCustomError(ILBRouter, 'LBRouter__InsufficientAmountOut(uint256 amountOutMin, uint256 amountOut)')
        }).timeout(10000000000000000000000000000000);
    it('should revert if not valid version passed on buy', async function(){
        const {
            router,
            owner,
            feeSink,
            user,
            tokens
        } = await loadFixture(deployRouter);
        await expect(sellNativeForTokenMalformedVersion(router, await tokens[14].getAddress(), ethers.parseEther('5'), 1, user)).revertedWithCustomError(router, 'InvalidVersion()')
        }).timeout(10000000000000000000000000000000);
    it('should revert if not valid version passed on sell', async function(){
        const {
            router,
            owner,
            feeSink,
            user,
            tokens
        } = await loadFixture(deployRouter);
        await sellNativeForToken(router, await tokens[14].getAddress(), ethers.parseEther('5'), 1, user)
        const balance = await tokens[14].balanceOf(await user.getAddress())
        await expect(sellTokenForNativeMalformedVersion(tokens[14], router, balance, 1, user)).revertedWithCustomError(router, 'InvalidVersion()')
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
        console.log(await router.fetchTokensInfo(addresses))
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
        console.log(await router.fetchTokenInfo(address))
    }).timeout(10000000000000000000000000000000);
    it('sends contract balance to fee sink', async function(){
        const {
            router,
            owner,
            feeSink,
            user,
            tokens
        } = await loadFixture(deployRouter);
        for (let i=0; i<10;i++) {
            const buyTxn = await sellNativeForToken(router, await tokens[i].getAddress(), ethers.parseEther('1'), 10, user)
            const balance = await tokens[i].balanceOf(await user.getAddress())
            const sellTxn = await sellTokenForNative(tokens[i], router, balance, 10, user)
        }
        const balancePre = await ethers.provider.getBalance(await feeSink.getAddress())
        await router.withdrawFees()
        const balanceAfter = await ethers.provider.getBalance(await feeSink.getAddress())
        expect(balanceAfter > balancePre)
    }).timeout(10000000000000000000000000000000);
});