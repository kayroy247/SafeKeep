const SafeKeep = artifacts.require("SafeKeep");

module.exports = async function (deployer) {
  deployer.deploy(SafeKeep);
  const safeKeep = await SafeKeep.deployed();
};