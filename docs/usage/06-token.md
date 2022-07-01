# Token
Manage token to check balance, import and remove token from wallet in specified network

**Command**
```bash
# Show all of token balance
microw token balance

# Import new token
microw token import

# Remove permanently a token   
microw token remove
```

## Token balance
This command will check all registered token balances
```bash
microw token balance -w <wallet name> -n <network id>
```

## Import token
You can import new token with the contract address
```bash
microw token import -a <contract address> -n <network id>
```

## Remove token
This does not mean disappearing tokens completely from your wallet, but more like to hide from micro wallet to check information or balance
```bash
microw token remove -s <symbol> -n <network id>
```