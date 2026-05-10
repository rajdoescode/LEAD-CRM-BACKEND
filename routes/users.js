const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, '..', 'data', 'users.json');
const getUsers = () => JSON.parse(fs.readFileSync(usersPath, 'utf8'));

router.get('/', (req, res) => {
  const users = getUsers().map(({ pin, ...u }) => u);
  res.json(users);
});

router.get('/:id', (req, res) => {
  const user = getUsers().find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { pin, ...safeUser } = user;
  res.json(safeUser);
});

module.exports = router;
