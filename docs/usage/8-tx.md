# Tx check
You can check detail for a transaction with tx hash, transaction id, or latest transaction.

**Command**

```sh
microw tx <tx>
```

## Example usage
If you want to check details for latest transaction you can run
```sh
microw tx latest -n <network>
```
with transaction id
```sh
microw tx 1 -n <network>
```
or tx hash
```sh
microw tx 0x000aaa111.. -n <network>
```