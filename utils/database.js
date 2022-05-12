const { Sequelize, DataTypes } = require('sequelize')
const { rootPath } = require('./path')


const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: `${rootPath()}/${(process.env.ENVIRONMENT  =="debug") ? 'user.test.db' : 'user.db'}`,
  logging: false
})

const Wallet = sequelize.define('wallet', {
  walletName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  privateKey: {
    type: DataTypes.TEXT,
    allowNull: false
  }
})

const Network = sequelize.define('network', {
  networkName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rpcURL: {
    type: DataTypes.STRING,
    allowNull: false
  },
  currencySymbol: {
    type: DataTypes.STRING,
    allowNull: false
  },
  explorerURL: {
    type: DataTypes.STRING,
    allowNull: true
  },
  chainId: {
    type: DataTypes.NUMBER,
    allowNull: false
  },
  isTestnet: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  }
})

const Token = sequelize.define('token', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  symbol: {
    type: DataTypes.STRING,
    allowNull: false
  },
  decimals: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contractAddress: {
    type: DataTypes.STRING,
    allowNull: false
  },
  networkId: {
    type: DataTypes.NUMBER,
    allowNull: false
  }
})

Network.hasMany(Token, { as: 'tokens' })
Token.belongsTo(Network, {
  foreignKey: "networkId",
  as: "network",
})

module.exports = {
	sequelize,
	Wallet,
  Network,
  Token
}