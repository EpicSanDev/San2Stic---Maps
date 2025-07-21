const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validationMiddleware');
const Joi = require('joi');
const { User, Proposal, Vote } = require('../models');
const { Op } = require('sequelize');

// Validation schemas
const proposalSchema = Joi.object({
  title: Joi.string().required().min(10).max(100),
  description: Joi.string().required().min(50).max(1000),
  type: Joi.string().valid('platform_parameter', 'content_policy', 'community_guideline', 'feature_request').required(),
  options: Joi.array().items(Joi.string().max(50)).min(2).max(5).default(['For', 'Against']),
  votingPeriod: Joi.number().integer().min(1).max(30).default(7)
});

const voteSchema = Joi.object({
  option: Joi.number().integer().min(0).required()
});

// Get proposals with filtering
router.get('/proposals', authenticateToken, async (req, res) => {
  try {
    const { status = 'active', page = 1, limit = 10 } = req.query;
    const userId = req.user.id;
    const offset = (page - 1) * limit;

    let whereConditions = {};
    
    switch (status) {
      case 'active':
        whereConditions = {
          status: 'active',
          endDate: { [Op.gt]: new Date() }
        };
        break;
      case 'passed':
        whereConditions = { status: 'passed' };
        break;
      case 'rejected':
        whereConditions = { status: 'rejected' };
        break;
      default:
        whereConditions = { status };
    }

    const proposals = await Proposal.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'reputation']
        },
        {
          model: Vote,
          attributes: ['userId', 'option'],
          required: false
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    // Process proposals to add vote counts and user vote status
    const processedProposals = proposals.rows.map(proposal => {
      const votes = proposal.Votes || [];
      const voteCounts = {};
      let totalVotes = 0;
      let userVote = undefined;

      // Count votes for each option
      proposal.options.forEach((_, index) => {
        voteCounts[index] = 0;
      });

      votes.forEach(vote => {
        if (voteCounts[vote.option] !== undefined) {
          voteCounts[vote.option]++;
          totalVotes++;
        }
        if (vote.userId === userId) {
          userVote = vote.option;
        }
      });

      return {
        id: proposal.id,
        title: proposal.title,
        description: proposal.description,
        type: proposal.type,
        options: proposal.options,
        status: proposal.status,
        createdAt: proposal.createdAt,
        endDate: proposal.endDate,
        creator: proposal.creator,
        voteCounts,
        totalVotes,
        userVote
      };
    });

    res.json(processedProposals);
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new proposal (requires minimum reputation)
router.post('/proposals', authenticateToken, validateRequest(proposalSchema), async (req, res) => {
  try {
    const { title, description, type, options, votingPeriod } = req.body;
    const userId = req.user.id;

    // Check user reputation requirement
    const user = await User.findByPk(userId);
    if (user.reputation < 500) {
      return res.status(403).json({ 
        message: 'Minimum reputation of 500 required to create proposals' 
      });
    }

    // Check rate limiting (max 1 proposal per week per user)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentProposals = await Proposal.count({
      where: {
        creatorId: userId,
        createdAt: { [Op.gte]: oneWeekAgo }
      }
    });

    if (recentProposals >= 1) {
      return res.status(429).json({ 
        message: 'Rate limit: You can only create one proposal per week' 
      });
    }

    // Calculate end date
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + votingPeriod);

    // Create proposal
    const proposal = await Proposal.create({
      title,
      description,
      type,
      options,
      status: 'active',
      creatorId: userId,
      endDate,
      votingPeriod
    });

    // Fetch with creator info
    const createdProposal = await Proposal.findByPk(proposal.id, {
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'reputation']
      }]
    });

    res.status(201).json(createdProposal);
  } catch (error) {
    console.error('Error creating proposal:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Vote on a proposal
router.post('/proposals/:id/vote', authenticateToken, validateRequest(voteSchema), async (req, res) => {
  try {
    const proposalId = parseInt(req.params.id);
    const { option } = req.body;
    const userId = req.user.id;

    // Get proposal
    const proposal = await Proposal.findByPk(proposalId);
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    // Check if proposal is active and not expired
    if (proposal.status !== 'active') {
      return res.status(400).json({ message: 'Proposal is not active' });
    }

    if (new Date() > proposal.endDate) {
      return res.status(400).json({ message: 'Voting period has ended' });
    }

    // Validate option
    if (option < 0 || option >= proposal.options.length) {
      return res.status(400).json({ message: 'Invalid vote option' });
    }

    // Check if user already voted
    const existingVote = await Vote.findOne({
      where: { proposalId, userId }
    });

    if (existingVote) {
      // Update existing vote
      await existingVote.update({ option });
    } else {
      // Create new vote
      await Vote.create({
        proposalId,
        userId,
        option
      });
    }

    res.json({ message: 'Vote cast successfully' });
  } catch (error) {
    console.error('Error voting:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get proposal details with vote breakdown
router.get('/proposals/:id', authenticateToken, async (req, res) => {
  try {
    const proposalId = parseInt(req.params.id);
    const userId = req.user.id;

    const proposal = await Proposal.findByPk(proposalId, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'reputation']
        },
        {
          model: Vote,
          include: [{
            model: User,
            attributes: ['id', 'username', 'reputation']
          }]
        }
      ]
    });

    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    // Process vote data
    const votes = proposal.Votes || [];
    const voteCounts = {};
    const votesByOption = {};
    let totalVotes = 0;
    let userVote = undefined;

    // Initialize counters
    proposal.options.forEach((option, index) => {
      voteCounts[index] = 0;
      votesByOption[index] = [];
    });

    // Count votes and organize by option
    votes.forEach(vote => {
      if (voteCounts[vote.option] !== undefined) {
        voteCounts[vote.option]++;
        totalVotes++;
        votesByOption[vote.option].push({
          user: vote.User,
          createdAt: vote.createdAt
        });
      }
      if (vote.userId === userId) {
        userVote = vote.option;
      }
    });

    // Calculate weighted vote (based on reputation)
    const weightedVoteCounts = {};
    proposal.options.forEach((_, index) => {
      weightedVoteCounts[index] = votesByOption[index].reduce((sum, vote) => {
        return sum + Math.min(vote.user.reputation / 100, 10); // Cap weight at 10
      }, 0);
    });

    res.json({
      ...proposal.toJSON(),
      voteCounts,
      weightedVoteCounts,
      votesByOption,
      totalVotes,
      userVote
    });
  } catch (error) {
    console.error('Error fetching proposal details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin: Update proposal status
router.patch('/proposals/:id/status', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const proposalId = parseInt(req.params.id);
    const { status } = req.body;

    if (!['active', 'passed', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const proposal = await Proposal.findByPk(proposalId);
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    await proposal.update({ status });

    res.json({ message: 'Proposal status updated successfully' });
  } catch (error) {
    console.error('Error updating proposal status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get governance statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const [
      totalProposals,
      activeProposals,
      passedProposals,
      rejectedProposals,
      totalVotes,
      participationRate
    ] = await Promise.all([
      Proposal.count(),
      Proposal.count({ where: { status: 'active' } }),
      Proposal.count({ where: { status: 'passed' } }),
      Proposal.count({ where: { status: 'rejected' } }),
      Vote.count(),
      calculateParticipationRate()
    ]);

    res.json({
      totalProposals,
      activeProposals,
      passedProposals,
      rejectedProposals,
      totalVotes,
      participationRate: Math.round(participationRate * 100) / 100
    });
  } catch (error) {
    console.error('Error fetching governance stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Helper function to calculate participation rate
async function calculateParticipationRate() {
  const [totalUsers, activeVoters] = await Promise.all([
    User.count({ where: { isActive: true } }),
    Vote.findAll({
      attributes: ['userId'],
      group: ['userId'],
      where: {
        createdAt: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    })
  ]);

  if (totalUsers === 0) return 0;
  return (activeVoters.length / totalUsers) * 100;
}

// Scheduled job to close expired proposals (call this from a cron job)
router.post('/close-expired', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const expiredProposals = await Proposal.findAll({
      where: {
        status: 'active',
        endDate: { [Op.lt]: new Date() }
      },
      include: [{
        model: Vote,
        attributes: ['option']
      }]
    });

    for (const proposal of expiredProposals) {
      // Calculate results
      const votes = proposal.Votes || [];
      const voteCounts = {};
      
      proposal.options.forEach((_, index) => {
        voteCounts[index] = 0;
      });
      
      votes.forEach(vote => {
        if (voteCounts[vote.option] !== undefined) {
          voteCounts[vote.option]++;
        }
      });

      // Determine winner (simple majority)
      const maxVotes = Math.max(...Object.values(voteCounts));
      const winningOptions = Object.keys(voteCounts).filter(
        key => voteCounts[key] === maxVotes
      );

      let newStatus = 'rejected';
      if (winningOptions.length === 1) {
        // Clear winner
        const winningOption = parseInt(winningOptions[0]);
        if (proposal.options[winningOption].toLowerCase() === 'for' || 
            proposal.options[winningOption].toLowerCase() === 'yes') {
          newStatus = 'passed';
        }
      }

      await proposal.update({ status: newStatus });
    }

    res.json({ 
      message: `Closed ${expiredProposals.length} expired proposals` 
    });
  } catch (error) {
    console.error('Error closing expired proposals:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;