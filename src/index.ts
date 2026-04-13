export { StakingManager } from './stakingManager.js';
export { YieldCalculator } from './yieldCalculator.js';
export { RewardsDistributor } from './rewardsDistributor.js';
export { StakingAPI } from './stakingAPI.js';
export { ERRORS } from './errors.js';
export { validateAmount, validateAddress, validateNetwork } from './validators.js';
export {
  MIN_STAKE_AMOUNT,
  MAX_STAKE_AMOUNT,
  DEFAULT_LOCK_PERIOD,
  REWARD_RATE_DENOMINATOR,
  CONTRACT_NAME,
} from './constants.js';

export type {
  StakeResult,
  UnstakeResult,
  ClaimResult,
  StakeInfo,
  GlobalStats,
  TopStaker,
  StakingReturns,
  BreakEvenResult,
  OptimalPeriodResult,
  StakingOption,
  RiskAdjustedReturn,
  YieldProjectionPoint,
  Recommendation,
  Distribution,
  DistributionStats,
  DistributorStatus,
  DistributionDetail,
  RiskTolerance,
} from './types.js';
export type { StakingError, ErrorKey } from './errors.js';
