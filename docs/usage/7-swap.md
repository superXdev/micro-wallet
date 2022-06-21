# Swap
Micro wallet provide a swap feature that is directly integrated into the DEX provider, which currently only supports certain networks

**Command**
```bash
microw swap <from> <to>
```

**Options**

| Option 			  | Type		| Description							 |
| ------------------- | ----------- | -------------------------------------- |
| `-a`, `--amount`	  | **number**  | Amount of target coin to swap			 |
| `-s`, `--slippage`  | **number**  | Number percent for slippage			 |
| `-r`, `--recipient` | **string**  | Set for different recipient			 |
| `-d`, `--deadline`  | **number**  | Time limit until reverted (in minutes) |
| `-w`, `--wallet`	  | **string**  | Wallet name or identifier				 |
| `-n`, `--network`	  | **number**  | Set network id or identifier			 |

## Basic usage
When doing swap a coin, it will automatically selected DEX provider in available swap router. You can swap with following command
```bash
microw swap <from> <to> -a <amount> -w <wallet> -n <network>
```
`<from>` means target coin or token want to be swapped and `<to>` means for coin or token will received

!!! warning
	This feature is currently not stable, so make transactions that you can be responsible for

## Advanced swap
For example you can set your own slippage rate with `--slippage` or `-s`option following with percent number

```bash
microw swap <from> <to> -a <amount> -w <wallet> -n <network> -s 5
```

That will set the slippage at 5%

```bash
microw swap <from> <to> -a <amount> -w <wallet> -n <network> -s 5 -r otherWallet
```
The above example will set the swab result to be sent to another wallet, you can set the value option using the address, wallet name or even ENS







