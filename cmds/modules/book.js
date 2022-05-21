const { Book } = require('../../utils/database')
const validator = require('validator')

async function saveAddress(name, address) {
	const pass = address.match(/^0x[a-fA-F0-9]{40}$/g)

	if (!pass) {
		return false;
	}

	if(!validator.isAlphanumeric(name)) {
		return false
	}

	// insert to database
	await Book.create({
		name: name,
		address: address
	})

	return true
}


async function getAll() {
	return await Book.findAll()
}

// delete book address
async function removeAddress(name) {
   return await Book.destroy({ where: { name: name } })
}

module.exports = {
	saveAddress,
	getAll,
	removeAddress
}