const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, '..', 'data', 'users.json');
const getUsers = () => JSON.parse(fs.readFileSync(usersPath, 'utf8'));

router.post('/verify-pin', (req, res) => {
  const { pin } = req.body;
  const users = getUsers();
  const user = users.find(u => u.pin === pin);
  
  if (user) {
    const { pin: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } else {
    res.status(401).json({ success: false, message: 'Invalid PIN' });
  }
});

router.post('/change-pin', (req, res) => {
  const { userId, oldPin, newPin } = req.body;
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user.pin !== oldPin) return res.status(401).json({ success: false, message: 'Incorrect current PIN' });
  
  user.pin = newPin;
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  res.json({ success: true, message: 'PIN changed successfully' });
});

module.exports = router;
