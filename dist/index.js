"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  CONTRACT_NAME: () => CONTRACT_NAME,
  DEFAULT_LOCK_PERIOD: () => DEFAULT_LOCK_PERIOD,
  ERRORS: () => ERRORS,
  MAX_STAKE_AMOUNT: () => MAX_STAKE_AMOUNT,
  MIN_STAKE_AMOUNT: () => MIN_STAKE_AMOUNT,
  REWARD_RATE_DENOMINATOR: () => REWARD_RATE_DENOMINATOR,
  RewardsDistributor: () => RewardsDistributor,
  StakingAPI: () => StakingAPI,
  StakingManager: () => StakingManager,
  YieldCalculator: () => YieldCalculator,
  validateAddress: () => validateAddress,
  validateAmount: () => validateAmount,
  validateNetwork: () => validateNetwork
});
module.exports = __toCommonJS(index_exports);

// src/stakingManager.ts
var StakingManager = class {
  constructor() {
    this.stakes = /* @__PURE__ */ new Map();
    this.stakeTimestamps = /* @__PURE__ */ new Map();
    this.rewards = /* @__PURE__ */ new Map();
    this.totalStaked = 0;
    this.rewardRate = 0.01;
    // 1% per epoch
    this.minStake = 1e6;
    // 1 STX in micro-STX
    this.lockPeriod = 864e5;
  }
  // 24 hours in milliseconds
  stake(userAddress, amount) {
    if (amount < this.minStake) {
      throw new Error(`Minimum stake is ${this.minStake / 1e6} STX`);
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
      lockUntil: Date.now() + this.lockPeriod
    };
  }
  unstake(userAddress, amount) {
    const currentStake = this.stakes.get(userAddress) ?? 0;
    const stakeTime = this.stakeTimestamps.get(userAddress) ?? 0;
    if (currentStake < amount) {
      throw new Error("Insufficient staked balance");
    }
    if (Date.now() - stakeTime < this.lockPeriod) {
      throw new Error("Stake is still locked");
    }
    const newStake = currentStake - amount;
    this.stakes.set(userAddress, newStake);
    this.totalStaked -= amount;
    if (newStake === 0) {
      this.stakes.delete(userAddress);
      this.stakeTimestamps.delete(userAddress);
    } else {
      this.stakeTimestamps.set(userAddress, Date.now());
    }
    return {
      success: true,
      unstaked: amount,
      remainingStake: newStake,
      totalStaked: this.totalStaked
    };
  }
  calculateRewards(userAddress) {
    const stake = this.stakes.get(userAddress) ?? 0;
    const stakeTime = this.stakeTimestamps.get(userAddress) ?? Date.now();
    if (stake === 0) return 0;
    const stakingDuration = Date.now() - stakeTime;
    const epochs = Math.floor(stakingDuration / this.lockPeriod);
    return Math.floor(stake * this.rewardRate * epochs);
  }
  claimRewards(userAddress) {
    const pendingRewards = this.calculateRewards(userAddress);
    if (pendingRewards === 0) {
      throw new Error("No rewards to claim");
    }
    const currentRewards = this.rewards.get(userAddress) ?? 0;
    this.rewards.set(userAddress, currentRewards + pendingRewards);
    this.stakeTimestamps.set(userAddress, Date.now());
    return {
      success: true,
      claimed: pendingRewards,
      totalRewards: currentRewards + pendingRewards
    };
  }
  getStakeInfo(userAddress) {
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
      isLocked: Date.now() - stakeTime < this.lockPeriod
    };
  }
  getGlobalStats() {
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
      lockPeriod: this.lockPeriod
    };
  }
  getTopStakers(limit = 10) {
    return Array.from(this.stakes.entries()).sort(([, a], [, b]) => b - a).slice(0, limit).map(([address, stake]) => ({
      address,
      stake,
      rewards: this.rewards.get(address) ?? 0,
      pendingRewards: this.calculateRewards(address)
    }));
  }
  updateRewardRate(newRate) {
    if (newRate <= 0 || newRate > 0.2) {
      throw new Error("Invalid reward rate: must be between 0 and 0.2 (20%)");
    }
    this.rewardRate = newRate;
    return this.rewardRate;
  }
  updateMinStake(newMinStake) {
    this.minStake = newMinStake;
    return this.minStake;
  }
};

// src/yieldCalculator.ts
var YieldCalculator = class {
  constructor() {
    this.baseRewardRate = 0.01;
    // 1% per epoch
    this.compoundingFrequency = 365;
  }
  // Daily compounding
  calculateSimpleYield(principal, rate, periods) {
    if (typeof principal !== "number" || principal < 0) throw new TypeError("principal must be a non-negative number");
    if (typeof rate !== "number" || rate < 0) throw new TypeError("rate must be a non-negative number");
    if (typeof periods !== "number" || periods < 0) throw new TypeError("periods must be a non-negative number");
    return principal * rate * periods;
  }
  calculateCompoundYield(principal, rate, periods, compoundingFrequency = this.compoundingFrequency) {
    if (typeof principal !== "number" || principal < 0) throw new TypeError("principal must be a non-negative number");
    if (typeof rate !== "number" || rate < 0) throw new TypeError("rate must be a non-negative number");
    if (typeof periods !== "number" || periods < 0) throw new TypeError("periods must be a non-negative number");
    if (typeof compoundingFrequency !== "number" || compoundingFrequency <= 0) {
      throw new TypeError("compoundingFrequency must be a positive number");
    }
    return principal * Math.pow(1 + rate / compoundingFrequency, compoundingFrequency * periods) - principal;
  }
  calculateAPY(rate, compoundingFrequency = this.compoundingFrequency) {
    return Math.pow(1 + rate / compoundingFrequency, compoundingFrequency) - 1;
  }
  calculateStakingReturns(stakeAmount, stakingDays, rewardRate = this.baseRewardRate) {
    if (typeof stakeAmount !== "number" || stakeAmount <= 0) throw new TypeError("stakeAmount must be a positive number");
    if (typeof stakingDays !== "number" || stakingDays <= 0) throw new TypeError("stakingDays must be a positive number");
    if (typeof rewardRate !== "number" || rewardRate <= 0) throw new TypeError("rewardRate must be a positive number");
    const periods = stakingDays / 365;
    const simpleYield = this.calculateSimpleYield(stakeAmount, rewardRate, periods);
    const compoundYield = this.calculateCompoundYield(stakeAmount, rewardRate, periods);
    const apy = this.calculateAPY(rewardRate);
    return {
      stakeAmount,
      stakingDays,
      rewardRate,
      simpleYield,
      compoundYield,
      apy,
      totalSimple: stakeAmount + simpleYield,
      totalCompound: stakeAmount + compoundYield,
      dailyReward: compoundYield / stakingDays || 0
    };
  }
  calculateBreakEven(stakeAmount, gasCosts, rewardRate = this.baseRewardRate) {
    if (typeof stakeAmount !== "number" || stakeAmount <= 0) throw new TypeError("stakeAmount must be a positive number");
    if (typeof gasCosts !== "number" || gasCosts < 0) throw new TypeError("gasCosts must be a non-negative number");
    if (typeof rewardRate !== "number" || rewardRate <= 0) throw new TypeError("rewardRate must be a positive number");
    const dailyReward = stakeAmount * rewardRate / 365;
    const breakEvenDays = gasCosts / dailyReward;
    return {
      stakeAmount,
      gasCosts,
      dailyReward,
      breakEvenDays,
      breakEvenWeeks: breakEvenDays / 7,
      breakEvenMonths: breakEvenDays / 30
    };
  }
  calculateOptimalStakingPeriod(stakeAmount, targetReturn, rewardRate = this.baseRewardRate) {
    if (typeof stakeAmount !== "number" || stakeAmount <= 0) throw new TypeError("stakeAmount must be a positive number");
    if (typeof targetReturn !== "number") throw new TypeError("targetReturn must be a number");
    if (targetReturn <= stakeAmount) throw new Error("targetReturn must be greater than stakeAmount to produce a positive yield");
    if (typeof rewardRate !== "number" || rewardRate <= 0) throw new TypeError("rewardRate must be a positive number");
    const targetYield = targetReturn - stakeAmount;
    const periods = targetYield / (stakeAmount * rewardRate);
    const days = periods * 365;
    return {
      stakeAmount,
      targetReturn,
      targetYield,
      optimalDays: days,
      optimalWeeks: days / 7,
      optimalMonths: days / 30,
      optimalYears: days / 365
    };
  }
  compareStakingOptions(stakeAmount, options) {
    if (typeof stakeAmount !== "number" || stakeAmount <= 0) throw new TypeError("stakeAmount must be a positive number");
    if (!Array.isArray(options) || options.length === 0) throw new TypeError("options must be a non-empty array");
    return options.map((option) => ({
      ...option,
      ...this.calculateStakingReturns(stakeAmount, option.lockPeriod, option.rewardRate)
    })).sort((a, b) => b.compoundYield - a.compoundYield);
  }
  calculateRiskAdjustedReturn(stakeAmount, rewardRate, riskFactor = 1) {
    if (typeof riskFactor !== "number" || riskFactor <= 0) throw new TypeError("riskFactor must be a positive number");
    const baseReturn = this.calculateStakingReturns(stakeAmount, 365, rewardRate);
    const adjustedRate = rewardRate / riskFactor;
    const adjustedReturn = this.calculateStakingReturns(stakeAmount, 365, adjustedRate);
    return {
      baseReturn,
      adjustedReturn,
      riskFactor,
      riskPremium: baseReturn.compoundYield - adjustedReturn.compoundYield
    };
  }
  generateYieldProjection(stakeAmount, rewardRate, maxDays = 365) {
    if (typeof maxDays !== "number" || maxDays <= 0) throw new TypeError("maxDays must be a positive number");
    const projection = [];
    for (let day = 1; day <= maxDays; day += 30) {
      const returns = this.calculateStakingReturns(stakeAmount, day, rewardRate);
      projection.push({
        day,
        month: Math.ceil(day / 30),
        totalValue: returns.totalCompound,
        yield: returns.compoundYield,
        apy: returns.apy
      });
    }
    return projection;
  }
  getRecommendation(stakeAmount, riskTolerance = "medium") {
    const options = {
      low: { rate: 5e-3, period: 30, description: "Conservative staking" },
      medium: { rate: 0.01, period: 90, description: "Balanced staking" },
      high: { rate: 0.02, period: 365, description: "High-yield staking" }
    };
    const selected = options[riskTolerance] ?? options.medium;
    const returns = this.calculateStakingReturns(stakeAmount, selected.period, selected.rate);
    return {
      recommendation: selected.description,
      riskLevel: riskTolerance,
      ...returns
    };
  }
};

// src/rewardsDistributor.ts
var RewardsDistributor = class {
  // 24 hours in milliseconds
  constructor(stakingManager) {
    this.stakingManager = stakingManager;
    this.distributionHistory = [];
    this.isRunning = false;
    this.distributionInterval = 864e5;
  }
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.intervalId = setInterval(() => {
      void this.distributeRewards();
    }, this.distributionInterval);
  }
  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    clearInterval(this.intervalId);
    this.intervalId = void 0;
  }
  async distributeRewards() {
    const stakers = Array.from(this.stakingManager.stakes.keys());
    const distribution = {
      timestamp: Date.now(),
      totalDistributed: 0,
      recipients: 0,
      details: []
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
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    this.distributionHistory.push(distribution);
    return distribution;
  }
  getDistributionHistory(limit = 50) {
    return [...this.distributionHistory].sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }
  getDistributionStats() {
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
      lastDistribution: lastEntry?.timestamp ?? null
    };
  }
  scheduleDistribution(delay = 0) {
    setTimeout(() => {
      void this.distributeRewards();
    }, delay);
  }
  setDistributionInterval(milliseconds) {
    this.distributionInterval = milliseconds;
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }
  getNextDistribution() {
    if (!this.isRunning) return null;
    const lastEntry = this.distributionHistory[this.distributionHistory.length - 1];
    const lastTimestamp = lastEntry?.timestamp ?? Date.now();
    return lastTimestamp + this.distributionInterval;
  }
  getStatus() {
    return {
      isRunning: this.isRunning,
      distributionInterval: this.distributionInterval,
      nextDistribution: this.getNextDistribution(),
      totalDistributions: this.distributionHistory.length,
      stats: this.getDistributionStats()
    };
  }
};

// src/stakingAPI.ts
var import_express = __toESM(require("express"));
var StakingAPI = class {
  constructor(port = 3010) {
    this.app = (0, import_express.default)();
    this.port = port;
    this.stakingManager = new StakingManager();
    this.rewardsDistributor = new RewardsDistributor(this.stakingManager);
    this.setupRoutes();
  }
  setupRoutes() {
    this.app.use(import_express.default.json());
    this.app.post("/api/staking/stake", (req, res) => {
      try {
        const { userAddress, amount } = req.body;
        res.json(this.stakingManager.stake(userAddress, amount));
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });
    this.app.post("/api/staking/unstake", (req, res) => {
      try {
        const { userAddress, amount } = req.body;
        res.json(this.stakingManager.unstake(userAddress, amount));
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });
    this.app.post("/api/staking/claim", (req, res) => {
      try {
        const { userAddress } = req.body;
        res.json(this.stakingManager.claimRewards(userAddress));
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });
    this.app.get("/api/staking/info/:userAddress", (req, res) => {
      res.json(this.stakingManager.getStakeInfo(req.params.userAddress));
    });
    this.app.get("/api/staking/stats", (_req, res) => {
      res.json(this.stakingManager.getGlobalStats());
    });
    this.app.get("/api/staking/leaderboard", (req, res) => {
      const limit = parseInt(String(req.query.limit), 10) || 10;
      res.json({ leaderboard: this.stakingManager.getTopStakers(limit) });
    });
    this.app.get("/api/staking/rewards/history", (req, res) => {
      const limit = parseInt(String(req.query.limit), 10) || 50;
      res.json({ history: this.rewardsDistributor.getDistributionHistory(limit) });
    });
    this.app.get("/api/staking/rewards/stats", (_req, res) => {
      res.json(this.rewardsDistributor.getDistributionStats());
    });
    this.app.post("/api/staking/rewards/distribute", async (_req, res) => {
      try {
        res.json(await this.rewardsDistributor.distributeRewards());
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    this.app.get("/api/staking/rewards/status", (_req, res) => {
      res.json(this.rewardsDistributor.getStatus());
    });
    this.app.post("/api/staking/rewards/start", (_req, res) => {
      this.rewardsDistributor.start();
      res.json({ message: "Rewards distributor started" });
    });
    this.app.post("/api/staking/rewards/stop", (_req, res) => {
      this.rewardsDistributor.stop();
      res.json({ message: "Rewards distributor stopped" });
    });
    this.app.post("/api/staking/settings/reward-rate", (req, res) => {
      try {
        const { rate } = req.body;
        res.json({ rewardRate: this.stakingManager.updateRewardRate(rate) });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });
    this.app.post("/api/staking/settings/min-stake", (req, res) => {
      try {
        const { amount } = req.body;
        res.json({ minStake: this.stakingManager.updateMinStake(amount) });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });
  }
  start() {
    this.app.listen(this.port, () => {
      console.log(`Staking API server running on port ${this.port}`);
    });
    this.rewardsDistributor.start();
  }
};

// src/errors.ts
var ERRORS = {
  ERR_UNAUTHORIZED: { code: 401, message: "Unauthorized: only contract owner allowed" },
  ERR_INSUFFICIENT_BALANCE: { code: 402, message: "Insufficient balance for stake" },
  ERR_BELOW_MINIMUM: { code: 404, message: "Amount below minimum stake requirement" },
  ERR_LOCK_PERIOD_ACTIVE: { code: 405, message: "Lock period still active, cannot unstake" },
  ERR_NO_REWARDS: { code: 406, message: "No rewards available to claim" },
  ERR_ZERO_AMOUNT: { code: 408, message: "Amount must be greater than zero" },
  ERR_EXCEEDS_MAX: { code: 411, message: "Amount exceeds maximum stake cap" }
};

// src/constants.ts
var MIN_STAKE_AMOUNT = 1e6;
var MAX_STAKE_AMOUNT = 1e12;
var DEFAULT_LOCK_PERIOD = 144;
var REWARD_RATE_DENOMINATOR = 1e4;
var CONTRACT_NAME = "staking";

// src/validators.ts
function validateAmount(amount) {
  if (!amount || amount <= 0) throw new Error("Amount must be greater than zero");
  if (amount < MIN_STAKE_AMOUNT) throw new Error(`Minimum stake is ${MIN_STAKE_AMOUNT} micro-STX`);
  if (amount > MAX_STAKE_AMOUNT) throw new Error(`Maximum stake is ${MAX_STAKE_AMOUNT} micro-STX`);
  return true;
}
function validateAddress(address) {
  if (!address || typeof address !== "string") throw new Error("Invalid Stacks address");
  if (!address.startsWith("SP") && !address.startsWith("ST")) {
    throw new Error("Address must start with SP (mainnet) or ST (testnet)");
  }
  return true;
}
function validateNetwork(network) {
  if (!["mainnet", "testnet"].includes(network)) {
    throw new Error("Network must be mainnet or testnet");
  }
  return true;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CONTRACT_NAME,
  DEFAULT_LOCK_PERIOD,
  ERRORS,
  MAX_STAKE_AMOUNT,
  MIN_STAKE_AMOUNT,
  REWARD_RATE_DENOMINATOR,
  RewardsDistributor,
  StakingAPI,
  StakingManager,
  YieldCalculator,
  validateAddress,
  validateAmount,
  validateNetwork
});
//# sourceMappingURL=index.js.map