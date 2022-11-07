const { executeTransaction, convert } = require("@algo-builder/algob");
const { types } = require("@algo-builder/web");

async function run(runtimeEnv, deployer) {
  const master = deployer.accountsByName.get("master");
  // get app info
  const approvalFile = "vrf_approval.py";
  const clearStateFile = "vrf_clearstate.py";
  const app = deployer.getApp("VRFApp");

  const appCallArgs = [
    convert.stringToBytes("Random"),
    convert.uint64ToBigEndian(2529800),
    convert.stringToBytes("Test"),
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
