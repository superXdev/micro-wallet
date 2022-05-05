const { Sequelize, DataTypes } = require('sequelize')
const { rootPath } = require('./path')


const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: `${rootPath()}/${(process.env.ENVIRONMENT  =="debug") ? 'user.test.db' : 'user.db'}`,
  logging: false
})

const Wallet = sequelize.define('Wallet', {
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

const Network = sequelize.define('Network', {
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
  isTestnet: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  }
})

module.exports = {
	sequelize,
	Wallet,
  Network
}