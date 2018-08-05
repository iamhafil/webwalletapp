var ErcToken = artifacts.require("./ErcToken.sol");

module.exports = function(deployer) {
  deployer.deploy(ErcToken,1000000);
};
