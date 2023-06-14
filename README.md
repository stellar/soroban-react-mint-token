# Soroban React Mint Token

This serves as a basic example of how a token administrator can mint more tokens
on Soroban.

## Helpful Docs

- [Soroban Dapps Challenge](https://soroban-dapps-challenge.vercel.app/docs/dapp-challenges/challenge-1-payment/challenge-1-walkthrough)

## Prerequisites

The Mint Token DApp relies on the following dependencies:

- Node (>=16.14.0 <17.0.0): https://nodejs.org/en/download/

- Yarn (v1.22.5 or newer): https://classic.yarnpkg.com/en/docs/install

- Freighter wallet: https://www.freighter.app/

## Features

The Mint Token DApp offers the following features:

1. **Freighter Wallet Integration**: The Mint Token DApp seamlessly integrates
   with Freighter, allowing users to connect their Freighter wallet to access
   Soroban token balances and utilize the signing capabilities of Freighter for
   secure and integrity-checked transactions.

2. **Transaction Construction**: Leveraging the Soroban token's contract
   interface, the DApp constructs transactions that invoke the `transfer`
   method. This method facilitates the transfer of Soroban tokens from one
   address to another.

## Build the Project

```
yarn && yarn build
```

## Starting a Dev Environment

```
yarn && yarn start
```

## Contributions

Contributions to the Mint Token DApp are welcome. If you encounter any issues,
have suggestions for improvements, or would like to contribute to the codebase,
please submit an issue, pull request, or reach out to us on
[Discord](https://discord.com/channels/897514728459468821/1037073682599780494).
