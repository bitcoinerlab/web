# Zero-Fee Transactions with TRUC and P2A

Since Bitcoin Core 28 it's possible to get transactions with _effectively zero fees_ mined. Yes, you read that correctly.

In this Playground I'll show you how to build those "zero-fee" transactions and still have them mined, using a combination of **TRUC** transactions, **P2A outputs** and **package relay**.

Before diving into the code, let me explain _why_ this is useful and where it fits in real applications.

---

## Why I Care About This: Pre-Signed Transactions and Vaults

There are situations where Bitcoin apps or services use **pre-signed transactions** whose private keys are later deleted or become unavailable. This shows up in places like the Lightning Network and in covenant-like vaults such as the ones used in [Rewind Bitcoin](https://rewindbitcoin.com).

In the case of Rewind, pre-signed transactions are used as a way to protect funds against extortion or physical attacks. Very roughly, you do something like this:

1. With your normal wallet, you create a transaction that sends the coins you want to protect to a **temporary address**.
   After setup, you delete the private key for that address.

2. Before deleting that key, you create a **pre-signed transaction** that spends from the temporary address and uses Miniscript to encode an output with two possible spending paths:
   - **After some delay** (say, one week), your hot wallet can spend the coins through the first, timelocked branch and use it normally.
   - **Immediately**, by broadcasting another _pre-signed cancellation transaction_ that spends from the second branch and sends the funds to an **emergency address**.

The emergency address is also controlled by you, but it is deliberately hard to access. Think of a seed or key stored in a safety deposit box in another country. The idea is:

- An attacker might force you to reveal your hot wallet seed.
- But they _still_ can't reach the emergency seed because **you yourself** don't have instant access to it. Even if the attacker broadcasts the pre-signed transaction, they can only use the hot-wallet branch and that branch is timelocked. This delay gives you time to react and broadcast the _cancellation pre-signed transaction_, which ultimately moves the funds to your emergency address.

Summing up, your "vaulted funds setup" might look like this:

- Your **normal seed** (hot wallet)
- A set of **pre-signed transactions**
- An **emergency key** stored somewhere very inconvenient to reach

When you legitimately want to unvault your coins, you broadcast the appropriate pre-signed transaction and wait for the timelock to expire.

---

## The Fee Problem with Pre-Signed Transactions

The sharp-eyed reader will immediately see the first problem:

> You need to decide the **fee** for the pre-signed transactions _ahead of time_.

That's hard. You don't know what the fee market will look like in a week, in a month or in a year.

The next natural thought is:

> "No problem, I'll use **CPFP (Child Pays For Parent)**."

You can add an output to the pre-signed transaction that your hot wallet can spend later. By attaching a high-fee child transaction, you increase the **effective feerate** of the parent and miners will be incentivized to include both.

In theory, this works. In practice, with the existing mempool policy for "normal" transactions, this approach was fragile and opened the door to nasty edge cases.

---

## Transaction Pinning (Why CPFP Wasn't Enough)

The core issue is called **transaction pinning** and it's a bit of a rabbit hole. I'll just give an intuitive feel for the problem.

Imagine this flow:

1. You broadcast the pre-signed parent transaction.
2. Your hot wallet adds a child transaction paying a big fee to bump the effective feerate.

So far so good.

Now remember: in a hostile scenario (like an extortion attempt on a Rewind-style vault), the attacker may control your hot wallet too. That attacker can also create children that spend the same output you planned to use for fee bumping.

If the attacker is sophisticated, they can craft a child transaction that makes it **impossible** for you to later create a "better" child that would get your parent mined. There are different ways to do this, but one intuitive example:

- The attacker creates a **huge** child transaction (very large size) with a **very low feerate**, but with a **high absolute fee**.
- Because of how mempool replacement rules work, a new child is only accepted if it pays a _higher total absolute fee_ (not just a higher feerate, but a higher absolute fee!).
- Your honest child would need to pay an even higher _absolute_ fee than this bloated, low-feerate attacker transaction.
- The attacker's child will never be mined (because the feerate is terrible), but **it cannot be replaced** by any child you can reasonably create.

Result: your parent stays stuck in the mempool. Your vault funds are frozen and might never confirm. That's transaction pinning in a nutshell and it's bad news for any design that depends on pre-signed + CPFP mechanics.

---

## Enter TRUC, Packages and P2A in Bitcoin Core 28

To address these issues, people like Gloria Zhao, Gregory Sanders and others have been working on a series of changes to mempool policy and tools.

There's a lot of new machinery in Bitcoin Core 28, but in this Playground I'll focus on one piece of the puzzle that's very relevant for vault-style designs and pre-signed transactions:

- **TRUC (Topologically Restricted Until Confirmation)** v3 transactions
- **1-Parent-1-Child (1P1C) package relay**
- **P2A (Pay To Anchor)** outputs

Very roughly, the new ideas are:

- You can make a _package_ with a parent and a child transaction. With the new rules, if those transactions are **TRUC transactions**, nodes validate them together and either accept both or reject both. So you never end up with a parent stuck by itself.
In short, TRUC transactions are version-3 transactions with a few extra rules attached.

- This 1-Parent-1-Child (1P1C) structure is simple enough that the mempool can avoid the pinning problems described above.

- There's a new special output type called **P2A (Pay To Anchor)**. This output type was introduced in Bitcoin Core v28.0 ([#30352](https://github.com/bitcoin/bitcoin/pull/30352)) and supports zero-value outputs under policy, when used in a package.

- Spending a P2A output in the child is very cheap and compact. It's designed specifically to anchor CPFP fee bumping without needing a full signature.

- The parent in a package can even pay **zero fee**, as long as the **package as a whole** pays a decent effective feerate.

Now that you have some background, let's dive into the actual example and see how to build such a package programmatically. If you don't want to read or run the code, just hit **SHOW PLAYGROUND** and then "Click to start!" to watch it in action.

---

## What You Will Learn

In this guide, you'll learn how to:

- Create and reuse a simple BIP32 software wallet on the [TAPE network](https://tape.rewindbitcoin.com)
- Fund that wallet using a faucet
- Build a **TRUC parent transaction** that:
  - spends an UTXO
  - pays to a normal destination
  - adds a P2A "anchor" output

- Build a **TRUC child transaction** that:
  - spends the P2A anchor and the parent's destination output
  - pays the **actual package fee**

- Submit both transactions together as a **1-parent-1-child (1P1C) package** to a Bitcoin Core 28-style node via Esplora

> **WARNING**: This code is intended solely for educational purposes and has been simplified to the point of excluding essential error handling and security checks. It should never be used in production without extensive review.

---

## Running the Code

You can run the code directly by clicking the **SHOW PLAYGROUND** button on this page or by [installing and running the code locally](https://github.com/bitcoinerlab/playground).

The code automatically:

- Creates or loads a mnemonic-based wallet
- Requests test coins from the TAPE faucet when needed
- Waits for confirmation
- Builds and submits the TRUC + P2A package

You only need to click **"Click to start!"** in the embedded playground.

---

## Setting Up the Demo Wallet and Explorer

The first part of the code creates or loads a **mnemonic wallet** that I keep across runs, both in the browser and in Node:

```ts
let mnemonic; // Let's create a basic wallet:
if (isWeb) {
  mnemonic = localStorage.getItem("p2amnemonic");
  if (!mnemonic) {
    mnemonic = generateMnemonic();
    localStorage.setItem("p2amnemonic", mnemonic);
  }
} else {
  try {
    mnemonic = readFileSync(".p2amnemonic", "utf8");
  } catch {
    mnemonic = generateMnemonic();
    writeFileSync(".p2amnemonic", mnemonic);
  }
}
Log(`🔐 This is your demo wallet (mnemonic):
${mnemonic}

⚠️ Save it only if you want. This is the TAPE testnet. 
Every reload reuses the same mnemonic for convenience.`);
```

- In the browser I store the mnemonic in `localStorage`.
- In Node.js I store it in a `.p2amnemonic` file.
- This is **not** secure, but it's fine for an educational playground.

I then derive a BIP32 master node and a **source address** using a BIP84-style descriptor:

```ts
const masterNode = BIP32.fromSeed(mnemonicToSeedSync(mnemonic), network);
const sourceOutput = new Output({
  descriptor: wpkhBIP32({ masterNode, network, account: 0, keyPath: "/0/0" }),
  network,
});
const sourceAddress = sourceOutput.getAddress();
Log(
  `📫 Source address: <a href="${EXPLORER}/${sourceAddress}" target="_blank">${sourceAddress}</a>`,
);
```

I'll spend from this `sourceAddress` as the initial UTXO.

The code uses `EsploraExplorer` from [`@bitcoinerlab/explorer`](https://bitcoinerlab.com/modules/explorer) to talk to the TAPE Esplora instance:

```ts
const explorer = new EsploraExplorer({ url: ESPLORA_API });
```

This wrapper exposes convenient methods like:

- `fetchAddress(address)`
- `fetchTxHistory({ address })`
- `fetchTx(txId)`

so you don't have to manually call the Esplora HTTP API.

---

## Funding the Wallet with the Faucet

First I ensure the wallet has enough sats to pay the package fee:

```ts
Log(`🔍 Checking existing balance...`);
const sourceAddressInfo = await explorer.fetchAddress(sourceAddress);
Log(`🔍 Wallet balance info: ${JSONf(sourceAddressInfo)}`);
let fundingtTxId;

if (sourceAddressInfo.balance + sourceAddressInfo.unconfirmedBalance < FEE) {
  Log(`💰 The wallet is empty. Let's request some funds...`);
  // Prepare faucet request
  const formData = new URLSearchParams();
  formData.append("address", sourceAddress);
  const faucetRes = await fetch(FAUCET_API, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  });
  // ...
  fundingtTxId = faucetJson.txId;
} else {
  Log(`💰 Existing balance detected. Skipping faucet.`);
  // Find the last transaction that pays to this script
  const txHistory = await explorer.fetchTxHistory({ address: sourceAddress });
  const spkHex = sourceOutput.getScriptPubKey().toString("hex");

  for (const { txId } of txHistory.reverse()) {
    const tx = Transaction.fromHex(await explorer.fetchTx(txId));
    const vout = tx.outs.findIndex((o) => o.script.toString("hex") === spkHex);
    if (vout !== -1) {
      fundingtTxId = txId;
      break;
    }
  }
}
```

Two cases:

1. **Wallet empty**
   I request coins from the TAPE faucet. The faucet returns a `txId`, which becomes the funding transaction.

2. **Wallet already funded**
   I look at the transaction history and pick the last transaction that pays to the current `wpkh` script. That becomes `fundingtTxId`.

### Waiting for Indexing and Confirmation

**TRUC (v3) transactions cannot have unconfirmed ancestors**, except in the single allowed 1-Parent/1-Child (1P1C) package topology (one TRUC parent + one TRUC child). In this example, the TRUC parent spends a wallet's UTXO. Because that UTXO is **not** part of the same 1P1C package, it must already be confirmed before the TRUC parent can be valid.

So, once I have a `fundingtTxId`, I:

1. Fetch the full transaction hex until Esplora has indexed it.

```ts
for (;;) {
  try {
    fundingTxHex = await explorer.fetchTx(fundingtTxId);
    break;
  } catch (err) {
    void err;
    Log(
      `⏳ Waiting for the funding tx <a href="${EXPLORER}/${fundingtTxId}" target="_blank">${fundingtTxId}</a> to be indexed...`,
    );
  }
  await new Promise((r) => setTimeout(r, 1000));
}
```

2. Poll the address until the funding UTXO is **confirmed**.

```ts
let firstAttempt = true;
for (;;) {
  try {
    const sourceAddressInfo = await explorer.fetchAddress(sourceAddress);
    if (
      sourceAddressInfo.unconfirmedBalance === 0 &&
      sourceAddressInfo.balance > 0
    ) {
      Log(
        `🔍 Funding tx <a href="${EXPLORER}/${fundingtTxId}" target="_blank">${fundingtTxId}</a> is confirmed: ${JSONf(sourceAddressInfo)}`,
      );
      break;
    }

    if (firstAttempt === true)
      Log(`

⛓️ TRUC + P2A rules require the funding transaction to be included in a block.
   On the TAPE testnet, blocks are mined every 10 minutes *on the dot*.
   ETA to next block: **${estimateNextTapeBlock()}**

⏳ Waiting for the funding tx 
   <a href="${EXPLORER}/${fundingtTxId}" target="_blank">${fundingtTxId}</a>
   to be confirmed...`);
    else
      Log(
        `⏳ Still waiting for confirmation... next block ETA: ${estimateNextTapeBlock()}`,
      );
  } catch (err) {
    Log(`⏳ Something went wrong while waiting for confirmation: ${err}`);
  }
  await new Promise((r) => setTimeout(r, firstAttempt ? 5000 : 10000));
  firstAttempt = false;
}
```

The helper `estimateNextTapeBlock()` just prints an ETA to the next block, based on the fact that TAPE mines **deterministic blocks every 10 minutes**.

Once the funding tx is confirmed, I have a **confirmed P2WPKH UTXO** to spend in the TRUC parent.

---

## Building the TRUC Parent Transaction (v3 + P2A)

Now I locate the exact output in the funding transaction that pays to `sourceOutput` and build a **TRUC v3 parent** that:

- Spends that confirmed UTXO
- Creates a **P2A anchor output** (vout 0)
- Sends the entire value to a **destination address** (vout 1)
- Pays **zero** fee, leaving the fee to the child

```ts
const fundingTransaction = Transaction.fromHex(fundingTxHex);
const fundingVout = fundingTransaction.outs.findIndex(
  (txOut) =>
    txOut.script.toString("hex") ===
    sourceOutput.getScriptPubKey().toString("hex"),
);
if (!fundingTransaction.outs[fundingVout]) throw new Error("Invalid vout");

const sourceValue = fundingTransaction.outs[fundingVout].value;
Log(`💎 Initial value (sats): ${sourceValue}`);

// Create destination address (account 1)
const destOutput = new Output({
  descriptor: wpkhBIP32({ masterNode, network, account: 1, keyPath: "/0/0" }),
  network,
});
const destValue = sourceValue; // Look ma! no fee!!
```

I then create a **TRUC parent PSBT** and set its version to `3`:

```ts
const parentPsbt = new Psbt({ network });
parentPsbt.setVersion(3);
const parentInputFinalizer = sourceOutput.updatePsbtAsInput({
  psbt: parentPsbt,
  vout: fundingVout,
  txHex: fundingTxHex,
});
parentPsbt.addOutput({ script: P2A_SCRIPT, value: 0 }); // vout: 0
destOutput.updatePsbtAsOutput({ psbt: parentPsbt, value: destValue }); // vout: 1
```

Key points:

- `setVersion(3)` makes this a **TRUC transaction**, subject to the v3 rules.
- `addOutput({ script: P2A_SCRIPT, value: 0 })` creates a **P2A anchor output** at index 0.
- The second output sends **all** the value to a new address (account 1, `/0/0`).
- I intentionally give the parent **zero fee**; the child will pay the fee for the whole package.

Finally, I sign and finalize the parent:

```ts
descriptors.signers.signBIP32({ psbt: parentPsbt, masterNode });
parentInputFinalizer({ psbt: parentPsbt });

const parentTransaction = parentPsbt.extractTransaction();
```

At this point, the parent transaction is:

- Version 3 (TRUC)
- Has a **confirmed** P2WPKH input
- Has two outputs:
  - P2A anchor (vout 0)
  - Normal destination (vout 1)

- Pays zero fee

On its own, this transaction would be rejected by standard feerate rules. But as part of a 1P1C package with a child that overpays the fee, it can be relayed and mined under the new policies.

---

## Building the Child Transaction (Spending P2A + Paying the Fee)

Next I create the **child PSBT**, also v3, that:

1. Spends the **P2A anchor output** (vout 0 of the parent).
2. Spends the **destination output** (vout 1 of the parent).
3. Sends all the value back to the original `sourceAddress`, minus a fee `FEE = 500`.

```ts
const childPsbt = new Psbt({ network });
childPsbt.setVersion(3);

childPsbt.addInput({
  hash: parentTransaction.getId(),
  index: 0,
  witnessUtxo: { script: P2A_SCRIPT, value: 0 },
});
childPsbt.finalizeInput(0, () => ({
  finalScriptSig: Buffer.alloc(0),
  finalScriptWitness: Buffer.from([0x00]), // empty item
}));
```

For the **P2A input**:

- I use `witnessUtxo` with the `P2A_SCRIPT` and value `0`.
- I finalize it with a custom function that returns:
  - An empty `scriptSig`
  - A `finalScriptWitness` containing a single empty stack item

This reflects the **"keyless / signature-less"** nature of P2A: spending it doesn't require a signature, so it's compact and cheap.

Then I add a second input that spends the parent's destination output:

```ts
const childInputFinalizer = destOutput.updatePsbtAsInput({
  psbt: childPsbt,
  vout: 1,
  txHex: parentTransaction.toHex(),
});
```

Finally I send the funds back to the original wallet, minus the fee:

```ts
// Give back the money to ourselves
sourceOutput.updatePsbtAsOutput({ psbt: childPsbt, value: destValue - FEE });
descriptors.signers.signBIP32({ psbt: childPsbt, masterNode });
childInputFinalizer({ psbt: childPsbt });

const childTransaction = childPsbt.extractTransaction();
```

Now the **child transaction**:

- Spends both parent outputs (including the anchor).
- Pays a fee equal to `FEE = 500` sats.
- Returns the remaining sats to the original source address.

From Bitcoin Core's point of view, the **effective feerate** of the package is:

- Total fee of **parent + child**
- Divided by the **combined vsize** of both transactions

Even though the parent is zero-fee, the package as a whole can meet the required feerate.

---

## Submitting the Parent + Child as a Package

The last step is to submit both transactions together as a **1-parent-1-child package** to the Esplora backend (and ultimately to Bitcoin Core's mempool):

```ts
Log(`📦 Submitting parent + child as a package...

Bitcoin Core will validate them together as a 1P1C package.`);
const pkgUrl = `${ESPLORA_API}/txs/package`;
const pkgRes = await fetch(pkgUrl, {
  method: "POST",
  body: JSON.stringify([parentTransaction.toHex(), childTransaction.toHex()]),
});
```

The `/txs/package` endpoint is an Esplora extension that proxies Bitcoin Core's `submitpackage` RPC.

On success, I log the package response and links to both transactions:

```ts
const pkgRespJson = await pkgRes.json();
Log(`📦 Package response: ${JSONf(pkgRespJson)}`);
Log(`
🎉 Hooray! You just executed a TRUC (v3) + P2A fee bump:

🧑‍🍼 Parent tx (yes, the one with *zero fees*): 
  <a href="${EXPLORER}/${parentTransaction.getId()}" target="_blank">${parentTransaction.getId()}</a>

👶 Child tx (pays the actual fee):
  <a href="${EXPLORER}/${childTransaction.getId()}" target="_blank">${childTransaction.getId()}</a>
`);
```

When this works, you get:

- A **TRUC v3 parent** that wouldn't be accepted alone due to zero fee.
- A **TRUC v3 child** that spends the anchor and the main output, paying the necessary fee.
- A **1P1C package** that Bitcoin Core 28 can relay and miners can include, giving you a robust way to fee-bump pre-signed flows without exposing yourself to classic pinning attacks.

---

## Summary

In this guide you:

- Created a simple mnemonic-based wallet on the TAPE network
- Funded it via a faucet
- Built a **TRUC v3 parent transaction** that:
  - Spent a confirmed UTXO
  - Added a **P2A anchor** output
  - Sent funds to a second wallet account with **zero** fees

- Built a **TRUC v3 child transaction** that:
  - Spent both parent outputs (anchor + payment)
  - Returned the funds to your original address, minus the fee

- Submitted both as a **1P1C transaction package** using the Esplora `/txs/package` endpoint

This shows how you can use Bitcoin Core 28's new policies to get **robust fee bumping** with TRUC transactions, compact P2A anchors and 1P1C package relay.

---

## Questions and Issues

If you have questions, run into issues or want to extend this example, feel free to visit the [GitHub repository associated with this guide](https://github.com/bitcoinerlab/playground/) and open an issue. I'll do my best to help.
