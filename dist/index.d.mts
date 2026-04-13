import { Application } from 'express';

interface StakeResult {
    success: boolean;
    newStake: number;
    totalStaked: number;
    lockUntil: number;
}
interface UnstakeResult {
    success: boolean;
    unstaked: number;
    remainingStake: number;
    totalStaked: number;
}
interface ClaimResult {
    success: boolean;
    claimed: number;
    totalRewards: number;
}
interface StakeInfo {
    stake: number;
    rewards: number;
    pendingRewards: number;
    stakeTime: number;
    lockUntil: number;
    isLocked: boolean;
}
interface GlobalStats {
    totalStaked: number;
    totalUsers: number;
    averageStake: number;
    totalRewards: number;
    rewardRate: number;
    minStake: number;
    lockPeriod: number;
}
interface TopStaker {
    address: string;
    stake: number;
    rewards: number;
    pendingRewards: number;
}
interface StakingReturns {
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
interface BreakEvenResult {
    stakeAmount: number;
    gasCosts: number;
    dailyReward: number;
    breakEvenDays: number;
    breakEvenWeeks: number;
    breakEvenMonths: number;
}
interface OptimalPeriodResult {
    stakeAmount: number;
    targetReturn: number;
    targetYield: number;
    optimalDays: number;
    optimalWeeks: number;
    optimalMonths: number;
    optimalYears: number;
}
interface StakingOption {
    name: string;
    rewardRate: number;
    lockPeriod: number;
}
interface RiskAdjustedReturn {
    baseReturn: StakingReturns;
    adjustedReturn: StakingReturns;
    riskFactor: number;
    riskPremium: number;
}
interface YieldProjectionPoint {
    day: number;
    month: number;
    totalValue: number;
    yield: number;
    apy: number;
}
interface Recommendation {
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
interface DistributionDetail {
    staker: string;
    amount: number;
    success: boolean;
    error?: string;
}
interface Distribution {
    timestamp: number;
    totalDistributed: number;
    recipients: number;
    details: DistributionDetail[];
}
interface DistributionStats {
    totalDistributions: number;
    totalDistributed: number;
    totalRecipients: number;
    averageDistribution: number;
    lastDistribution: number | null;
}
interface DistributorStatus {
    isRunning: boolean;
    distributionInterval: number;
    nextDistribution: number | null;
    totalDistributions: number;
    stats: DistributionStats;
}
type RiskTolerance = 'low' | 'medium' | 'high';

declare class StakingManager {
    private readonly stakes;
    private readonly stakeTimestamps;
    private readonly rewards;
    totalStaked: number;
    rewardRate: number;
    minStake: number;
    lockPeriod: number;
    stake(userAddress: string, amount: number): StakeResult;
    unstake(userAddress: string, amount: number): UnstakeResult;
    calculateRewards(userAddress: string): number;
    claimRewards(userAddress: string): ClaimResult;
    getStakeInfo(userAddress: string): StakeInfo;
    getGlobalStats(): GlobalStats;
    getTopStakers(limit?: number): TopStaker[];
    updateRewardRate(newRate: number): number;
    updateMinStake(newMinStake: number): number;
}

declare class YieldCalculator {
    baseRewardRate: number;
    compoundingFrequency: number;
    calculateSimpleYield(principal: number, rate: number, periods: number): number;
    calculateCompoundYield(principal: number, rate: number, periods: number, compoundingFrequency?: number): number;
    calculateAPY(rate: number, compoundingFrequency?: number): number;
    calculateStakingReturns(stakeAmount: number, stakingDays: number, rewardRate?: number): StakingReturns;
    calculateBreakEven(stakeAmount: number, gasCosts: number, rewardRate?: number): BreakEvenResult;
    calculateOptimalStakingPeriod(stakeAmount: number, targetReturn: number, rewardRate?: number): OptimalPeriodResult;
    compareStakingOptions(stakeAmount: number, options: StakingOption[]): (StakingOption & StakingReturns)[];
    calculateRiskAdjustedReturn(stakeAmount: number, rewardRate: number, riskFactor?: number): RiskAdjustedReturn;
    generateYieldProjection(stakeAmount: number, rewardRate: number, maxDays?: number): YieldProjectionPoint[];
    getRecommendation(stakeAmount: number, riskTolerance?: RiskTolerance): Recommendation;
}

declare class RewardsDistributor {
    private readonly stakingManager;
    private readonly distributionHistory;
    private isRunning;
    private intervalId;
    distributionInterval: number;
    constructor(stakingManager: StakingManager);
    start(): void;
    stop(): void;
    distributeRewards(): Promise<Distribution>;
    getDistributionHistory(limit?: number): Distribution[];
    getDistributionStats(): DistributionStats;
    scheduleDistribution(delay?: number): void;
    setDistributionInterval(milliseconds: number): void;
    getNextDistribution(): number | null;
    getStatus(): DistributorStatus;
}

declare class StakingAPI {
    readonly app: Application;
    readonly port: number;
    private readonly stakingManager;
    private readonly rewardsDistributor;
    constructor(port?: number);
    private setupRoutes;
    start(): void;
}

interface StakingError {
    code: number;
    message: string;
}
declare const ERRORS: {
    readonly ERR_UNAUTHORIZED: {
        readonly code: 401;
        readonly message: "Unauthorized: only contract owner allowed";
    };
    readonly ERR_INSUFFICIENT_BALANCE: {
        readonly code: 402;
        readonly message: "Insufficient balance for stake";
    };
    readonly ERR_BELOW_MINIMUM: {
        readonly code: 404;
        readonly message: "Amount below minimum stake requirement";
    };
    readonly ERR_LOCK_PERIOD_ACTIVE: {
        readonly code: 405;
        readonly message: "Lock period still active, cannot unstake";
    };
    readonly ERR_NO_REWARDS: {
        readonly code: 406;
        readonly message: "No rewards available to claim";
    };
    readonly ERR_ZERO_AMOUNT: {
        readonly code: 408;
        readonly message: "Amount must be greater than zero";
    };
    readonly ERR_EXCEEDS_MAX: {
        readonly code: 411;
        readonly message: "Amount exceeds maximum stake cap";
    };
};
type ErrorKey = keyof typeof ERRORS;

/**
 * Validates that `amount` is a positive integer within the allowed stake range.
 * Throws on failure; returns `true` on success.
 */
declare function validateAmount(amount: number): true;
/**
 * Validates that `address` is a well-formed Stacks address (SP* or ST*).
 * Throws on failure; returns `true` on success.
 */
declare function validateAddress(address: string): true;
/**
 * Validates that `network` is one of the supported network identifiers.
 * Throws on failure; returns `true` on success.
 */
declare function validateNetwork(network: string): true;

/** Minimum stake amount in micro-STX (1 STX) */
declare const MIN_STAKE_AMOUNT = 1000000;
/** Maximum stake amount in micro-STX (1,000,000 STX) */
declare const MAX_STAKE_AMOUNT = 1000000000000;
/** Default lock period in Stacks blocks (~1 day) */
declare const DEFAULT_LOCK_PERIOD = 144;
/** Denominator used when expressing reward rates as integer basis points */
declare const REWARD_RATE_DENOMINATOR = 10000;
/** On-chain staking contract name */
declare const CONTRACT_NAME = "staking";

export { type BreakEvenResult, CONTRACT_NAME, type ClaimResult, DEFAULT_LOCK_PERIOD, type Distribution, type DistributionDetail, type DistributionStats, type DistributorStatus, ERRORS, type ErrorKey, type GlobalStats, MAX_STAKE_AMOUNT, MIN_STAKE_AMOUNT, type OptimalPeriodResult, REWARD_RATE_DENOMINATOR, type Recommendation, RewardsDistributor, type RiskAdjustedReturn, type RiskTolerance, type StakeInfo, type StakeResult, StakingAPI, type StakingError, StakingManager, type StakingOption, type StakingReturns, type TopStaker, type UnstakeResult, YieldCalculator, type YieldProjectionPoint, validateAddress, validateAmount, validateNetwork };
