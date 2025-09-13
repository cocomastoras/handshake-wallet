require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-web3");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
        {
          version: "0.8.19",
          settings: {
            optimizer: {
              enabled: true,
              runs: 9999999
            }
          }
        },
        {
          version: "0.8.22",
          settings: {
            optimizer: {
              enabled: true,
              runs: 9999999
            }
          }
        },
        {
          version: "0.8.23",
          settings: {
            optimizer: {
              enabled: true,
              runs: 9999999
            }
          }
        }
    ]
  },
  gasReporter: {
    enabled: true
  },
  networks: {
      hardhat: {
        chains: {
        8453 : {
          hardforkHistory: {
            cancun: 19718907
          }
        }
      },
      forking: {
        enabled: true,
        url: "https://1rpc.io/base",
        timeout: 60000,
        blockNumber: 19885001
      },
      // forking: {
      //   url: "https://api.avax.network/ext/bc/C/rpc",
      //   blockNumber: 44268000
      // }
      // forking: {
      //   url: "https://rpc.ankr.com/bsc",
      //   blockNumber: 37909000
      // }
    },
    polygon: {
      url: "https://polygon-rpc.com/"
    },
    binance: {
      url: "https://bsc-dataseed.binance.org/"
    },
    ethereum: {
      url: 'https://ethereum.publicnode.com/'
    },
    fantom: {
      url: 'https://rpc.ftm.tools/'
    },
    base: {
      url: 'https://mainnet.base.org/',
      accounts: ['']
    },
    blast: {
      url: 'https://rpc.blast.io'
    },
    avax: {
      url: 'https://api.avax.network/ext/bc/C/rpc'
    },
    arb: {
      url: 'https://arbitrum-one.publicnode.com',
      accounts: ['']
    },
    chiliz: {
      url: 'https://rpc.ankr.com/chiliz',
      accounts: ['']
    },
    polygon_mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: ['']
    },
    binance_testnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      accounts: ['']
    },
    op_testnet: {
      url: "https://goerli.optimism.io",
      accounts: ['']
    },
    op_sepolia_testnet: {
      url: "https://sepolia.optimism.io",
      accounts: ['']
    },
    sepolia: {
      url: 'https://eth-sepolia-public.unifra.io',
      accounts: ['']
    },
    fantom_testnet: {
      url: 'https://rpc.testnet.fantom.network/'
    },
    avax_testnet: {
      url: 'https://api.avax-test.network/ext/bc/C/rpc',
      accounts: ['']
    },
    base_testnet: {
      url: 'https://goerli.base.org/'
    },
    spicy_testnet: {
      url: 'https://spicy-rpc.chiliz.com/',
      accounts: ['']
    },
    arb_goerli: {
      url: 'https://rpc.goerli.arbitrum.gateway.fm',
      accounts: ['']
    }
  },
  etherscan: {
    apiKey: {
    },
    customChains: [
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org"
        }
      },
      {
        network: "spicy_testnet",
        chainId: 88882,
        urls: {
          apiURL: "https://spicy-explorer.chiliz.com/api",
          browserURL: "https://spicy-explorer.chiliz.com/"
        }
      },
      {
        network: "chiliz",
        chainId: 88888,
        urls: {
          apiURL: "https://api.routescan.io/v2/network/mainnet/evm/88888/etherscan",
          browserURL: "https://chiliscan.com"
        }
      },
      {
        network: "op_sepolia_testnet",
        chainId: 11155420,
        urls: {
          apiURL: "https://api-sepolia-optimistic.etherscan.io/api",
          browserURL: "https://sepolia-optimism.etherscan.io/"
        }
      }
    ]
  }
};

