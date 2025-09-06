# Zero to BApp

This repo is a workshop starter kit showing how to build and deploy a Bitcoin app (BApp) on [Citrea](https://citrea.xyz) from scratch. There are 3 core parts to the system the smart contracts, the frontend and the indexer. 

The smart contracts in this project are Token and Vault. The vault accepts cBTC deposits and sends the user USD based tokens at 50% of the value of their deposit. To price the cBTC a BTC:USD oracle from Redstone is used on Citrea Testnet.

The frontend is a barebones React project that uses Rainbowkit to interact with the contracts on the blockchain. It also integrates with the indexer to load deposit events to show the user their deposit history.

The indexer is a GraphQL based indexer created by Envio, it users hyperindex under the hood to perform extremely fast queries to keep the frontend responsive.

## Components
- **Smart Contracts** → Solidity, Foundry
- **Frontend** → React, RainbowKit, Wagmi
- **Indexer** → Envio (GraphQL APIs)

## Prerequisites

- Node.js ≥ 18 (Vite 5 requires Node 18+)
- Yarn (Classic) or npm for the frontend
  - Yarn Classic recommended (e.g., 1.22.x)
- pnpm ≥ 9 for the indexer
- Foundry (forge, cast, anvil) for contracts
  - Install: `curl -L https://foundry.paradigm.xyz | bash && foundryup`
- Docker Desktop (for running Envio/Hasura locally)
- A browser wallet (MetaMask, Rabby, or WalletConnect-compatible)

## Quickstart

### Contracts
Build and deploy the contracts with the following commands, note you will need testnet cBTC which can be source at the Citrea testnet [faucet](https://citrea.xyz/faucet):

```bash
cd contracts
forge install
forge build
forge script script/Deploy.s.sol:Deploy --rpc-url https://rpc.testnet.citrea.xyz --broadcast
```
If you just want to simulate the deployment without actually deploying you can just remove the `--broadcast` flag.

Take note of the contract addresses for the frontend and indexer sections, it will look like:
```
== Logs ==
  Token address: 0xFBaa042Aee4FBFb15cfE71c561dD2F5cFbc04FBa
  Vault address: 0xa7a7f3064007f143ce9ae136b2139f1B5E1008e5
```

### Frontend
To build and launch the frontend locally for testing the following commands should be used:
```bash
cd frontend
yarn install
yarn dev
```

NOTE: the frontend will not show any data until you add the correct contract addresses to frontend/config/contracts.ts

The output from `yarn dev` will instruct you on where to access the frontend. It will look something like:
```
  ➜  Local:   http://localhost:5173/
```

### Indexer
Before building the indexer, you will need to copy the address for the Vault contract into indexer/config.yaml.
The line should look something like:
```
    address:
    - 0xa7a7f3064007f143ce9ae136b2139f1B5E1008e5
```
Note: you can also update the starting block to the block your contracts were deployed to speed up indexing.

Once the config is updated, you can run the indexer locally using the following commands:
```bash
cd indexer
pnpm install
pnpm codegen
pnpm dev
```

The Hasura console can be used to test some GraphQL queries and is hosted locally on: http://localhost:8080/console

The default password for Hasura is: testing

NOTE: The aggregated functionality, direct SQL queries and custom API endpoints will not be available if you use Envio hosting services. If you need functionality akin to this you will need to develop more indepth data handling during indexing time in your handler.

### Verify Contracts
If you want to verify the contracts on testnet, you can use the following Foundry commands to do so.

Verfiy the Token contract:
```bash
forge verify-contract 0xFBaa042Aee4FBFb15cfE71c561dD2F5cFbc04FBa src/Token.sol:Token --verifier-url https://explorer.testnet.citrea.xyz/api? --verifier blockscout
```

Build the constructor args for the vault:
```bash
cast abi-encode "constructor(address,address)" 0xFBaa042Aee4FBFb15cfE71c561dD2F5cFbc04FBa 0xc555c100DB24dF36D406243642C169CC5A937f09
```
NOTE: the first address is the Token address which should be updated, the second address is the oracle address which can remain the same for the purposes of this repo.


Verify the Vault contract:
```bash
forge verify-contract 0xa7a7f3064007f143ce9ae136b2139f1B5E1008e5 src/Vault.sol:Vault --verifier-url https://explorer.testnet.citrea.xyz/api? --verifier blockscout --constructor-args 0x000000000000000000000000fbaa042aee4fbfb15cfe71c561dd2f5cfbc04fba000000000000000000000000c555c100db24df36d406243642c169cc5a937f09
```