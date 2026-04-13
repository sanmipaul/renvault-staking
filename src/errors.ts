export interface StakingError {
  code: number;
  message: string;
}

export const ERRORS = {
  ERR_UNAUTHORIZED: { code: 401, message: 'Unauthorized: only contract owner allowed' },
  ERR_INSUFFICIENT_BALANCE: { code: 402, message: 'Insufficient balance for stake' },
  ERR_BELOW_MINIMUM: { code: 404, message: 'Amount below minimum stake requirement' },
  ERR_LOCK_PERIOD_ACTIVE: { code: 405, message: 'Lock period still active, cannot unstake' },
  ERR_NO_REWARDS: { code: 406, message: 'No rewards available to claim' },
  ERR_ZERO_AMOUNT: { code: 408, message: 'Amount must be greater than zero' },
  ERR_EXCEEDS_MAX: { code: 411, message: 'Amount exceeds maximum stake cap' },
} as const satisfies Record<string, StakingError>;

export type ErrorKey = keyof typeof ERRORS;
