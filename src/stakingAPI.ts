import express, { type Application, type Request, type Response } from 'express';
import { StakingManager } from './stakingManager.js';
import { RewardsDistributor } from './rewardsDistributor.js';

export class StakingAPI {
  readonly app: Application;
  readonly port: number;
  private readonly stakingManager: StakingManager;
  private readonly rewardsDistributor: RewardsDistributor;

  constructor(port = 3010) {
    this.app = express();
    this.port = port;
    this.stakingManager = new StakingManager();
    this.rewardsDistributor = new RewardsDistributor(this.stakingManager);
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.app.use(express.json());

    this.app.post('/api/staking/stake', (req: Request, res: Response) => {
      try {
        const { userAddress, amount } = req.body as { userAddress: string; amount: number };
        res.json(this.stakingManager.stake(userAddress, amount));
      } catch (error) {
        res.status(400).json({ error: (error as Error).message });
      }
    });

    this.app.post('/api/staking/unstake', (req: Request, res: Response) => {
      try {
        const { userAddress, amount } = req.body as { userAddress: string; amount: number };
        res.json(this.stakingManager.unstake(userAddress, amount));
      } catch (error) {
        res.status(400).json({ error: (error as Error).message });
      }
    });

    this.app.post('/api/staking/claim', (req: Request, res: Response) => {
      try {
        const { userAddress } = req.body as { userAddress: string };
        res.json(this.stakingManager.claimRewards(userAddress));
      } catch (error) {
        res.status(400).json({ error: (error as Error).message });
      }
    });

    this.app.get('/api/staking/info/:userAddress', (req: Request, res: Response) => {
      res.json(this.stakingManager.getStakeInfo(req.params.userAddress));
    });

    this.app.get('/api/staking/stats', (_req: Request, res: Response) => {
      res.json(this.stakingManager.getGlobalStats());
    });

    this.app.get('/api/staking/leaderboard', (req: Request, res: Response) => {
      const limit = parseInt(String(req.query.limit), 10) || 10;
      res.json({ leaderboard: this.stakingManager.getTopStakers(limit) });
    });

    this.app.get('/api/staking/rewards/history', (req: Request, res: Response) => {
      const limit = parseInt(String(req.query.limit), 10) || 50;
      res.json({ history: this.rewardsDistributor.getDistributionHistory(limit) });
    });

    this.app.get('/api/staking/rewards/stats', (_req: Request, res: Response) => {
      res.json(this.rewardsDistributor.getDistributionStats());
    });

    this.app.post('/api/staking/rewards/distribute', async (_req: Request, res: Response) => {
      try {
        res.json(await this.rewardsDistributor.distributeRewards());
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    this.app.get('/api/staking/rewards/status', (_req: Request, res: Response) => {
      res.json(this.rewardsDistributor.getStatus());
    });

    this.app.post('/api/staking/rewards/start', (_req: Request, res: Response) => {
      this.rewardsDistributor.start();
      res.json({ message: 'Rewards distributor started' });
    });

    this.app.post('/api/staking/rewards/stop', (_req: Request, res: Response) => {
      this.rewardsDistributor.stop();
      res.json({ message: 'Rewards distributor stopped' });
    });

    this.app.post('/api/staking/settings/reward-rate', (req: Request, res: Response) => {
      try {
        const { rate } = req.body as { rate: number };
        res.json({ rewardRate: this.stakingManager.updateRewardRate(rate) });
      } catch (error) {
        res.status(400).json({ error: (error as Error).message });
      }
    });

    this.app.post('/api/staking/settings/min-stake', (req: Request, res: Response) => {
      try {
        const { amount } = req.body as { amount: number };
        res.json({ minStake: this.stakingManager.updateMinStake(amount) });
      } catch (error) {
        res.status(400).json({ error: (error as Error).message });
      }
    });
  }

  start(): void {
    this.app.listen(this.port, () => {
      console.log(`Staking API server running on port ${this.port}`);
    });
    this.rewardsDistributor.start();
  }
}
