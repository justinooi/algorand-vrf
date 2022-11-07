const algosdk = require("algosdk");
const fs = require("fs");
require("dotenv").config();

// settings for testnet & account
const creator = algosdk.mnemonicToSecretKey(process.env.CREATOR_MNEMONIC);
const testnet_oracle_app_id = 110096026;
const baseServer = "https://testnet-algorand.api.purestake.io/ps2";
const port = "";
const token = {
  "X-API-Key": "GNDEMDaDNa9tyYmIFagPfsZM4KEpRX7iq7LXMCc0",
};

// change this to set the block round to use
const BLOCK_TO_USE = 25297186;

// read ABI file from contract using Beaker
const buff = fs.readFileSync("contract.json");

// use atc to call multiple times to get several seeds to compare
const atc = new algosdk.AtomicTransactionComposer();

// create client & abi
const algodClient = new algosdk.Algodv2(token, baseServer, port);
const contract = new algosdk.ABIContract(JSON.parse(buff.toString()));

// utility function for ABI to retrieve method
function getMethodByName(name) {
  const m = contract.methods.find((mt) => {
    return mt.name == name;
  });
  if (m === undefined) throw Error("Method undefined: " + name);
  return m;
}

(async () => {
  // Get suggested params from the client
  const sp = await algodClient.getTransactionParams().do();

  const commonParams = {
    appID: testnet_oracle_app_id,
    sender: creator.addr,
    suggestedParams: sp,
    signer: algosdk.makeBasicAccountTransactionSigner(creator),
  };

  // create two user seeds for the same block
  let first_txn_args = new Uint8Array(Buffer.from("seed1"));
  let second_txn_args = new Uint8Array(Buffer.from("seed2"));

  // create two txns using same block but different seed
  atc.addMethodCall({
    method: getMethodByName("get"),
    methodArgs: [BLOCK_TO_USE, first_txn_args],
    ...commonParams,
  });
  atc.addMethodCall({
    method: getMethodByName("get"),
    methodArgs: [BLOCK_TO_USE, second_txn_args],
    ...commonParams,
  });

  // check results
  const result = await atc.execute(algodClient, 10);
  for (const idx in result.methodResults) {
    // convert byte array to number (this might be wrong)
    let raw_value = result.methodResults[idx].returnValue;
    let buffer = Buffer.from(raw_value);
    var number = buffer.readBigUInt64BE(0);

    console.log(`Txn ${idx}'s random number:`, number);
  }
})();
