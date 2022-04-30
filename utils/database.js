const { Sequelize, DataTypes } = require('sequelize')
const { rootPath } = require('./path')


const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: `${rootPath()}/user.db`,
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

module.exports = {
	sequelize,
	Wallet
}