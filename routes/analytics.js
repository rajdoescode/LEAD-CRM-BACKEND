const express = require('express');
const router = express.Router();
const analyticsData = require('../data/analytics.json');
const activitiesData = require('../data/activities.json');

router.get('/', (req, res) => {
  res.json(analyticsData);
});

router.get('/kpis', (req, res) => {
  res.json(analyticsData.kpis);
});

router.get('/revenue', (req, res) => {
  res.json(analyticsData.revenue);
});

router.get('/sources', (req, res) => {
  res.json(analyticsData.leadSources);
});

router.get('/funnel', (req, res) => {
  res.json(analyticsData.conversionFunnel);
});

router.get('/activities', (req, res) => {
  const sorted = [...activitiesData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(sorted);
});

module.exports = router;
