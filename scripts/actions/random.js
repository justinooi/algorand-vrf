const { executeTransaction, convert } = require("@algo-builder/algob");
const { types } = require("@algo-builder/web");

async function run(runtimeEnv, deployer) {
  const master = deployer.accountsByName.get("master");
  // get app info
  const app = deployer.getApp("VRFApp");

  const appCallArgs = [
    // app call
    convert.stringToBytes("Random"),
    // block round
    convert.uint64ToBigEndian(25366608),
    // user seed
    convert.stringToBytes("NewSeed"),
  ];

  await deployer.executeTx({
    type: types.TransactionType.CallApp,
    sign: types.SignType.SecretKey,
    fromAccount: master,
    appID: app.appID,
    payFlags: { totalFee: 1000 },
    appArgs: appCallArgs,
    foreignApps: [110096026],
  });
}

module.exports = { default: run };
