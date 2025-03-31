export class RewardsService {
  constructor() {
    this.rewards = new Map();
    this.donorPoints = new Map();
    this.rewardHistory = [];
    this.rewardTiers = this.initializeRewardTiers();
    this.specialCampaigns = new Map();
  }

  initializeRewardTiers() {
    return {
      BRONZE: {
        name: 'Bronze',
        minPoints: 0,
        benefits: [
          'Basic health checkup',
          'Donation certificate'
        ]
      },
      SILVER: {
        name: 'Silver',
        minPoints: 100,
        benefits: [
          'Comprehensive health checkup',
          'Priority appointment scheduling',
          'Donation certificate',
          'Blood type card'
        ]
      },
      GOLD: {
        name: 'Gold',
        minPoints: 250,
        benefits: [
          'Premium health checkup',
          'Priority appointment scheduling',
          'Donation certificate',
          'Blood type card',
          'Emergency blood support',
          'Health insurance discount'
        ]
      },
      PLATINUM: {
        name: 'Platinum',
        minPoints: 500,
        benefits: [
          'Executive health checkup',
          'VIP appointment scheduling',
          'Donation certificate',
          'Premium blood type card',
          'Priority emergency blood support',
          'Enhanced health insurance discount',
          'Annual medical consultation'
        ]
      }
    };
  }

  createSpecialCampaign(campaign) {
    const campaignId = Date.now().toString();
    const newCampaign = {
      id: campaignId,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      name: campaign.name,
      description: campaign.description,
      pointMultiplier: campaign.pointMultiplier || 2,
      conditions: campaign.conditions || [],
      rewards: campaign.rewards || [],
      participants: new Set(),
      status: 'active'
    };

    this.specialCampaigns.set(campaignId, newCampaign);
    return newCampaign;
  }

  async addDonation(donorId, donation) {
    let points = this.calculateBasePoints(donation);
    
    // Check for active campaigns
    for (const campaign of this.specialCampaigns.values()) {
      if (this.isEligibleForCampaign(donation, campaign)) {
        points *= campaign.pointMultiplier;
        campaign.participants.add(donorId);
      }
    }

    // Update donor points
    const currentPoints = this.donorPoints.get(donorId) || 0;
    this.donorPoints.set(donorId, currentPoints + points);

    // Check for milestone rewards
    await this.checkMilestones(donorId, donation);

    return points;
  }

  calculateBasePoints(donation) {
    let points = 100; // Base points for donation

    // Bonus for emergency donations
    if (donation.isEmergency) {
      points += 50;
    }

    // Bonus for rare blood types
    if (['AB-', 'B-', 'A-', 'O-'].includes(donation.bloodType)) {
      points += 30;
    }

    // Bonus for plasma donation
    if (donation.type === 'plasma') {
      points += 25;
    }

    return points;
  }

  isEligibleForCampaign(donation, campaign) {
    if (new Date() < new Date(campaign.startDate) || 
        new Date() > new Date(campaign.endDate)) {
      return false;
    }

    return campaign.conditions.every(condition => {
      switch (condition.type) {
        case 'bloodType':
          return condition.values.includes(donation.bloodType);
        case 'donationType':
          return condition.values.includes(donation.type);
        case 'location':
          return condition.values.includes(donation.hospitalId);
        default:
          return true;
      }
    });
  }

  async checkMilestones(donorId, donation) {
    const totalDonations = donation.donationNumber;
    const milestones = [1, 5, 10, 25, 50, 100];
    
    if (milestones.includes(totalDonations)) {
      await this.awardMilestoneReward(donorId, totalDonations);
    }
  }

  async awardMilestoneReward(donorId, milestone) {
    const rewards = {
      1: {
        type: 'FIRST_TIME',
        description: 'First Time Donor Badge',
        points: 50
      },
      5: {
        type: 'REGULAR',
        description: 'Regular Donor Badge',
        points: 100
      },
      10: {
        type: 'COMMITTED',
        description: 'Committed Donor Badge + Health Checkup',
        points: 200
      },
      25: {
        type: 'DEDICATED',
        description: 'Dedicated Donor Badge + Insurance Discount',
        points: 500
      },
      50: {
        type: 'ELITE',
        description: 'Elite Donor Badge + Premium Benefits',
        points: 1000
      },
      100: {
        type: 'LEGENDARY',
        description: 'Legendary Donor Badge + Lifetime Benefits',
        points: 2000
      }
    };

    const reward = rewards[milestone];
    if (reward) {
      await this.addReward(donorId, {
        type: reward.type,
        description: reward.description,
        points: reward.points,
        milestone
      });
    }
  }

  async addReward(donorId, reward) {
    const rewardId = Date.now().toString();
    const rewardEntry = {
      id: rewardId,
      donorId,
      ...reward,
      awardedAt: new Date().toISOString(),
      status: 'active'
    };

    if (!this.rewards.has(donorId)) {
      this.rewards.set(donorId, []);
    }
    this.rewards.get(donorId).push(rewardEntry);
    this.rewardHistory.push(rewardEntry);

    // Update points
    if (reward.points) {
      const currentPoints = this.donorPoints.get(donorId) || 0;
      this.donorPoints.set(donorId, currentPoints + reward.points);
    }

    return rewardEntry;
  }

  getDonorRewards(donorId) {
    return this.rewards.get(donorId) || [];
  }

  getDonorPoints(donorId) {
    return this.donorPoints.get(donorId) || 0;
  }

  getDonorTier(donorId) {
    const points = this.getDonorPoints(donorId);
    const tiers = Object.entries(this.rewardTiers)
      .sort((a, b) => b[1].minPoints - a[1].minPoints);

    for (const [tier, details] of tiers) {
      if (points >= details.minPoints) {
        return {
          tier,
          ...details,
          points,
          nextTier: this.getNextTier(tier, points)
        };
      }
    }
  }

  getNextTier(currentTier, points) {
    const tiers = Object.entries(this.rewardTiers)
      .sort((a, b) => a[1].minPoints - b[1].minPoints);

    for (const [tier, details] of tiers) {
      if (details.minPoints > points) {
        return {
          tier,
          ...details,
          pointsNeeded: details.minPoints - points
        };
      }
    }
    return null;
  }

  getActiveCampaigns() {
    const now = new Date();
    return Array.from(this.specialCampaigns.values())
      .filter(campaign => 
        new Date(campaign.startDate) <= now &&
        new Date(campaign.endDate) >= now &&
        campaign.status === 'active'
      );
  }

  generateDonorReport(donorId) {
    const points = this.getDonorPoints(donorId);
    const tier = this.getDonorTier(donorId);
    const rewards = this.getDonorRewards(donorId);
    
    return {
      donorId,
      points,
      tier,
      rewards,
      campaigns: Array.from(this.specialCampaigns.values())
        .filter(campaign => campaign.participants.has(donorId))
    };
  }
}
