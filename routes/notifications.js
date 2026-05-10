const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const notifPath = path.join(__dirname, '..', 'data', 'notifications.json');
const getNotifs = () => JSON.parse(fs.readFileSync(notifPath, 'utf8'));
const saveNotifs = (data) => fs.writeFileSync(notifPath, JSON.stringify(data, null, 2));

router.get('/', (req, res) => {
  const notifs = getNotifs().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(notifs);
});

router.put('/:id/read', (req, res) => {
  const notifs = getNotifs();
  const notif = notifs.find(n => n.id === req.params.id);
  if (!notif) return res.status(404).json({ error: 'Notification not found' });
  notif.read = true;
  saveNotifs(notifs);
  res.json(notif);
});

router.put('/mark-all-read', (req, res) => {
  const notifs = getNotifs();
  notifs.forEach(n => n.read = true);
  saveNotifs(notifs);
  res.json({ success: true });
});

module.exports = router;
