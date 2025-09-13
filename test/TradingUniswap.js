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
const WETH = WETH9[8453];
const TOKENS = [
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe'),
    new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, "DEGEN", 'Degen'),
    new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, "BRETT", 'Brett'),
    new Token(8453, '0xE3086852A4B125803C815a158249ae468A3254Ca', 18, "mfer", 'mfercoin'),
    new Token(8453, '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200', 9, "NORMIE", 'Normie'),
    new Token(8453, '0xE1aBD004250AC8D1F199421d647e01d094FAa180', 18, "ROOST", 'Roost Coin'),
    new Token(8453, '0x9a26F5433671751C3276a065f57e5a02D2817973', 18, "KEYCAT", 'Keyboard Cat'),
    new Token(8453, '0xb8D98a102b0079B69FFbc760C8d857A31653e56e', 18, "toby", 'toby'),
    new Token(8453, '0x42069dE48741Db40aeF864F8764432bBccbD0B69', 18, "BETS", 'All Street Bets'),
    new Token(8453, '0x347F500323D51E9350285Daf299ddB529009e6AE', 18, "BLERF", 'BLERF'),
    new Token(8453, '0xa835f70dd5f8B4F0023509f8f36C155785758dB0', 18, "Cheeky Dawg", 'DAWG'),
    new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, "Based Shiba Inu", 'BSHIB'),
    new Token(8453, '0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3', 18, "Based Peng", 'BENG'),
    new Token(8453, '0xfcC48e9feBda1EC10d6f21Df7e0ad6fb0836C790', 18, "Blue on base", 'blue'),
    new Token(8453, '0x70737489DFDf1A29b7584d40500d3561bD4Fe196', 18, "BORED", 'BORED'),
    new Token(8453, '0x3054E8F8fBA3055a42e5F5228A2A4e2AB1326933', 18, "Zuzalu", 'Zuzalu'),
    new Token(8453, '0x4995498969F8F1053d356D05F768618472e0D9e7', 18, "POV", 'DEGEN POV'),
    new Token(8453, '0x2816a491Dd0B7A88d84cbDed842A618e59016888', 18, "LONG", 'LONG'),
    new Token(8453, '0xdCe704A0622a8437200cb6076ee69B2Cf573827c', 18, "SPEC", 'Speculate'),
    new Token(8453, '0x4498cd8Ba045E00673402353f5a4347562707e7D', 18, "RDAT", 'RData'),
    new Token(8453, '0x15aC90165f8B45A80534228BdCB124A011F62Fee', 18, "MOEW", 'donotfomoew'),
    new Token(8453, '0x8b67f2E56139cA052a7EC49cBCd1aA9c83F2752a', 18, "FLIES", 'MUTATIO'),
    new Token(8453, '0xCb2861a1ec1D0392afb9E342d5AA539e4f75b633', 18, "DUDE", 'dude'),
    new Token(8453, '0x45096BD2871911eE82A3084D77a01eFA3c9c6733', 18, "BUB", 'BUBCAT'),
    new Token(8453, '0x88Faea256f789F8dD50dE54F9C807eEf24f71b16', 18, "WOLF", 'LandWolf'),
    new Token(8453, '0x80f45EaCF6537498ecc660e4e4A2D2F99e195Cf4', 18, "PEPE", 'Pepe')
]
const url = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';
const options = {
  method: 'GET',
  headers: {accept: 'application/json', 'x-cg-demo-api-key': 'CG-CDeBYrThehZqE9FiU5maABYz'}
};

async function deployRouter() {
    await reset("https://base-mainnet.g.alchemy.com/v2/xkIcuOrk0eDv9TaZxMXtkwptU91055bi", 13066030)
    // Contracts are deployed using the first signer/account by default
    const [owner, feeSink, user] = await ethers.getSigners();
    const Router = await ethers.getContractFactory('RouterUniswapBase')
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
describe("Trading Uniswap", function () {
    it('executes swaps for each token in the list', async function(){
            const {
                router,
                owner,
                feeSink,
                user,
                tokens
            } = await loadFixture(deployRouter);
            for (let i=0; i<25;i++) {
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
        const quote = await getOptimalPath(router, await tokens[0].getAddress(), ethers.parseEther('1'), 0, 10000)
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
        const quote = await getOptimalPath(router, await tokens[14].getAddress(), ethers.parseEther('1'), 0, 10000)
        await sellNativeForToken(router, await tokens[14].getAddress(), ethers.parseEther('1'), 10000, user)
        await expect(sellNativeForTokenWithoutQuote(router, await tokens[14].getAddress(), ethers.parseEther('1'), 10000, owner, quote)).revertedWithCustomError(router, "V2TooLittleReceived()")
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
        await sellNativeForToken(router, await tokens[14].getAddress(), ethers.parseEther('5'), 10000, user)
        await sellNativeForToken(router, await tokens[14].getAddress(), ethers.parseEther('1'), 10000, owner)
        const balance1 = await tokens[14].balanceOf(await user.getAddress())
        const balance2 = await tokens[14].balanceOf(await owner.getAddress())
        const quote = await getOptimalPath(router, await tokens[14].getAddress(), balance2, 1, 10000)
        await sellTokenForNative(tokens[14], router, balance1, 10000, user)
        await expect(sellTokenForNativeWithoutQuote(tokens[14], router, balance2, 10000, owner, quote)).revertedWithCustomError(router, 'V2TooLittleReceived()')
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
        for (let i=0; i<10;i++) {
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
            await user.getAddress(), WETH.address, await tokens[0].getAddress(), ethers.parseEther('0.1'), 10353944910583784070288n, 3000, 1, 0
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
            await user.getAddress(), WETH.address, await tokens[0].getAddress(), ethers.parseEther('0.1'), 10353944910583784070288n, 3000, 1, 0
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
            await user.getAddress(), WETH.address, await tokens[0].getAddress(), ethers.parseEther('0.1'), 10250406912575075114457n, 3000, 1, ethers.parseEther('0.001')
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