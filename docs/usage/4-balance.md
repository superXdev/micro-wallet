# Balance
Commands to check tokens, native coins or even multiples at once

**Command**
```bash
microw balance <target>
```

**Options**

| Option 			| Type		 | Description 							 |
| ----------------- | ---------- | ------------------------------------- |		
| `-w`, `--wallet`  | **string** | Wallet name or identifier			 |
| `-n`, `--network` | **number** | Set network id or identifier			 |
| `-t`, `--testnet` | **string** | Enable testnet network only for "all" |

---

## Check balance
To check balance you can simply type
```bash
microw balance <target>
```
Which is `<target>` is coin or token symbol like `ETH` or `UNI`, it will display one balance 

## All balance
You can easily check all coin balance at once for specific wallet with command
```bash
microw balance all -w <wallet name>
```

!!! note
	For default it will display in mainnet network, if you want to display for testnet network, add `--testnet` or `-t` flag