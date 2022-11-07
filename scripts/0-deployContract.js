const {
  executeTransaction,
  convert,
  readAppGlobalState,
  balanceOf,
} = require("@algo-builder/algob");
const { types } = require("@algo-builder/web");
const algosdk = require("algosdk");

async function run(runtimeEnv, deployer) {
  const master = deployer.accountsByName.get("master");

  // contract files
  const approvalFile = "vrf_approval.py";
  const clearStateFile = "vrf_clearstate.py";

  // deploy app
  await deployer.deployApp(
    master,
    {
      appName: "VRFApp",
      metaType: types.MetaType.FILE,
      approvalProgramFilename: approvalFile,
      clearProgramFilename: clearStateFile,
      localInts: 0,
      localBytes: 0,
      globalInts: 2,
      globalBytes: 0,
    },
    {}
  );

  // fund app
  const mainApp = deployer.getApp("VRFApp");
  const vestingAddress = mainApp.applicationAccount;

  await deployer.executeTx({
    type: types.TransactionType.TransferAlgo,
    sign: types.SignType.SecretKey,
    fromAccount: master,
    toAccountAddr: mainApp.applicationAccount,
    amountMicroAlgos: 1e6, // 1 algos
    payFlags: { totalFee: 1000 },
  });
}

module.exports = { default: run };
