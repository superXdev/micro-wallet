const { Book } = require('../../utils/database')


async function saveAddress(name, address) {
	const pass = address.match(/^0x[a-fA-F0-9]{40}$/g)

	if (!pass) {
		return false;
	}

	// insert to database
	await Book.create({
		name: name,
		address: address
	})

	return true
}


module.exports = {
	saveAddress
}