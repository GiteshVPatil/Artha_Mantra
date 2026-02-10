const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const Trading = require('../models/Trading');

const router = express.Router();

// Middleware to check educator role
const ensureEducator = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'educator') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Educator role required.' 
      });
    }
    next();
  } catch (error) {
    console.error('Role check error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @route   GET /api/admin/students-portfolios
// @desc    Get portfolios of all students with analytics
// @access  Private (Educators only)
router.get('/students-portfolios', auth, ensureEducator, async (req, res) => {
  try {
    console.log('Fetching student portfolios for educator:', req.user.id);

    // Get all student users with their basic info
    const studentUsers = await User.find(
      { role: 'student' }, 
      { 
        firstName: 1, 
        lastName: 1, 
        email: 1, 
        statistics: 1,
        createdAt: 1
      }
    ).sort({ firstName: 1 });

    const userIds = studentUsers.map(user => user._id);
    console.log(`Found ${studentUsers.length} students`);

    // Get portfolios belonging to these students
    const portfolios = await Portfolio.find({ 
      userId: { $in: userIds },
      isActive: true
    }).sort({ createdAt: -1 });

    console.log(`Found ${portfolios.length} portfolios`);

    // Get trading statistics for each student
    const tradingStats = await Trading.aggregate([
      { $match: { userId: { $in: userIds } } },
      {
        $group: {
          _id: '$userId',
          totalTrades: { $sum: 1 },
          successfulTrades: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'EXECUTED'] },
                1,
                0
              ]
            }
          },
          lastTradeDate: { $max: '$createdAt' }
        }
      }
    ]);

    // Create a map for quick lookup
    const tradingStatsMap = {};
    tradingStats.forEach(stat => {
      tradingStatsMap[stat._id.toString()] = stat;
    });

    // Format response: attach student info and trading stats to portfolios
    const portfoliosWithStudentInfo = portfolios.map(portfolio => {
      const owner = studentUsers.find(u => u._id.equals(portfolio.userId));
      const userTradingStats = tradingStatsMap[portfolio.userId.toString()] || {
        totalTrades: 0,
        successfulTrades: 0,
        lastTradeDate: null
      };

      return {
        portfolioId: portfolio._id,
        portfolioName: portfolio.name,
        description: portfolio.description,
        initialAmount: portfolio.initialAmount,
        currentValue: portfolio.currentValue || portfolio.initialAmount,
        availableCash: portfolio.availableCash,
        totalProfitLoss: portfolio.totalProfitLoss || 0,
        totalProfitLossPercentage: portfolio.totalProfitLossPercentage || 0,
        holdingsCount: portfolio.holdings ? portfolio.holdings.length : 0,
        createdAt: portfolio.createdAt,
        lastUpdated: portfolio.updatedAt,
        student: {
          id: owner._id,
          firstName: owner.firstName,
          lastName: owner.lastName,
          email: owner.email,
          joinedDate: owner.createdAt,
          totalTrades: userTradingStats.totalTrades,
          successfulTrades: userTradingStats.successfulTrades,
          successRate: userTradingStats.totalTrades > 0 
            ? ((userTradingStats.successfulTrades / userTradingStats.totalTrades) * 100).toFixed(1)
            : '0',
          lastTradeDate: userTradingStats.lastTradeDate
        }
      };
    });

    // Calculate overall statistics
    const overallStats = {
      totalStudents: studentUsers.length,
      totalPortfolios: portfolios.length,
      averagePortfolioValue: portfolios.length > 0 
        ? (portfolios.reduce((sum, p) => sum + (p.currentValue || p.initialAmount), 0) / portfolios.length).toFixed(2)
        : 0,
      totalProfitable: portfolios.filter(p => (p.totalProfitLoss || 0) > 0).length,
      totalLoss: portfolios.filter(p => (p.totalProfitLoss || 0) < 0).length,
      activeStudents: portfoliosWithStudentInfo.filter(p => p.student.totalTrades > 0).length
    };

    res.json({
      success: true,
      portfolios: portfoliosWithStudentInfo,
      overallStats
    });
  } catch (error) {
    console.error('Educator portfolios fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching student portfolios' 
    });
  }
});

// This route already exists in your admin.js - just making sure it's there
// @route   GET /api/admin/student-detail/:userId
// @desc    Get detailed portfolio and trading history for a specific student
// @access  Private (Educators only)
router.get('/student-detail/:userId', auth, ensureEducator, async (req, res) => {
  try {
    const { userId } = req.params;

    // Get student info
    const student = await User.findById(userId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get student's portfolios with detailed holdings
    const portfolios = await Portfolio.find({ 
      userId: userId,
      isActive: true 
    });

    // Get student's trading history
    const trades = await Trading.find({ userId: userId })
      .sort({ createdAt: -1 })
      .limit(100);

    // Calculate performance metrics
    const totalInvested = portfolios.reduce((sum, p) => sum + (p.initialAmount - p.availableCash), 0);
    const currentValue = portfolios.reduce((sum, p) => sum + (p.currentValue || p.initialAmount), 0);
    const totalProfitLoss = currentValue - portfolios.reduce((sum, p) => sum + p.initialAmount, 0);

    res.json({
      success: true,
      student: {
        id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        joinedDate: student.createdAt,
        statistics: student.statistics,
        lastLogin: student.lastLogin
      },
      portfolios,
      trades,
      performanceMetrics: {
        totalInvested,
        currentValue,
        totalProfitLoss,
        profitLossPercentage: totalInvested > 0 ? ((totalProfitLoss / totalInvested) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Student detail fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});


// @route   GET /api/admin/student-detail/:userId
// @desc    Get detailed portfolio and trading history for a specific student
// @access  Private (Educators only)
router.get('/student-detail/:userId', auth, ensureEducator, async (req, res) => {
  try {
    const { userId } = req.params;

    // Get student info
    const student = await User.findById(userId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get student's portfolios
    const portfolios = await Portfolio.find({ 
      userId: userId,
      isActive: true 
    });

    // Get student's trading history
    const trades = await Trading.find({ userId: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      student: {
        id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        joinedDate: student.createdAt,
        statistics: student.statistics
      },
      portfolios,
      trades
    });
  } catch (error) {
    console.error('Student detail fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;
