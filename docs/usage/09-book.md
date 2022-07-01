# Book
Micro wallet make it easier for you to save the recipient's address, you can have many address on book address and use it by their name. The name of book address can use for any transaction action

## New address
```sh
microw book add -a <address> -n <name>
```
it will save the address to book address list

## Show list
If you want to know every address with the name, you can display it with run
```sh
microw book list
```

## Remove address
To remove an address from book list
```sh
microw book remove -n <name>
```