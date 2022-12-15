const Cities = artifacts.require("Cities");

module.exports = function (deployer) {
  deployer.deploy(Cities);
};
