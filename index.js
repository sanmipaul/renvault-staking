const stakingManager = require('./stakingManager');
const yieldCalculator = require('./yieldCalculator');
const rewardsDistributor = require('./rewardsDistributor');
const stakingAPI = require('./stakingAPI');
const { ERRORS } = require('./errors');
const { validateAmount, validateAddress, validateNetwork } = require('./validators');
const constants = require('./constants');

module.exports = {
  stakingManager,
  yieldCalculator,
  rewardsDistributor,
  stakingAPI,
  ERRORS,
  validateAmount,
  validateAddress,
  validateNetwork,
  ...constants,
};
