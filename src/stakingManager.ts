import type {
  StakeResult,
  UnstakeResult,
  ClaimResult,
  StakeInfo,
  GlobalStats,
  TopStaker,
} from './types.js';

export class StakingManager {
  private readonly stakes = new Map<string, number>();
  private readonly stakeTimestamps = new Map<string, number>();
  private readonly rewards = new Map<string, number>();

  totalStaked = 0;
  rewardRate = 0.01; // 1% per epoch
  minStake = 1_000_000; // 1 STX in micro-STX
  lockPeriod = 86_400_000; // 24 hours in milliseconds

  stake(userAddress: string, amount: number): StakeResult {
    if (amount < this.minStake) {
      throw new Error(`Minimum stake is ${this.minStake / 1_000_000} STX`);
    }

    const currentStake = this.stakes.get(userAddress) ?? 0;
    const newStake = currentStake + amount;

    this.stakes.set(userAddress, newStake);
    this.stakeTimestamps.set(userAddress, Date.now());
    this.totalStaked += amount;

    return {
      success: true,
      newStake,
      totalStaked: this.totalStaked,
      lockUntil: Date.now() + this.lockPeriod,
    };
  }

  unstake(userAddress: string, amount: number): UnstakeResult {
    const currentStake = this.stakes.get(userAddress) ?? 0;
    const stakeTime = this.stakeTimestamps.get(userAddress) ?? 0;

    if (currentStake < amount) {
      throw new Error('Insufficient staked balance');
    }

    if (Date.now() - stakeTime < this.lockPeriod) {
      throw new Error('Stake is still locked');
    }

    const newStake = currentStake - amount;
    this.stakes.set(userAddress, newStake);
    this.totalStaked -= amount;

    if (newStake === 0) {
      this.stakes.delete(userAddress);
      this.stakeTimestamps.delete(userAddress);
    } else {
      // Reset the lock timer so the remaining stake must wait a full lock
      // period before another unstake is permitted.
      this.stakeTimestamps.set(userAddress, Date.now());
    }

    return {
      success: true,
      unstaked: amount,
      remainingStake: newStake,
      totalStaked: this.totalStaked,
    };
  }

  calculateRewards(userAddress: string): number {
    const stake = this.stakes.get(userAddress) ?? 0;
    const stakeTime = this.stakeTimestamps.get(userAddress) ?? Date.now();

    if (stake === 0) return 0;

    const stakingDuration = Date.now() - stakeTime;
    const epochs = Math.floor(stakingDuration / this.lockPeriod);
    return Math.floor(stake * this.rewardRate * epochs);
  }

  claimRewards(userAddress: string): ClaimResult {
    const pendingRewards = this.calculateRewards(userAddress);

    if (pendingRewards === 0) {
      throw new Error('No rewards to claim');
    }

    const currentRewards = this.rewards.get(userAddress) ?? 0;
    this.rewards.set(userAddress, currentRewards + pendingRewards);
    this.stakeTimestamps.set(userAddress, Date.now());

    return {
      success: true,
      claimed: pendingRewards,
      totalRewards: currentRewards + pendingRewards,
    };
  }

  getStakeInfo(userAddress: string): StakeInfo {
    const stake = this.stakes.get(userAddress) ?? 0;
    const stakeTime = this.stakeTimestamps.get(userAddress) ?? 0;
    const rewardsAccumulated = this.rewards.get(userAddress) ?? 0;
    const pendingRewards = this.calculateRewards(userAddress);

    return {
      stake,
      rewards: rewardsAccumulated,
      pendingRewards,
      stakeTime,
      lockUntil: stakeTime + this.lockPeriod,
      isLocked: Date.now() - stakeTime < this.lockPeriod,
    };
  }

  getGlobalStats(): GlobalStats {
    const totalUsers = this.stakes.size;
    const averageStake = totalUsers > 0 ? this.totalStaked / totalUsers : 0;
    const totalRewards = Array.from(this.rewards.values()).reduce((sum, r) => sum + r, 0);

    return {
      totalStaked: this.totalStaked,
      totalUsers,
      averageStake,
      totalRewards,
      rewardRate: this.rewardRate,
      minStake: this.minStake,
      lockPeriod: this.lockPeriod,
    };
  }

  getTopStakers(limit = 10): TopStaker[] {
    return Array.from(this.stakes.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([address, stake]) => ({
        address,
        stake,
        rewards: this.rewards.get(address) ?? 0,
        pendingRewards: this.calculateRewards(address),
      }));
  }

  updateRewardRate(newRate: number): number {
    if (newRate <= 0 || newRate > 0.2) {
      throw new Error('Invalid reward rate: must be between 0 and 0.2 (20%)');
    }
    this.rewardRate = newRate;
    return this.rewardRate;
  }

  updateMinStake(newMinStake: number): number {
    this.minStake = newMinStake;
    return this.minStake;
  }
}
