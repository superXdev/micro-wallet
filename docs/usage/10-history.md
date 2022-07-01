# History
Show latest transaction history

**Command**
```sh
microw history [options]
```

**Options**

| Option 			| Type		 | Description				   |
| ----------------- | ---------- | --------------------------- |
| `-w`, `--wallet`  | **string** | Spesified wallet identifier |
| `-n`, `--network` | **number** | Spesified wallet identifier |


## All history
This will show 10 latest history transactions with their type & tx hash
```sh
microw history
```

## Specified target
For more specific history transactions you can use the options
```sh
# show only for spesified wallet
microw history -w <name>

# show only for spesified network
microw history -n <network>

# show only for spesified wallet & network
microw history -w <name> -n <network>
```