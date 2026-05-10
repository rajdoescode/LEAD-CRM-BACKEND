const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const leadsPath = path.join(__dirname, '..', 'data', 'leads.json');
const getLeads = () => JSON.parse(fs.readFileSync(leadsPath, 'utf8'));
const saveLeads = (data) => fs.writeFileSync(leadsPath, JSON.stringify(data, null, 2));

router.get('/', (req, res) => {
  const { page = 1, limit = 25, search = '', status, source, sort = 'createdAt' } = req.query;
  let filtered = getLeads();
  
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(l => 
      l.name.toLowerCase().includes(s) ||
      l.email.toLowerCase().includes(s) ||
      l.company.toLowerCase().includes(s)
    );
  }
  if (status) filtered = filtered.filter(l => l.status === status);
  if (source) filtered = filtered.filter(l => l.source === source);
  
  filtered.sort((a, b) => {
    if (sort === 'score') return b.score - a.score;
    if (sort === 'value') return b.value - a.value;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + parseInt(limit));
  
  res.json({
    data: paginated,
    pagination: { total: filtered.length, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(filtered.length / limit) }
  });
});

router.get('/:id', (req, res) => {
  const lead = getLeads().find(l => l.id === req.params.id);
  lead ? res.json(lead) : res.status(404).json({ error: 'Lead not found' });
});

router.post('/', (req, res) => {
  const leads = getLeads();
  const newLead = {
    id: `lead_${Date.now()}`,
    ...req.body,
    score: req.body.score || 0,
    notes: [],
    activities: [],
    tags: req.body.tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  leads.push(newLead);
  saveLeads(leads);
  res.status(201).json(newLead);
});

router.put('/:id', (req, res) => {
  const leads = getLeads();
  const idx = leads.findIndex(l => l.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Lead not found' });
  leads[idx] = { ...leads[idx], ...req.body, updatedAt: new Date().toISOString() };
  saveLeads(leads);
  res.json(leads[idx]);
});

router.delete('/:id', (req, res) => {
  const leads = getLeads();
  const idx = leads.findIndex(l => l.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Lead not found' });
  leads.splice(idx, 1);
  saveLeads(leads);
  res.json({ success: true });
});

router.post('/bulk-delete', (req, res) => {
  const { ids } = req.body;
  const leads = getLeads();
  const remaining = leads.filter(l => !ids.includes(l.id));
  saveLeads(remaining);
  res.json({ deleted: leads.length - remaining.length });
});

module.exports = router;
