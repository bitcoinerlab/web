# Creating a TimeLocked Vault with Miniscript

This guide will walk you through an example of using the [@bitcoinerlab/descriptors](https://bitcoinerlab.com/modules/descriptors) library to create a Bitcoin TimeLocked Vault.

TimeLocked Vaults can help protect Bitcoin users against extortion and coin theft. Multiple setups are possible.

In this guide, a simple setup is proposed to demonstrate the usage of the `@bitcoinerlab` family of modules. In this setup, the user sends the coins to a UTXO that can only be spent after a certain time in the future.

If the user's wallet is stolen, the user can resort to the "Panic button" analogy. This involves immediately transferring the funds to a very cold storage for safety. The storage could be a Bitcoin address controlled by a private key engraved on a steel plate. This plate might be stored in a bank vault in a different country or somewhere inconvenient to access. The "Panic button" is meant for very low probability events. Additionally, the emergency exit action can be delegated to third parties without risk.

This setup gets weaker as the timelock date approaches, but it serves as an example of how to use this technology. For other, more secure (and complex) TimeLock setups, take a look at this [proposal](https://github.com/bitcoinerlab/farvault-lib).

It is probably a good idea to review the previous guide discussing [Standard Transactions](/guides/standard-transactions) before diving into this one.

## What You Will Learn

In this guide, you will learn how to:

- blah
- blah
- blah

**WARNING**: The code in this guide is intended solely for educational purposes and has been simplified to the point of excluding essential error handling and security checks. It should never be used in production environments without extensive modifications and testing to ensure its safety and reliability.

## Running the Code

You can try out the code right now by clicking on the **SHOW PLAYGROUND** button or by [installing and running the code locally](https://github.com/bitcoinerlab/playground).

## Creating the Wallets

This guide uses two types of wallets:

- A BIP32 wallet using word mnemonics (the typical 12 or 24 secure words protected wallet) is used for unvaulting the TimeLocked funds and successfully spending them after the expiry date.
- A [single key (WIF Wallet)](https://learnmeabitcoin.com/technical/wif) that can immediately unvault the funds at any time and send them to a panic address.

Note that there is no specific requirement for the wallet type to be used. In this guide, we use BIP32 and WIF wallets simply to demonstrate how to use the API of the `@bitcoinerlab/descriptors` library.

This guide can be run both in browser-like environments and in Node.js environments. The code automatically generates the mnemonic-based and WIF wallets described above. The wallets are then stored in either the browser's `localStorage` for browser-based environments or in regular files for Node.js. Storage is implemented so that different instances of the software can be run while maintaining the same wallets. Please note that this is not a secure way to store keys in production, but it serves our purpose for this simple guide:

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

This function returns a policy, given a certain `after` number. A policy is composed of other more basic policies. For example, the primitive `after` policy corresponds to a Bitcoin absolute timelock, which is a condition that prevents a transaction from being spent before a certain `after` block height. `pk` primitive policies require that a public key signs the transaction so that it can be spent. Thus, the policy above means:

> A certain transaction can only be spent either (`or`):
> - unconditionally if `@emergencyKey` signs the transaction
> - `or` if both `@unvaultKey` signs the transaction `and` the blockchain is at or past the `after` block height

## Compiling the Policy into Miniscript

In this section, we'll compile the policy to [Miniscript](https://bitcoin.sipa.be/miniscript/). Miniscript is a language for expressing Bitcoin Scripts in a structured way, enabling analysis, composition, generic signing, and more. The relationship between policies and Miniscript is that policies provide a human-readable way of expressing conditions, while Miniscript offers a machine-readable representation (though very similar to the Policy language) that can be directly translated into Bitcoin Script.


To compile the policy, we need to fetch the current block height from the Blockstream Explorer. This information will be used to set the `after` parameter in the policy.

```typescript
const EXPLORER = 'https://blockstream.info/testnet';
const BLOCKS = 5;
const currentBlockHeight = parseInt(
  await (await fetch(`${EXPLORER}/api/blocks/tip/height`)).text()
);
const after = afterEncode({ blocks: currentBlockHeight + BLOCKS });
Log(`Current block height: ${currentBlockHeight}`);
//Now let's prepare the wsh utxo:
const { miniscript, issane } = compilePolicy(POLICY(after));
if (!issane) throw new Error(`Error: miniscript not sane`);
```

In the code above, we first fetch the current block height from the Blockstream Explorer API. We then set the `after` parameter in the policy by adding a specific number of blocks (`BLOCKS`) to the current block height. Next, we compile the policy into a Miniscript expression using the `compilePolicy` function. We also check if the compiled Miniscript expression is sane, which means it's valid and non-malleable (preventing a third party from modifying an existing script into another valid script, stealthily changing the transaction size). If it's not sane, an error is thrown.

## Generating the TimeLocked Vault Descriptor

In this section, we will generate the TimeLocked Vault and set up two ways to unvault the funds: either by waiting for the timelock to expire or by using the Panic Button analogy. The following code will be used for this purpose:

```typescript
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
const wshExpression = `wsh(${miniscript
  .replace(
    '@unvaultKey',
    descriptors.keyExpressionBIP32({
      masterNode: unvaultMasterNode,
      originPath: WSH_ORIGIN_PATH,
      keyPath: WSH_KEY_PATH
    })
  )
  .replace('@emergencyKey', emergencyPair.publicKey.toString('hex'))})`;
const wshDescriptor = new Descriptor({
  expression: wshExpression,
  network,
  signersPubKeys: [EMERGENCY_RECOVERY ? emergencyPair.publicKey : unvaultKey]
});
```

In the code above:

1. We derive the public key for the unvaulting wallet using the unvault master node and the specified derivation path. The unvaulting wallet is the one that can be used to spend the locked UTXO after the timelock expires.

2. We replace the placeholders in the Miniscript with the appropriate key expressions for the unvault and emergency keys.

3. We create a new descriptor object with the updated Miniscript expression. A [Bitcoin descriptor](https://github.com/bitcoin/bitcoin/blob/master/doc/descriptors.md) is a method for describing the rules and conditions required to spend an output in a transaction. The `@bitcoinerlab/descriptors` library enables parsing and creating Bitcoin Descriptors, including those using Miniscript.

The descriptor above describes a Witness Script Hash (WSH) output. WSH outputs in Bitcoin transactions allow the use of arbitrary scripts, in contrast to standard transaction types. This flexibility enables complex spending conditions and advanced use cases such as multi-signature transactions and timelocked transactions. Descriptors with `wsh` top-level expressions can enclose `miniscript` expressions that are then converted to Bitcoin Scripts, as described in the [Bitcoin core repository](https://github.com/bitcoin/bitcoin/blob/master/doc/descriptors.md#reference).

The `wsh` descriptor used in this guide will look something like this:
`wsh(andor(pk([7ab7a6e7/69420'/1'/0']tpubDD3MSqHCE9VUvUALHFUTr7y5Fuvp8S1Qu4CTiDiD6tBtjk6pjJHqc71LnJb4xHszoHFcGut4erbHFockGfuNYAtzGucWZvRTgHY3RVGtv38/0/0),after(2425654),pk(0316d4e17fe531498b8de6ef9d1f261e5face40d4110e3a25b2df6c340ac601744)))`, where:
`[7ab7a6e7/69420'/1'/0']tpubDD3MSqHCE9VUvUALHFUTr7y5Fuvp8S1Qu4CTiDiD6tBtjk6pjJHqc71LnJb4xHszoHFcGut4erbHFockGfuNYAtzGucWZvRTgHY3RVGtv38/0/0` is a BIP32 key expression (the one used for the unvault) and,
 `0316d4e17fe531498b8de6ef9d1f261e5face40d4110e3a25b2df6c340ac601744` is a bare public key (the one used as an emergency exit).


If a descriptor has multiple spending paths, the user must set which is the one that has to be used. To do so, an array of the available `signersPubKeys` must be passed to the descriptor. The corresponding unlocking script (the script witness, in this case) will be computed from this information. 
Note that in order to test different configurations, you can set `EMERGENCY_RECOVERY` variable to `true` or `false` back and forth.

## Funding and Spending the TimeLocked Vault

In the previous section, we generated a TimeLocked Vault using Miniscript and created a descriptor for a WSH output. Now, we will fund the TimeLocked Vault and spend the funds either when the timelock expires or using the "Panic Button" analogy.

```typescript
const wshAddress = wshDescriptor.getAddress();
Log(`Fund your vault. Let's first check if it's been already funded...`);
const utxo = await (
  await fetch(`${EXPLORER}/api/address/${wshAddress}/utxo`)
).json();
if (utxo?.[0]) {
  Log(`Successfully funded. Now let's spend the funds.`);
  const txHex = await (
    await fetch(`${EXPLORER}/api/tx/${utxo?.[0].txid}/hex`)
  ).text();
  const inputValue = utxo[0].value;
  const psbt = new Psbt({ network });
  wshDescriptor.updatePsbt({ psbt, txHex, vout: utxo[0].vout });
  //Send funds to any address: "abandon^11 about" mnemonic 1st/2nd pkh address
  //Be nice. Give the miners 1000 sats :)
  psbt.addOutput({
    address: EMERGENCY_RECOVERY
      ? 'mkpZhYtJu2r87Js3pDiWJDmPte2NRZ8bJV'
      : 'mzpbWabUQm1w8ijuJnAof5eiSTep27deVH',
    value: inputValue - 1000
  });

  //Now sign the PSBT with the BIP32 node (the software wallet)
  if (EMERGENCY_RECOVERY)
    descriptors.signers.signECPair({ psbt, ecpair: emergencyPair });
  else descriptors.signers.signBIP32({ psbt, masterNode: unvaultMasterNode });
  //Finalize the tx (compute & add the scriptWitness) & push to the blockchain
  wshDescriptor.finalizePsbtInput({ index: 0, psbt });
  const spendTx = psbt.extractTransaction();
  const spendTxPushResult = await (
    await fetch(`${EXPLORER}/api/tx`, {
      method: 'POST',
      body: spendTx.toHex()
    })
  ).text();
  Log(`Pushing: ${spendTx.toHex()}`);
  Log(`Tx pushed with result: ${spendTxPushResult}`);
  //You may get non-bip68 final now. You need to wait 5 blocks.
  if (
    spendTxPushResult.match('non-BIP68-final') ||
    spendTxPushResult.match('non-final')
  ) {
    Log(`This means it's still TimeLocked and miners rejected the tx.`);
    Log(`<a href="javascript:start();">Try again in a few blocks!</a>`);
  } else {
    const txId = spendTx.getId();
    Log(`Success. <a href="${EXPLORER}/tx/${txId}?expand">Check it!</a>`);
  }
} else {
  Log(`Not yet! Use https://bitcoinfaucet.uo1.net to send some sats to:`);
  Log(`${wshAddress} Fund it & <a href="javascript:start()">check again</a>`);
}
```

In the code above, we check if the TimeLocked Vault has already been funded by querying its address balance on the blockchain. If it's already been funded, we proceed with spending the funds.

First, we fetch the transaction hex and input value for the funded output. We then create a partially-signed Bitcoin transaction (PSBT) object and add an output to send the funds to a specified address. We subtract 1000 satoshis from the input value to account for transaction fees.

Next, we sign the PSBT using either the unvault master node or the emergency recovery key, depending on the `EMERGENCY_RECOVERY` variable. We then finalize the PSBT input by computing and adding the script witness, and push the signed transaction to the blockchain.

After pushing the transaction, we check if it was accepted by the network or rejected due to it being non final. If the transaction was rejected, we inform the user that they need to wait 5 blocks before trying again. If the transaction was successful, we display a link to the transaction on the blockchain explorer for verification.

If the TimeLocked Vault has not yet been funded, we inform the user that they can use the Bitcoin faucet at https://bitcoinfaucet.uo1.net to fund the address and provide the address for funding. Once the address has been funded, the user can restart the process by clicking the link provided or by runnig again the Node.js script.

Overall, this code block allows the user to fund and spend from a TimeLocked Vault in a secure and controlled manner.
