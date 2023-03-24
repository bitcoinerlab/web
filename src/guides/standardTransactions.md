# Programming Standard Transactions

This guide will walk you through an example of using the [@bitcoinerlab/descriptors](https://bitcoinerlab.com/modules/descriptors) library to create a Bitcoin transaction that moves funds from a Legacy address to a Segwit address.

## What You Will Learn

In this guide, you will learn how to:

- Create a software wallet from a 12-word mnemonic
- Obtain a Legacy address to receive funds
- Retrieve the UTXO from a Bitcoin block explorer
- Create a Bitcoin transaction that spends the UTXO and sends the funds to a Segwit address controlled by the same 12-word mnemonic.

**WARNING**: The code in this guide is intended solely for educational purposes and has been simplified to the point of excluding essential error handling and security checks. It should never be used in production environments without extensive modifications and testing to ensure its safety and reliability.

## Running the Code

You can try out the code right now by clicking on the **SHOW PLAYGROUND** button or by [installing and running the code locally](https://github.com/bitcoinerlab/playground).

## Creating a Software Wallet

In this guide, we will be using a 12 word mnemonic to create a `BIP32` master node, which will act as our software wallet.

To create the master node, we will use the `fromSeed()` method and pass in the seed derived from the mnemonic using the `mnemonicToSeedSync()` method from the `bip39` library.

```typescript
//Let's create our software wallet with this mnemonic:
const MNEMONIC =
  'drum turtle globe inherit autumn flavor ' +
  'slice illness sniff distance carbon elder';
const masterNode = BIP32.fromSeed(mnemonicToSeedSync(MNEMONIC), network);
```

## Generating a Legacy Address for Funding

First, we will create a descriptor representing the initial address where we will receive some funds.

In this guide, we will fund the address under this BIP32 path: `44'/1'/0'/0/1`. This corresponds to the second external address (`.../0/1`) of the first Legacy account, based on the [BIP44](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki) standard. Additionally, it uses the Testnet network.

To create a descriptor to generate the Legacy address where the initial funds will be sent:

```typescript
const descriptorLegacy = new Descriptor({
  expression: pkhBIP32({ masterNode, network, account: 0, keyPath: '/0/1' }),
  network
});
```

`pkh` in `pkhBIP32` represents P2PKH (Legacy) script expressions. In other cases, using `wpkhBIP32` would denote P2WPKH (Segwit) expressions, and `shWpkhBIP32` would refer to P2SH-P2WPKH (Nested Segwit) expressions.

Instead of passing `{keyPath: '0/1'}`, we could have also used `{change: 0, index: 1}`.

By running `descriptorLegacy.getAddress()`, we can obtain the corresponding Bitcoin address, `moovc1JqGrz4v6FA2U8ks8ZqjSwjv3yRKQ`. We have already sent some funds to this address, so you don't need to perform this step yourself. You can verify the transaction that funded the address using a [block explorer](https://tinyurl.com/mu82nmzw).

To confirm the generated address from the mnemonic and key path provided, you can use [Ian Coleman's BIP39 Tool](https://iancoleman.io/bip39/) (make sure to select "Testnet" as the coin type).

## Retrieving UTXO Information

In this guide, our goal is to create a transaction that spends a UTXO from a Legacy address to a Segwit address, both generated from the same mnemonic provided and thus controlled by our wallet. To achieve this, we first need to know the details of the unspent transaction output (UTXO) we want to spend.

We will use the UTXO from the Legacy address, which has been previously funded, as explained in the earlier section. This UTXO corresponds to `1679037` sats received at `moovc1JqGrz4v6FA2U8ks8ZqjSwjv3yRKQ`, the address in path: `44'/1'/0'/0/1`.

In the code snippet below, we use the `fetch()` method to call an Esplora Block Explorer API, specifically the Esplora block explorer provided by Blockstream for the Testnet network. You can find more information about the Esplora HTTP API [here](https://github.com/Blockstream/esplora/blob/master/API.md).

This API allows us to obtain the UTXO information we need for our transaction. After the code snippet, we will explain the key elements we require from the transaction data, namely `vout`, `txHex`, and `initialValue`.

```typescript
const EXPLORER = 'https://blockstream.info/testnet';
const TXID = 'ee02b5a12c2f22e892bed376781fc9ed435f0d192a1b67ca47a7190804d8e868';

const txHex = await(await fetch(`${EXPLORER}/api/tx/${TXID}/hex`)).text();
const txJson = await(await fetch(`${EXPLORER}/api/tx/${TXID}`)).json() as {
  vout: { scriptpubkey: string; value: number }[];
};
const txOuts = txJson.vout;
const vout = txOuts.findIndex(
  txOut =>
    txOut.scriptpubkey === descriptorLegacy.getScriptPubKey().toString('hex')
);
const initialValue = txOuts[vout]!.value; //This must be: 1679037
```

With the transaction data fetched, let's understand the role of each key element:

1. `vout`: The output index within the transaction that corresponds to our Legacy address. We find it by searching through the transaction's outputs and matching the `scriptpubkey` to our Legacy descriptor's `scriptPubKey`.
2. `txHex`: The raw transaction data in hexadecimal format.
3. `initialValue`: The number of satoshis in the UTXO we want to spend.

It's important to note that the UTXO we are using here has already been spent by the time you run this code. However, you can still replicate the steps to retrieve the UTXO information and assume that the funds are still present. Keep in mind that the final transaction you create will not be spendable again, but you will be able to construct exactly the same transaction that was originally spent.

## Spending the UTXO

Now that we have the UTXO information, we can create a transaction that spends it.

First, we define the Segwit descriptor where we will move the funds:

```typescript
const descriptorSegwit = new Descriptor({
  expression: wpkhBIP32({ masterNode, network, account: 0, keyPath: '/1/0' }),
  network
});
```

Next, let's create a Partially Signed Bitcoin Transaction (PSBT). PSBT is a standardized format for creating and signing transactions in a multi-step process. This flexible format allows for various use cases, such as when different participants need to sign a transaction in multisig scenarios or when using hardware wallets. While not specifically relevant for this simple example, the PSBT format provides a robust foundation for handling more complex transaction scenarios.

```typescript
const psbt = new Psbt({ network });
```

We use the Legacy descriptor to update the transaction with the input information:

```typescript
const legacyInputNumber = descriptorLegacy.updatePsbt({ psbt, vout, txHex });
```

Now we add our Segwit address as the new output and provide a transaction fee for the miners:

```typescript
const finalValue = initialValue - FEE;
const finalAddress = descriptorSegwit.getAddress();
psbt.addOutput({ address: finalAddress, value: finalValue });
```

To sign the transaction, we use the `signBIP32` method. This method signs the PSBT using the master node (derived from the mnemonic) and the key path specified.

```typescript
descriptors.signers.signBIP32({ psbt, masterNode });
```

After signing the transaction, we need to finalize the input using the `finalizePsbtInput` method. Finalizing the input involves several steps, including adding the scriptSig or scriptWitness. The scriptSig is a part of the transaction input that contains the unlocking script, which proves the ownership of the UTXO being spent. In the case of Segwit transactions, the unlocking script is called the scriptWitness.

Finalizing the input means that all required signatures are present, the scriptSig or scriptWitness has been added, and the input is ready to be included in the transaction. This is an essential step, as it verifies that the transaction is complete and ready for broadcasting.

```typescript
descriptorLegacy.finalizePsbtInput({ psbt, index: legacyInputNumber });
```

Please note that when you try this, the transaction won't be accepted again, as it has already been spent:

```typescript
const spendTx = psbt.extractTransaction();
const spendTxPushResult = await(
  await fetch(`${EXPLORER}/api/tx`, { method: 'POST', body: spendTx.toHex() })
).text();
```

You have now completed the guide on creating a Bitcoin transaction that moves funds from a Legacy address to a Segwit address using the [@bitcoinerlab/descriptors](https://bitcoinerlab.com/modules/descriptors) library.
