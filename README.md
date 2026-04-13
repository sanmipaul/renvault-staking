# renvault-staking

TypeScript SDK for staking rewards on the [RenVault](https://github.com/sanmipaul/renvault-staking) DeFi protocol built on the [Stacks](https://www.stacks.co/) blockchain. Stake STX, earn rewards, calculate yield, and manage distribution — all with full type safety.

[![npm version](https://img.shields.io/npm/v/renvault-staking.svg)](https://www.npmjs.com/package/renvault-staking)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Installation

```bash
npm install renvault-staking
```

## Features

- **Full TypeScript support** — ships with `.d.ts` declarations
- **ESM + CJS** — works in both ES module and CommonJS environments
- Stake and unstake STX with configurable lock periods
- Compound yield and APY calculations
- Automated rewards distribution engine
- Break-even and risk-adjusted return analysis
- REST API server for staking operations (via Express)
- Input validation helpers

## Quick start

```ts
import { StakingManager, YieldCalculator } from 'renvault-staking';

const manager = new StakingManager();

// Stake 10 STX (amounts in micro-STX)
const result = manager.stake('SP1ABC...', 10_000_000);
console.log(result.newStake, result.lockUntil);

// Calculate projected yield
const calc = new YieldCalculator();
const projection = calc.calculateStakingReturns(10_000_000, 90, 0.01);
console.log(`APY: ${(projection.apy * 100).toFixed(2)}%`);
```

## API

### `StakingManager`

Manages stakes, lock periods, rewards, and global protocol state.

```ts
const sm = new StakingManager();
```

| Method | Signature | Description |
|---|---|---|
| `stake` | `(address: string, amount: number) => StakeResult` | Stake micro-STX for an address |
| `unstake` | `(address: string, amount: number) => UnstakeResult` | Unstake after lock period |
| `calculateRewards` | `(address: string) => number` | Pending rewards in micro-STX |
| `claimRewards` | `(address: string) => ClaimResult` | Claim all pending rewards |
| `getStakeInfo` | `(address: string) => StakeInfo` | Full stake state for an address |
| `getGlobalStats` | `() => GlobalStats` | Protocol-wide statistics |
| `getTopStakers` | `(limit?: number) => TopStaker[]` | Leaderboard, sorted by stake |
| `updateRewardRate` | `(rate: number) => number` | Set reward rate (0–0.2) |
| `updateMinStake` | `(amount: number) => number` | Set minimum stake amount |

**Configuration properties:**

```ts
sm.rewardRate = 0.01;     // 1% per epoch (default)
sm.minStake   = 1_000_000; // 1 STX in micro-STX (default)
sm.lockPeriod = 86_400_000; // 24 hours in ms (default)
```

---

### `YieldCalculator`

Stateless yield math utilities.

```ts
const calc = new YieldCalculator();
```

| Method | Description |
|---|---|
| `calculateSimpleYield(principal, rate, periods)` | Simple interest |
| `calculateCompoundYield(principal, rate, periods, freq?)` | Compound interest |
| `calculateAPY(rate, freq?)` | Annual percentage yield |
| `calculateStakingReturns(amount, days, rate?)` | Full returns breakdown |
| `calculateBreakEven(amount, gasCosts, rate?)` | Days to recover gas costs |
| `calculateOptimalStakingPeriod(amount, target, rate?)` | Days to reach a target |
| `compareStakingOptions(amount, options[])` | Rank options by yield |
| `calculateRiskAdjustedReturn(amount, rate, riskFactor?)` | Risk-discounted return |
| `generateYieldProjection(amount, rate, maxDays?)` | Monthly projection array |
| `getRecommendation(amount, risk?)` | Strategy recommendation |

```ts
// Example: compare two staking options
const best = calc.compareStakingOptions(1_000_000, [
  { name: 'Conservative', rewardRate: 0.005, lockPeriod: 30 },
  { name: 'Aggressive',   rewardRate: 0.02,  lockPeriod: 365 },
]);
console.log(best[0].name); // highest compound yield first
```

---

### `RewardsDistributor`

Automated periodic reward distribution engine.

```ts
import { StakingManager, RewardsDistributor } from 'renvault-staking';

const sm = new StakingManager();
const rd = new RewardsDistributor(sm);

rd.start();                          // begin periodic distribution
const dist = await rd.distributeRewards(); // manual trigger
rd.stop();
```

| Method | Description |
|---|---|
| `start()` | Begin automatic distribution on interval |
| `stop()` | Stop automatic distribution |
| `distributeRewards()` | Manually trigger a distribution round |
| `getDistributionHistory(limit?)` | Past distributions, newest first |
| `getDistributionStats()` | Aggregate totals and averages |
| `getStatus()` | Running state + next distribution time |
| `scheduleDistribution(delay?)` | One-shot delayed distribution |
| `setDistributionInterval(ms)` | Change the automatic interval |

---

### `StakingAPI` (Express server)

Drop-in REST API that wraps `StakingManager` and `RewardsDistributor`.

```ts
import { StakingAPI } from 'renvault-staking';

const api = new StakingAPI(3010);
api.start();
```

**Endpoints:**

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/staking/stake` | `{ userAddress, amount }` |
| `POST` | `/api/staking/unstake` | `{ userAddress, amount }` |
| `POST` | `/api/staking/claim` | `{ userAddress }` |
| `GET` | `/api/staking/info/:userAddress` | Stake info |
| `GET` | `/api/staking/stats` | Global stats |
| `GET` | `/api/staking/leaderboard?limit=10` | Top stakers |
| `GET` | `/api/staking/rewards/history?limit=50` | Distribution history |
| `GET` | `/api/staking/rewards/stats` | Distribution stats |
| `POST` | `/api/staking/rewards/distribute` | Manual distribution |
| `GET` | `/api/staking/rewards/status` | Distributor status |
| `POST` | `/api/staking/rewards/start` | Start distributor |
| `POST` | `/api/staking/rewards/stop` | Stop distributor |
| `POST` | `/api/staking/settings/reward-rate` | `{ rate }` |
| `POST` | `/api/staking/settings/min-stake` | `{ amount }` |

---

### Validators

```ts
import { validateAmount, validateAddress, validateNetwork } from 'renvault-staking';

validateAmount(5_000_000);           // throws if out of range
validateAddress('SP1ABC...');        // throws if not SP* or ST*
validateNetwork('mainnet');          // throws if not mainnet/testnet
```

---

### Constants

```ts
import {
  MIN_STAKE_AMOUNT,        // 1_000_000 (1 STX)
  MAX_STAKE_AMOUNT,        // 1_000_000_000_000 (1M STX)
  DEFAULT_LOCK_PERIOD,     // 144 blocks (~1 day)
  REWARD_RATE_DENOMINATOR, // 10_000
  CONTRACT_NAME,           // 'staking'
} from 'renvault-staking';
```

---

### Error codes (`ERRORS`)

```ts
import { ERRORS } from 'renvault-staking';

ERRORS.ERR_UNAUTHORIZED       // { code: 401, message: '...' }
ERRORS.ERR_INSUFFICIENT_BALANCE // { code: 402 }
ERRORS.ERR_BELOW_MINIMUM      // { code: 404 }
ERRORS.ERR_LOCK_PERIOD_ACTIVE // { code: 405 }
ERRORS.ERR_NO_REWARDS         // { code: 406 }
ERRORS.ERR_ZERO_AMOUNT        // { code: 408 }
ERRORS.ERR_EXCEEDS_MAX        // { code: 411 }
```

## TypeScript types

All public interfaces are exported:

```ts
import type {
  StakeResult, UnstakeResult, ClaimResult,
  StakeInfo, GlobalStats, TopStaker,
  StakingReturns, BreakEvenResult, OptimalPeriodResult,
  StakingOption, RiskAdjustedReturn, YieldProjectionPoint,
  Recommendation, Distribution, DistributionStats,
  DistributorStatus, RiskTolerance,
} from 'renvault-staking';
```

## Requirements

- Node.js ≥ 18

## License

MIT © RenVault Team
