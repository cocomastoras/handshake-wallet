import React, {useEffect, useState} from 'react';
import './App.css';
const { Web3 } = require('web3');

function App() {
    const wssProvider = new Web3(new Web3.providers.WebsocketProvider('wss://api.avax-test.network/ext/bc/C/ws'))
    const httpProvider = new Web3('https://ava-testnet.public.blastapi.io/ext/bc/C/rpc')
    const [privateKey, setPrivateKey] = useState('');
    const [slippage, setSlippage] = useState('');
    const [tokenAddress, setTokenAddress] = useState('');
    const [avaxAmount, setAvaxAmount] = useState('');
    const [sellAmount, setSellAmount] = useState('');

    const [tokenSymbol, setTokenSymbol] = useState('');
    const [tokenName, setTokenName] = useState('');
    const [tokenSupply, setTokenSupply] = useState('');
    const [tokenValue, setTokenValue] = useState('');
    const [tokenLiq, setTokenLiq] = useState('');
    const [balance, setBalance] = useState('');
    const [tokensBought, setTokensBought] = useState([]);
    const [tokensCreated, setTokensCreated] = useState([]);

    async function fetchTokenInfo() {
        const account = httpProvider.eth.accounts.wallet.add(privateKey)
        const routerContract = new httpProvider.eth.Contract(routerAbi, routerAddress)
        let rsp = await routerContract.methods.fetchTokenInfo(tokenAddress).call()
        setTokenName(rsp.name)
        setTokenSymbol(rsp.symbol)
        setTokenSupply(rsp.totalSupply/(10n**rsp.decimals))
        const liq = [rsp.v1Reserve].concat(rsp.v2Reserves)
        const maxValue = liq.reduce((max, current) => (current > max ? current : max), liq[0]);
        setTokenLiq(maxValue/(10n**18n))
        const tokenContract = new httpProvider.eth.Contract(erc20Abi, tokenAddress)
        const balance = await tokenContract.methods.balanceOf(account[0].address).call()
        const quoteContract = new httpProvider.eth.Contract(quoterAbi, quoterAddress)
        rsp = await quoteContract.methods.findBestPathFromAmountIn([tokenAddress, wavax], balance).call()
        setTokenValue(rsp.amounts[1])
    }

    async function getBalance(address) {
        const bala = await httpProvider.eth.getBalance(address)
        setBalance(bala)
    }

    useEffect(() => {
        const storedPrivateKey = localStorage.getItem('privateKey');
        const storedSlippage = localStorage.getItem('slippage');

        if (storedPrivateKey) {
          setPrivateKey(storedPrivateKey);
        } else {
          // Initialize privateKey if it is null
          const wallet = httpProvider.eth.accounts.create()
          setPrivateKey(wallet.privateKey); // You can set any default value here
          localStorage.setItem('privateKey', wallet.privateKey)
        }

        if (storedSlippage) {
          setSlippage(storedSlippage);
        } else {
          // Initialize slippage if it is null
          setSlippage(1); // You can set any default value here
          localStorage.setItem('slippage', 1)
        }

        const wallet = httpProvider.eth.accounts.wallet.add(storedPrivateKey)
        getBalance(wallet[0].address)
    },[httpProvider.eth.accounts, getBalance]);

    useEffect(() => {
        const fetchData = () => {
          if (tokenAddress !== '') {
            fetchTokenInfo();
          }
        };
        const storedTokens = JSON.parse(localStorage.getItem('tokensBought')) || []
        setTokensBought(storedTokens)
        // Initial fetch
        fetchData()
        trackEvents()
        const intervalId = setInterval(fetchData, 10000);
        // Cleanup function to clear the interval on component unmount or when tokenAddress changes
        return () => clearInterval(intervalId);
    }, [tokenAddress]);

    const routerAddress = '0x1991888f4AfAf8C8320Df56c7997193b08229092'
    const quoterAddress = '0xd76019A16606FDa4651f636D9751f500Ed776250'
    const wavax = '0xd00ae08403B9bbb9124bB305C09058E32C39A48c'
    const factoryAddress = '0x8e42f2F4101563bF679975178e880FD87d3eFd4e'
    const factoryAddressV1 = '0xF5c7d9733e5f53abCC1695820c4818C59B457C2C'
    const routerAbi = [
        {
          "inputs": [],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "inputs": [],
          "name": "NoRouteFound",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "token",
              "type": "address"
            }
          ],
          "name": "fetchTokenInfo",
          "outputs": [
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "symbol",
              "type": "string"
            },
            {
              "internalType": "uint8",
              "name": "decimals",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "totalSupply",
              "type": "uint256"
            },
            {
              "internalType": "uint128[]",
              "name": "v2Reserves",
              "type": "uint128[]"
            },
            {
              "internalType": "uint112",
              "name": "v1Reserve",
              "type": "uint112"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address[]",
              "name": "route",
              "type": "address[]"
            },
            {
              "internalType": "uint256",
              "name": "slippage",
              "type": "uint256"
            }
          ],
          "name": "sellNativeForToken",
          "outputs": [],
          "stateMutability": "payable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint128",
              "name": "amount",
              "type": "uint128"
            },
            {
              "internalType": "address[]",
              "name": "route",
              "type": "address[]"
            },
            {
              "internalType": "uint256",
              "name": "slippage",
              "type": "uint256"
            }
          ],
          "name": "sellTokenForNative",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "withdraw",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "stateMutability": "payable",
          "type": "receive"
        }
    ]
    const erc20Abi = [
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "approve",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "account",
                    "type": "address"
                }
            ],
            "name": "balanceOf",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "spender",
                  "type": "address"
                }
            ],
            "name": "allowance",
            "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "addedValue",
                    "type": "uint256"
                }
            ],
            "name": "increaseAllowance",
            "outputs": [
              {
                "internalType": "bool",
                "name": "",
                "type": "bool"
              }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ]
    const quoterAbi = [
        {
          "inputs": [
            {
              "internalType": "address[]",
              "name": "route",
              "type": "address[]"
            },
            {
              "internalType": "uint128",
              "name": "amountIn",
              "type": "uint128"
            }
          ],
          "name": "findBestPathFromAmountIn",
          "outputs": [
            {
              "components": [
                {
                  "internalType": "address[]",
                  "name": "route",
                  "type": "address[]"
                },
                {
                  "internalType": "address[]",
                  "name": "pairs",
                  "type": "address[]"
                },
                {
                  "internalType": "uint256[]",
                  "name": "binSteps",
                  "type": "uint256[]"
                },
                {
                  "internalType": "enum ILBRouter.Version[]",
                  "name": "versions",
                  "type": "uint8[]"
                },
                {
                  "internalType": "uint128[]",
                  "name": "amounts",
                  "type": "uint128[]"
                },
                {
                  "internalType": "uint128[]",
                  "name": "virtualAmountsWithoutSlippage",
                  "type": "uint128[]"
                },
                {
                  "internalType": "uint128[]",
                  "name": "fees",
                  "type": "uint128[]"
                }
              ],
              "internalType": "struct ILBQuoter.Quote",
              "name": "quote",
              "type": "tuple"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        }
    ]


    const handleTokenChange = (event) => {
        setTokenAddress(event.target.value);
    };
    const handleAvaxChange = (event) => {
        setAvaxAmount(event.target.value);
    };
    const handleSellChange = (event) => {
        setSellAmount(event.target.value);
    };

    async function trackEvents() {
        const logSub = await wssProvider.eth.subscribe('logs', {
        address: factoryAddress,
        topics: ['0x2c8d104b27c6b7f4492017a6f5cf3803043688934ebcaa6a03540beeaf976aff']
        });
        logSub.on('data', async data => {
            const token =  "0x" + data.topics[1].slice(26)
            const oldTokens = tokensCreated
            oldTokens.push(token)
            setTokensCreated(oldTokens)
        })
        const logSubV1 = await wssProvider.eth.subscribe('logs', {
        address: factoryAddressV1,
        topics: ['0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9']
        });
        logSubV1.on('data', async data => {
            const token =  "0x" + data.topics[1].slice(26)
            const oldTokens = tokensCreated
            oldTokens.push(token)
            setTokensCreated(oldTokens)
        })
    }

    async function buyToken(inputAmount) {
        const path = [wavax, httpProvider.utils.toChecksumAddress(tokenAddress)]
        const account = httpProvider.eth.accounts.wallet.add(privateKey)
        let transaction = {
            from: httpProvider.utils.toChecksumAddress(account[0].address),
            to: httpProvider.utils.toChecksumAddress(routerAddress),
            value: httpProvider.utils.toWei(inputAmount, 'ether')
        }
        const routerContract = new httpProvider.eth.Contract(routerAbi, routerAddress)
        await routerContract.methods.sellNativeForToken(path, slippage).send(transaction)
        const tokenContract = new httpProvider.eth.Contract(erc20Abi, tokenAddress)
        const allowance = await tokenContract.methods.allowance(account[0].address, routerAddress).call()
        const balance = await tokenContract.methods.balanceOf(account[0].address).call()
        if (allowance < balance) {
            transaction = {
                from: httpProvider.utils.toChecksumAddress(account[0].address),
            }
            await tokenContract.methods.approve(routerAddress, 115792089237316195423570985008687907853269984665640564039457584007913129639935n).send(transaction)
        }
        if (tokensBought.length === 0) {
            const tempArr = [tokenAddress]
            setTokensBought(tempArr)
            localStorage.setItem("tokensBought", JSON.stringify(tempArr))
        }else {
            if(!tokensBought.includes(tokenAddress)) {
                const tempArr = tokensBought
                tempArr.push(tokenAddress)
                setTokensBought(tempArr)
                localStorage.setItem("tokensBought", JSON.stringify(tempArr))
            }
        }
    }
    async function sellToken(inputAmount) {
        const account = httpProvider.eth.accounts.wallet.add(privateKey)
        const path = [tokenAddress, wavax]
         const transaction = {
            from: httpProvider.utils.toChecksumAddress(account[0].address),
            to: httpProvider.utils.toChecksumAddress(routerAddress),
        }
        const tokenContract = new httpProvider.eth.Contract(erc20Abi, tokenAddress)
        const balance = await tokenContract.methods.balanceOf(account[0].address).call()
        const routerContract = new httpProvider.eth.Contract(routerAbi, routerAddress)
        const amount = balance * httpProvider.utils.toBigInt(inputAmount)/100n
        await routerContract.methods.sellTokenForNative(amount, path, slippage).send(transaction)
        if (inputAmount.toString() === '100') {
            const tempArr = tokensBought
            tempArr.splice(tempArr.indexOf(tokenAddress))
            setTokensBought(tempArr)

            localStorage.setItem("tokensBought", JSON.stringify(tempArr))
        }
    }

    return (
        <div className="App">
          <h1>Handshake Router</h1>
          <div>Wallet balance: {parseFloat(httpProvider.utils.fromWei(balance.toString(), 'ether')).toFixed(4)} Avax</div>
          <div>Tokens bought: {JSON.stringify(tokensBought)} </div>
          <input
            type="text"
            placeholder="Enter a token address"
            value={tokenAddress}
            onChange={handleTokenChange}
          />
          <br />
          {tokenAddress === '' ?
              <div></div> :
              <div>
                  <div>Token name: {tokenName}</div>
                  <div>Token symbol: {tokenSymbol}</div>
                  <div>Token supply: {tokenSupply.toString()}</div>
                  <div>Token liquidity: {tokenLiq.toString()} Avax</div>

                  <div>Value: {parseFloat(httpProvider.utils.fromWei(tokenValue.toString(), "ether")).toFixed(4)} Avax</div>
                  <input
                    type="text"
                    placeholder="Enter X amount"
                    value={avaxAmount}
                    onChange={handleAvaxChange}
                  />
                  <button onClick={() => buyToken(avaxAmount)}>BUY X AVAX</button>
                  <button onClick={() => buyToken('0.5')}>BUY 0.5 AVAX</button>
                  <button onClick={() => buyToken('1')}>BUY 1 AVAX</button>
                  <br />
                  <input
                    type="text"
                    placeholder="Sell % amount"
                    value={sellAmount}
                    onChange={handleSellChange}
                  />
                  <button onClick={() => sellToken(sellAmount)}>SELL X %</button>
                  <button onClick={() => sellToken('50')}>SELL 50%</button>
                  <button onClick={() => sellToken('100')}>SELL 100%</button>
                  <br />
              </div>}
            {tokensCreated.length !== 0 ?
                <div>New tokens: {JSON.stringify(tokensCreated)}</div> : <div></div>
            }
        </div>
      );
}

export default App;
