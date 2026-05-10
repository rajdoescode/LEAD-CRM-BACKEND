const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const pipelinePath = path.join(__dirname, '..', 'data', 'pipeline.json');
const getPipeline = () => JSON.parse(fs.readFileSync(pipelinePath, 'utf8'));
const savePipeline = (data) => fs.writeFileSync(pipelinePath, JSON.stringify(data, null, 2));

router.get('/', (req, res) => {
  res.json(getPipeline());
});

router.get('/stages', (req, res) => {
  res.json(getPipeline().stages);
});

router.get('/deals', (req, res) => {
  res.json(getPipeline().deals);
});

router.put('/deals/:id/stage', (req, res) => {
  const { stage } = req.body;
  const pipeline = getPipeline();
  const deal = pipeline.deals.find(d => d.id === req.params.id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });
  deal.stage = stage;
  savePipeline(pipeline);
  res.json(deal);
});

router.post('/deals', (req, res) => {
  const pipeline = getPipeline();
  const newDeal = { id: `deal_${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
  pipeline.deals.push(newDeal);
  savePipeline(pipeline);
  res.status(201).json(newDeal);
});

router.put('/deals/:id', (req, res) => {
  const pipeline = getPipeline();
  const idx = pipeline.deals.findIndex(d => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Deal not found' });
  pipeline.deals[idx] = { ...pipeline.deals[idx], ...req.body };
  savePipeline(pipeline);
  res.json(pipeline.deals[idx]);
});

module.exports = router;
