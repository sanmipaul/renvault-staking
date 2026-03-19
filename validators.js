const { MIN_STAKE_AMOUNT, MAX_STAKE_AMOUNT } = require('./constants');

function validateAmount(amount) {
  if (!amount || amount <= 0) throw new Error('Amount must be greater than zero');
  if (amount < MIN_STAKE_AMOUNT) throw new Error(`Minimum stake is ${MIN_STAKE_AMOUNT} micro-STX`);
  if (amount > MAX_STAKE_AMOUNT) throw new Error(`Maximum stake is ${MAX_STAKE_AMOUNT} micro-STX`);
  return true;
}

function validateAddress(address) {
  if (!address || typeof address !== 'string') throw new Error('Invalid Stacks address');
  if (!address.startsWith('SP') && !address.startsWith('ST')) throw new Error('Address must start with SP (mainnet) or ST (testnet)');
  return true;
}

function validateNetwork(network) {
  if (!['mainnet', 'testnet'].includes(network)) throw new Error('Network must be mainnet or testnet');
  return true;
}

module.exports = { validateAmount, validateAddress, validateNetwork };
