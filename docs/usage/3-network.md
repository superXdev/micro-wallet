# Network management
Most of the commonly used networks are already in the micro wallet, but you can add or even delete any network if needed.

---

## Add network
To add new network, you can run
```bash
microw network add
```
This command will ask you to input network information from the name of network to RPC url

## Check status
Whether it's due to interference on the blockchain network directly or an inaccessible RPC server, you can check it with the following command
```bash
microw network check -n <network id>
```

## Network list
Display all of registered network
```bash
microw network list
```

| Option            | Type       				   | Description                             |
| ----------------- | ---------------------------- |---------------------------------------- |
| `-s`, `--status`  | **string** 				   | Show connection status for all networks |
| `-t`, `--type`    | **string** (default=mainnet) | Spesific type of network to show   	 |


## Remove network
You can delete permanently a network using this command
```bash
microw network remove -n <network id>
```
