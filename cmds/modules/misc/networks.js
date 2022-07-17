exports.networks = [
   // mainnet network
   {
      networkName: "Ethereum",
      rpcURL: "https://mainnet.infura.io/v3/7699ff9dd25b4694bc711ca3abcdec3d",
      currencySymbol: "ETH",
      explorerURL: "https://etherscan.io",
      apiURL: "https://api.etherscan.io/api",
      chainId: 1,
      isTestnet: false
   },
   {
      networkName: "Polygon Mainnet",
      rpcURL: "https://polygon-rpc.com",
      currencySymbol: "MATIC",
      explorerURL: "https://polygonscan.com",
      chainId: 137,
      isTestnet: false
   },
   {
      networkName: "Avalanche C-Chain",
      rpcURL: "https://api.avax.network/ext/bc/C/rpc",
      currencySymbol: "AVAX",
      explorerURL: "https://snowtrace.io",
      chainId: 43114,
      isTestnet: false
   },
   {
      networkName: "Binance Smart Chain",
      rpcURL: "https://bsc-dataseed1.defibit.io/",
      currencySymbol: "BNB",
      explorerURL: "https://bscscan.com",
      apiURL: 'https://api.bscscan.com/api',
      chainId: 56,
      isTestnet: false
   },
   {
      networkName: "Klaytn Mainnet",
      rpcURL: "https://public-node-api.klaytnapi.com/v1/cypress",
      currencySymbol: "KLAY",
      explorerURL: "https://scope.klaytn.com",
      chainId: 8217,
      isTestnet: false
   },
   {
      networkName: "Fantom Opera",
      rpcURL: "https://rpc.ankr.com/fantom/",
      currencySymbol: "FTM",
      explorerURL: "https://ftmscan.com",
      chainId: 250,
      isTestnet: false
   },
   {
      networkName: "Cronos",
      rpcURL: "https://evm.cronos.org",
      currencySymbol: "CRO",
      explorerURL: "https://cronoscan.com",
      chainId: 25,
      isTestnet: false
   },
   {
      networkName: "Celo (Mainnet)",
      rpcURL: "https://forno.celo.org",
      currencySymbol: "CELO",
      explorerURL: "https://explorer.celo.org",
      chainId: 42220,
      isTestnet: false
   },

   // testnet network
   {
      networkName: "Polygon Testnet Mumbai",
      rpcURL: "https://rpc-mumbai.maticvigil.com",
      currencySymbol: "MATIC",
      explorerURL: "https://mumbai.polygonscan.com",
      chainId: 80001,
      isTestnet: true
   },
   {
      networkName: "Goerli Testnet",
      rpcURL: "https://goerli.infura.io/v3/7699ff9dd25b4694bc711ca3abcdec3d",
      currencySymbol: "ETH",
      explorerURL: "https://goerli.etherscan.io",
      chainId: 5,
      apiURL: 'http://api-goerli.etherscan.io/api',
      isTestnet: true
   },
   {
      networkName: "Avalanche Fuji Testnet",
      rpcURL: "https://api.avax-test.network/ext/bc/C/rpc",
      currencySymbol: "AVAX",
      explorerURL: "https://testnet.snowtrace.io",
      chainId: 43113,
      isTestnet: true
   },
   {
      networkName: "Binance Smart Chain Testnet",
      rpcURL: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      currencySymbol: "BNB",
      explorerURL: "https://testnet.bscscan.com",
      apiURL: 'https://api-testnet.bscscan.com/api',
      chainId: 97,
      isTestnet: true
   },
   {
      networkName: "Fantom testnet",
      rpcURL: "https://rpc.ankr.com/fantom_testnet",
      currencySymbol: "FTM",
      explorerURL: "https://testnet.ftmscan.com",
      chainId: 4002,
      isTestnet: true
   },
   {
      networkName: "Klaytn Baobab",
      rpcURL: "https://api.baobab.klaytn.net:8651/",
      currencySymbol: "KLAY",
      explorerURL: "https://baobab.scope.klaytn.com",
      chainId: 1001,
      isTestnet: true
   },
   {
      networkName: "Cronos Testnet",
      rpcURL: "https://evm-t3.cronos.org",
      currencySymbol: "tCRO",
      explorerURL: "https://testnet.cronoscan.com",
      chainId: 338,
      isTestnet: true
   },
   {
      networkName: "Celo (Alfajores Testnet)",
      rpcURL: "https://alfajores-forno.celo-testnet.org",
      currencySymbol: "CELO",
      explorerURL: "https://alfajores-blockscout.celo-testnet.org",
      chainId: 44787,
      isTestnet: true
   },
   {
      networkName: "Localhost 8545",
      rpcURL: "http://localhost:8545",
      currencySymbol: "ETH",
      chainId: 1337,
      isTestnet: true
   },
]