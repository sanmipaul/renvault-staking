import { MIN_STAKE_AMOUNT, MAX_STAKE_AMOUNT } from './constants.js';

/**
 * Validates that `amount` is a positive integer within the allowed stake range.
 * Throws on failure; returns `true` on success.
 */
export function validateAmount(amount: number): true {
  if (!amount || amount <= 0) throw new Error('Amount must be greater than zero');
  if (amount < MIN_STAKE_AMOUNT) throw new Error(`Minimum stake is ${MIN_STAKE_AMOUNT} micro-STX`);
  if (amount > MAX_STAKE_AMOUNT) throw new Error(`Maximum stake is ${MAX_STAKE_AMOUNT} micro-STX`);
  return true;
}

/**
 * Validates that `address` is a well-formed Stacks address (SP* or ST*).
 * Throws on failure; returns `true` on success.
 */
export function validateAddress(address: string): true {
  if (!address || typeof address !== 'string') throw new Error('Invalid Stacks address');
  if (!address.startsWith('SP') && !address.startsWith('ST')) {
    throw new Error('Address must start with SP (mainnet) or ST (testnet)');
  }
  return true;
}

/**
 * Validates that `network` is one of the supported network identifiers.
 * Throws on failure; returns `true` on success.
 */
export function validateNetwork(network: string): true {
  if (!['mainnet', 'testnet'].includes(network)) {
    throw new Error('Network must be mainnet or testnet');
  }
  return true;
}
