# Transfer
In micro wallet you can transfer between native coin or token in any network to address, other wallet, ENS and book address.

**Command**

```bash
microw transfer <symbol>
```

**Option**

| Option					  | Type		   | Description                       |
| -------------------- | ---------- | --------------------------------- |
| `-a`, `--amount`     | **string** | Amount to transfer						|
| `-d`, `--destination`| **string** | Address or identifier of recipient|
| `-w`, `--wallet`     | **string** | Wallet name or identifier         |
| `-n`, `--network`    | **number** | Network ID of blockchain          |

## Transfer something
If you want to transfer coin or token, you can just run
```bash
microw transfer <symbol> -a <amount> -d <destination> -w <wallet name> -n <network id>
```
Where `<symbol>` can be between coin or token, `<destination>` can be address, wallet name, book address name, ENS. You can transfer any token or any coin in any network in few seconds!
