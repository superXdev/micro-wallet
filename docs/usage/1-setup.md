# Setup & Configuration
---
## Setup
In order to use micro wallet you need to run setup command first, just type this command
```bash
microw setup
```
If you want to reset it, add `-r` flag
```bash
microw setup -r
```
!!! warning

    Before run the command make sure you have backup wallet data, or you will lose your fund. All data will be permanently deleted!


## Configuration
The configuration command used to set or remove any config value, the data stored in non-encrypted data format. So it's only used to store data like api key, currency format, etc.

### List
To check what attributes can be set, you can type this command
```bash
microw config value
```
### Set config
Make sure you are using the correct attributes to set new value of configuration
```bash
microw config set <attribute> <value>
```

### Remove value
To remove the configuration value and make it null
```bash
microw config remove <attribute>
```