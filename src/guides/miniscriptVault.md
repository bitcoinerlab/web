# Creating a Timelocked Vault with Miniscript

This guide will walk you through an example of using [@bitcoinerlab libraries](https://bitcoinerlab.com/modules) to create a Bitcoin timelocked Vault.

Timelocked Vaults can help protect Bitcoin users against extortion and coin theft. Multiple setups are possible.

In this guide, a streamlined setup is proposed to illustrate the application of the `@bitcoinerlab` suite of modules. Here, the user generates a transaction that transfers coins to a designated address, creating an unspent transaction output (UTXO) subject to a timelock. Consequently, the UTXO remains unspendable until a specified future time.

If a user's wallet is compromised, they can employ the "Panic Button" strategy to safeguard their assets. This entails promptly relocating the funds to an ultra-secure cold storage, which must be highly inconvenient to access, before the timelock expires, preventing unauthorized access. In this sense, while it serves as a last-resort measure, the ultra-secure storage ensures the funds' safety as the attacker is virtually unable to access them, even though it will be quite inconvenient for the user as well. This storage option could be an alternative Bitcoin address managed by a private key securely stored in a remote vault in another country, for instance, ultimately accessible for the user while presenting an insurmountable obstacle for the attacker.

An additional layer of security can be achieved by delegating the emergency exit action to third parties, without the need for trust. This can be done by providing them access to pre-signed transactions, specifically those that would transfer funds to the ultra-secure cold storage. Since these transactions are pre-signed, the third party cannot alter the transaction details or spend the funds, ensuring the user's safety. This approach further strengthens the protection of the user's assets while maintaining control over the funds' destination, even during an emergency.

This setup gets weaker as the timelock date approaches, but it serves as an example of how to use this technology. For other, more secure (and complex) timelock setups, take a look at this [proposal](https://github.com/bitcoinerlab/farvault-lib).

It is probably a good idea to review the previous guide discussing [Standard Transactions](/guides/standard-transactions) before diving into this one.

## What You Will Learn

In this guide, you will learn how to:

- How to generate and use Bitcoin BIP32 Wallets and deriving addresses
- How to generate and use Bitcoin WIF keys (single keys)
- What is Miniscript and how to use it to create a vault
- How to create and sign a Partially Signed Bitcoin Transaction (PSBT) to spend from the vault
- How to finalize and push the PSBT to the Bitcoin network

**WARNING**: The code in this guide is intended solely for educational purposes and has been simplified to the point of excluding essential error handling and security checks. It should never be used in production environments without extensive modifications and testing to ensure its safety and reliability.

## Running the Code

You can try out the code right now by clicking on the **SHOW PLAYGROUND** button or by [installing and running the code locally](https://github.com/bitcoinerlab/playground).

## Creating the Wallets

This guide uses two types of wallets:

- A BIP32 wallet using word mnemonics (the typical 12 or 24 secure words) is used for unvaulting the timelocked funds and successfully spending them after the expiry date.
- A [single key (WIF Wallet)](https://learnmeabitcoin.com/technical/wif) that can immediately unvault the funds at any time and send them to a panic address.

Note that there is no specific requirement for the wallet type to be used. In this guide, we use BIP32 and WIF wallets simply to demonstrate how to use the API of the `@bitcoinerlab/descriptors` library.

This guide can be run both in browser-like environments and in Node.js environments. The code automatically generates the mnemonic-based and WIF wallets described above. The wallets are then stored in either the browser's `localStorage` for browser-based environments or in regular files for Node.js. Storage is implemented so that different instances of the software can be run while maintaining the same wallets. Please note that this method is not secure for storing keys in production but is suitable for demonstrating the usage of the libraries in this example:

```typescript
if (isWeb) {
  const emergencyWIF = localStorage.getItem('emergencyWIF');
  unvaultMnemonic = localStorage.getItem('unvaultMnemonic');
  if (!emergencyWIF || !unvaultMnemonic) {
    emergencyPair = ECPair.makeRandom();
    unvaultMnemonic = generateMnemonic();
    localStorage.setItem('emergencyWIF', emergencyPair.toWIF());
    localStorage.setItem('unvaultMnemonic', unvaultMnemonic);
  } else emergencyPair = ECPair.fromWIF(emergencyWIF);
} else {
  try {
    emergencyPair = ECPair.fromWIF(readFileSync('.emergencyWIF', 'utf8'));
    unvaultMnemonic = readFileSync('.unvaultMnemonic', 'utf8');
  } catch {
    emergencyPair = ECPair.makeRandom();
    unvaultMnemonic = generateMnemonic();
    writeFileSync('.emergencyWIF', emergencyPair.toWIF());
    writeFileSync('.unvaultMnemonic', unvaultMnemonic);
  }
}
```

## Preparing the Vault Policy

In order to express the Vault operation, we use the [Policy language](https://bitcoin.sipa.be/miniscript/) proposed by Pieter Wuille et al. The Policy language is very straightforward and easy to understand. For example, this is the Policy of the Vault described above:

```typescript
const POLICY = (after: number) =>
  `or(pk(@emergencyKey),and(pk(@unvaultKey),after(${after})))`;
```

This function returns a policy, given a certain `after` number. A policy is composed of other more basic policies. For example, the primitive `after` policy corresponds to a Bitcoin absolute timelock, which is a condition that prevents a UTXO from being spent before a certain block height. On the other hand, `pk` primitive policies require that a public key signs the transaction so that it can be spent. Thus, the policy above means:

> A certain transaction can only be spent either (`or`):
> - unconditionally if `@emergencyKey` signs the transaction
> - `or` if both `@unvaultKey` signs the transaction `and` the blockchain is at or past the `after` block height

## Compiling the Policy into Miniscript

In this section, we'll compile the policy to [Miniscript](https://bitcoin.sipa.be/miniscript/). Miniscript is a language for expressing Bitcoin Scripts in a structured way, enabling analysis, composition, generic signing, and more. The relationship between policies and Miniscript is that policies provide a human-readable way of expressing conditions, while Miniscript offers a machine-readable representation (though very similar to the Policy language) that can be directly translated into Bitcoin Script.

To compile the policy, we will fetch the current block height from the TAPE Esplora API. This information will be used to set the `after` parameter in the policy.

```typescript
const EXPLORER = 'https://tape.rewindbitcoin.com/explorer';
const ESPLORA_API = 'https://tape.rewindbitcoin.com/api';
const BLOCKS = 5;
const currentBlockHeight = parseInt(
  await(await fetch(`${ESPLORA_API}/blocks/tip/height`)).text()
);
const after = afterEncode({ blocks: currentBlockHeight + BLOCKS });
Log(`Current block height: ${currentBlockHeight}`);
//Now let's prepare the wsh utxo:
const { miniscript, issane } = compilePolicy(POLICY(after));
if (!issane) throw new Error(`Error: miniscript not sane`);
```

In the code above, we first fetch the current block height from the TAPE Esplora API. We then set the `after` parameter in the policy by adding a specific number of blocks (`BLOCKS`) to the current block height. Next, we compile the policy into a Miniscript expression using the `compilePolicy` function. We also check if the compiled Miniscript expression is sane, which means it's valid and non-malleable (preventing a third party from modifying an existing script into another valid script, stealthily changing the transaction size). If it's not sane, an error is thrown.

## Generating the Timelocked Vault Descriptor

In this section, we will generate the timelocked Vault and set up two ways to unvault the funds: either by waiting for the timelock to expire or by using the Panic Button analogy. The following code will be used for this purpose:

```typescript
import { toHex } from 'uint8array-tools';

const EMERGENCY_RECOVERY = false; //Set it to true to use the "Panic Button"

const WSH_ORIGIN_PATH = `/69420'/1'/0'`; //This can be any path you like.
const WSH_KEY_PATH = `/0/0`; //Choose any path you like.
const unvaultMasterNode = BIP32.fromSeed(
  mnemonicToSeedSync(unvaultMnemonic),
  network
);
const unvaultKey = unvaultMasterNode.derivePath(
  `m${WSH_ORIGIN_PATH}${WSH_KEY_PATH}`
).publicKey;
const wshDescriptor = `wsh(${miniscript
  .replace(
    '@unvaultKey',
    descriptors.keyExpressionBIP32({
      masterNode: unvaultMasterNode,
      originPath: WSH_ORIGIN_PATH,
      keyPath: WSH_KEY_PATH
    })
  )
  .replace('@emergencyKey', toHex(emergencyPair.publicKey))})`;
const wshOutput = new Output({
  descriptor: wshDescriptor,
  network,
  signersPubKeys: [EMERGENCY_RECOVERY ? emergencyPair.publicKey : unvaultKey]
});
```

In the code above:

1. We derive the public key for the unvaulting wallet using the unvault master node and the specified derivation path. The unvaulting wallet is the one that can be used to spend the locked UTXO after the timelock expires.

2. We replace the `@unvaultKey` and `@emergencyKey` placeholders in the `wshDescriptor` with their appropriate key expressions (`toHex` from `uint8array-tools` is used for raw key bytes). The `wshDescriptor` is a structured format that describes the rules and conditions required to spend an output in a transaction. This format is called a **Bitcoin descriptor** and is specified in the [Bitcoin Core documentation](https://github.com/bitcoin/bitcoin/blob/master/doc/descriptors.md).

3. We create a new descriptor object with the updated expression.

**Tip:** The descriptor above describes a Witness Script Hash (WSH) output. WSH outputs in Bitcoin transactions allow the use of arbitrary scripts, in contrast to standard transaction types. This flexibility enables complex spending conditions and advanced use cases such as multi-signature transactions and timelocked transactions. Descriptors with `wsh` top-level expressions can enclose `miniscript` expressions that are then converted to Bitcoin Scripts, as described in the [Bitcoin core repository](https://github.com/bitcoin/bitcoin/blob/master/doc/descriptors.md#reference).

The `wsh` descriptor used in this guide will look something like this:
`wsh(andor(pk([7ab7a6e7/69420'/1'/0']tpubDD3MSqHCE9VUvUALHFUTr7y5Fuvp8S1Qu4CTiDiD6tBtjk6pjJHqc71LnJb4xHszoHFcGut4erbHFockGfuNYAtzGucWZvRTgHY3RVGtv38/0/0),after(2425654),pk(0316d4e17fe531498b8de6ef9d1f261e5face40d4110e3a25b2df6c340ac601744)))`, where:
`[7ab7a6e7/69420'/1'/0']tpubDD3MSqHCE9VUvUALHFUTr7y5Fuvp8S1Qu4CTiDiD6tBtjk6pjJHqc71LnJb4xHszoHFcGut4erbHFockGfuNYAtzGucWZvRTgHY3RVGtv38/0/0` is a BIP32 key expression (the one used for the unvault) and,
`0316d4e17fe531498b8de6ef9d1f261e5face40d4110e3a25b2df6c340ac601744` is a bare public key expression (the one used as an emergency exit).

The last part to explain from the code block above is that when a descriptor has multiple spending paths, the user needs to set which one to use. This is done by passing the public keys that will be used to sign the transaction using the variable `signersPubKeys`. The corresponding unlocking script (the script witness, in this case) will be computed later from this information when finalizing the transaction.
Note that in order to test different configurations, you can set `EMERGENCY_RECOVERY` variable to `true` or `false` back and forth.

## Funding the Timelocked Vault

In the previous section, we generated a timelocked Vault using Miniscript and created a descriptor for a WSH output. Now, we will fund the timelocked Vault.

```typescript
const wshAddress = wshOutput.getAddress();
Log(`Fund your vault. Let's first check if it's been already funded...`);
const utxo = await(
  await fetch(`${ESPLORA_API}/address/${wshAddress}/utxo`)
).json();
if (utxo?.[0]) {
  Log(`Successfully funded. Now let's spend the funds.`);
  //...
} else {
  Log(`Not yet! Use https://tape.rewindbitcoin.com to send some sats to:`);
  Log(`${wshAddress} Fund it & <a href="javascript:start()">check again</a>`);
}
```

In the code above, we retrieve the Bitcoin address corresponding to the WSH descriptor we created earlier, and then check if the corresponding UTXO has already been funded. If it has not, we inform the user that they can use the TAPE faucet at https://tape.rewindbitcoin.com to send some sats to the address. Once the address has been funded, the user can restart the process by clicking the link provided or by running the Node.js script again.

## Spending the Transaction using a PSBT

If the corresponding UTXO has been funded, we can proceed to show how to spend the transaction. As explained earlier, there are two ways to spend the transaction - by waiting for the expiration of the timelock or by using the analogy of a "Panic Button". This behavior can be controlled with the `EMERGENCY_RECOVERY` variable:

```typescript
Log(`Successfully funded. Now let's spend the funds.`);
const txHex = await(
  await fetch(`${ESPLORA_API}/tx/${utxo?.[0].txid}/hex`)
).text();
const inputValue = BigInt(utxo[0].value);
const psbt = new Psbt({ network });
const inputFinalizer = wshOutput.updatePsbtAsInput({ psbt, txHex, vout: utxo[0].vout });
//For the purpose of this guide, we add an output to send funds to hardcoded
//addresses, which we don't care about, just to show how to use the API. Don't
//forget to account for transaction fees!
new Output({
  descriptor: `addr(${
    EMERGENCY_RECOVERY
      ? 'bcrt1qn9v3ltz5vw637k0t28qt3jfrksyfvnsyxhl5mf'
      : 'bcrt1qfz7vd3yxx0dcgdse36k4r66frhh4dkzpn3c3wx'
  })`,
  network
}).updatePsbtAsOutput({ psbt, value: inputValue - 1000n });
```

In the code above, we make use of Partially Signed Bitcoin Transactions (PSBT)s to create the spending transaction. PSBTs come in handy when working with descriptors, especially when using scripts, because they allow multiple parties to collaborate in the signing process. This is particularly useful for [more complex scenarios](/guides/ledger-programming) than the one in this guide.

We subtract 1000 satoshis from the input value to account for transaction mining fees and set up the PSBT by using `updatePsbtAsInput`, which sets up the descriptor as one of its input. We then add an output to the PSBT that will send the funds to a certain hardcoded address that we don't care about, just for the purposes of demonstrating how to use the library API.

Note that `updatePsbtAsInput` returns a finalizer function. We will use this method in the following section.

## Signing, Finalizing and Pushing the PSBT

After constructing the PSBT, we need to sign it using either the unvault master node or the emergency recovery key, depending on the `EMERGENCY_RECOVERY` variable.

```typescript
//Now sign the PSBT with the BIP32 node (the software wallet)
if (EMERGENCY_RECOVERY)
  descriptors.signers.signECPair({ psbt, ecpair: emergencyPair });
else descriptors.signers.signBIP32({ psbt, masterNode: unvaultMasterNode });
```

The above code block signs the PSBT with the appropriate key. Once the PSBT is signed, we can finalize the input:

```typescript
//Finalize the tx (compute & add the scriptWitness) & push to the blockchain
inputFinalizer({ psbt });
const spendTx = psbt.extractTransaction();
const spendTxPushResult = await(
  await fetch(`${ESPLORA_API}/tx`, {
    method: 'POST',
    body: spendTx.toHex()
  })
).text();
```

The code above finalizes the input using the `inputFinalizer` method. Finalizing the input involves adding the `scriptSig` or `scriptWitness` (in the case of Segwit), which is necessary to prove ownership of the UTXO being spent. This is an essential step, as it verifies that the transaction is complete and ready for broadcasting.

The `inputFinalizer` method will provide different solutions depending on the `signersPubKeys` signaled when creating the descriptor object.

After finalizing the input, we only need to push the transaction to the Bitcoin network. Once done, we check if it was accepted or rejected due to it being non-final. Miners will reject a transaction with a 'non-final' error if the timelock is not respected. If the transaction was rejected, we inform the user that they need to wait 5 blocks before trying again. If the transaction was successful, we display a link to the transaction on the blockchain explorer for verification.

Here is the code:

```typescript
Log(`Pushing: ${spendTx.toHex()}`);
Log(`Tx pushed with result: ${spendTxPushResult}`);
//You may get non-bip68 final now. You need to wait 5 blocks.
if (
  spendTxPushResult.match('non-BIP68-final') ||
  spendTxPushResult.match('non-final')
) {
  Log(`This means it's still timelocked and miners rejected the tx.`);
  Log(`<a href="javascript:start();">Try again in a few blocks!</a>`);
} else {
  const txId = spendTx.getId();
  Log(`Success. <a href="${EXPLORER}/tx/${txId}?expand">Check it!</a>`);
}
```

## Questions and Issues

Congratulations on completing this guide! We hope that you found it informative and useful in your journey to learn more about Bitcoin development. If you have any questions or issues, please feel free to visit the [GitHub repository associated with this guide](https://github.com/bitcoinerlab/playground/), where you can open an issue and we'll try our best to help you out.
