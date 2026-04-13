import type { Distribution, DistributionStats, DistributorStatus } from './types.js';
import type { StakingManager } from './stakingManager.js';

export class RewardsDistributor {
  private readonly distributionHistory: Distribution[] = [];
  private isRunning = false;
  private intervalId: ReturnType<typeof setInterval> | undefined;

  distributionInterval = 86_400_000; // 24 hours in milliseconds

  constructor(private readonly stakingManager: StakingManager) {}

  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.intervalId = setInterval(() => {
      void this.distributeRewards();
    }, this.distributionInterval);
  }

  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    clearInterval(this.intervalId);
    this.intervalId = undefined;
  }

  async distributeRewards(): Promise<Distribution> {
    const stakers = Array.from((this.stakingManager as any).stakes.keys() as IterableIterator<string>);
    const distribution: Distribution = {
      timestamp: Date.now(),
      totalDistributed: 0,
      recipients: 0,
      details: [],
    };

    for (const staker of stakers) {
      try {
        const pendingRewards = this.stakingManager.calculateRewards(staker);

        if (pendingRewards > 0) {
          const result = this.stakingManager.claimRewards(staker);
          distribution.totalDistributed += result.claimed;
          distribution.recipients += 1;
          distribution.details.push({ staker, amount: result.claimed, success: true });
        }
      } catch (error) {
        distribution.details.push({
          staker,
          amount: 0,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    this.distributionHistory.push(distribution);
    return distribution;
  }

  getDistributionHistory(limit = 50): Distribution[] {
    return [...this.distributionHistory]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  getDistributionStats(): DistributionStats {
    const totalDistributions = this.distributionHistory.length;
    const totalDistributed = this.distributionHistory.reduce((sum, d) => sum + d.totalDistributed, 0);
    const totalRecipients = this.distributionHistory.reduce((sum, d) => sum + d.recipients, 0);
    const averageDistribution = totalDistributions > 0 ? totalDistributed / totalDistributions : 0;
    const lastEntry = this.distributionHistory[this.distributionHistory.length - 1];

    return {
      totalDistributions,
      totalDistributed,
      totalRecipients,
      averageDistribution,
      lastDistribution: lastEntry?.timestamp ?? null,
    };
  }

  scheduleDistribution(delay = 0): void {
    setTimeout(() => {
      void this.distributeRewards();
    }, delay);
  }

  setDistributionInterval(milliseconds: number): void {
    this.distributionInterval = milliseconds;
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  getNextDistribution(): number | null {
    if (!this.isRunning) return null;

    const lastEntry = this.distributionHistory[this.distributionHistory.length - 1];
    const lastTimestamp = lastEntry?.timestamp ?? Date.now();
    return lastTimestamp + this.distributionInterval;
  }

  getStatus(): DistributorStatus {
    return {
      isRunning: this.isRunning,
      distributionInterval: this.distributionInterval,
      nextDistribution: this.getNextDistribution(),
      totalDistributions: this.distributionHistory.length,
      stats: this.getDistributionStats(),
    };
  }
}
