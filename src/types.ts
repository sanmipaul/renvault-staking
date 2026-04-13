export interface StakeResult {
  success: boolean;
  newStake: number;
  totalStaked: number;
  lockUntil: number;
}

export interface UnstakeResult {
  success: boolean;
  unstaked: number;
  remainingStake: number;
  totalStaked: number;
}

export interface ClaimResult {
  success: boolean;
  claimed: number;
  totalRewards: number;
}

export interface StakeInfo {
  stake: number;
  rewards: number;
  pendingRewards: number;
  stakeTime: number;
  lockUntil: number;
  isLocked: boolean;
}

export interface GlobalStats {
  totalStaked: number;
  totalUsers: number;
  averageStake: number;
  totalRewards: number;
  rewardRate: number;
  minStake: number;
  lockPeriod: number;
}

export interface TopStaker {
  address: string;
  stake: number;
  rewards: number;
  pendingRewards: number;
}

export interface StakingReturns {
  stakeAmount: number;
  stakingDays: number;
  rewardRate: number;
  simpleYield: number;
  compoundYield: number;
  apy: number;
  totalSimple: number;
  totalCompound: number;
  dailyReward: number;
}

export interface BreakEvenResult {
  stakeAmount: number;
  gasCosts: number;
  dailyReward: number;
  breakEvenDays: number;
  breakEvenWeeks: number;
  breakEvenMonths: number;
}

export interface OptimalPeriodResult {
  stakeAmount: number;
  targetReturn: number;
  targetYield: number;
  optimalDays: number;
  optimalWeeks: number;
  optimalMonths: number;
  optimalYears: number;
}

export interface StakingOption {
  name: string;
  rewardRate: number;
  lockPeriod: number;
}

export interface RiskAdjustedReturn {
  baseReturn: StakingReturns;
  adjustedReturn: StakingReturns;
  riskFactor: number;
  riskPremium: number;
}

export interface YieldProjectionPoint {
  day: number;
  month: number;
  totalValue: number;
  yield: number;
  apy: number;
}

export interface Recommendation {
  recommendation: string;
  riskLevel: string;
  stakeAmount: number;
  stakingDays: number;
  rewardRate: number;
  simpleYield: number;
  compoundYield: number;
  apy: number;
  totalSimple: number;
  totalCompound: number;
  dailyReward: number;
}

export interface DistributionDetail {
  staker: string;
  amount: number;
  success: boolean;
  error?: string;
}

export interface Distribution {
  timestamp: number;
  totalDistributed: number;
  recipients: number;
  details: DistributionDetail[];
}

export interface DistributionStats {
  totalDistributions: number;
  totalDistributed: number;
  totalRecipients: number;
  averageDistribution: number;
  lastDistribution: number | null;
}

export interface DistributorStatus {
  isRunning: boolean;
  distributionInterval: number;
  nextDistribution: number | null;
  totalDistributions: number;
  stats: DistributionStats;
}

export type RiskTolerance = 'low' | 'medium' | 'high';
