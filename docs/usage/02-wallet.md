# Wallet management
You can have multiple wallet & use it to run any command that required wallet option. The wallet data is encrypted for the private key to ensure security.

---

## New wallet
To create new wallet you can run
```bash
microw wallet create -n <name>
```
You must set `<name>` with alpha numeric characters like: **myWallet123**

## Export wallet
There are 2 ways to export the wallet, the first to display the private key and the second to be a JSON file format
```bash
# show private key
microw wallet export -n <name>

# JSON file format
microw wallet export -n <name> --json
```

!!! note
	The output file will be named based on the wallet name

## Import wallet
If you already have a previous wallet from another application, you can import it using the private key or JSON file generated by the micro wallet
```bash
microw wallet import
```
This command will ask you to input wallet name and the private key, if you want import with JSON file you can add `--json` or `-f` option following file name
```bash
microw wallet import --json main.json whale.json test.json
```
Here you can add as many wallet files as you want to import

## List all wallets
To display the entire list of wallets you have, run
```bash
microw wallet list
```

## Remove wallet
If you want to permanently delete a wallet, run
```bash
microw wallet remove -n <name>
```

## QR address
This command will display the QR format of the wallet address in your terminal
```bash
microw wallet qr -w <name>
```
