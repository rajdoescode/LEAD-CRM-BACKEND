const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const tasksPath = path.join(__dirname, '..', 'data', 'tasks.json');
const getTasks = () => JSON.parse(fs.readFileSync(tasksPath, 'utf8'));
const saveTasks = (data) => fs.writeFileSync(tasksPath, JSON.stringify(data, null, 2));

router.get('/', (req, res) => {
  const { status, assignee, priority } = req.query;
  let tasks = getTasks();
  if (status) tasks = tasks.filter(t => t.status === status);
  if (assignee) tasks = tasks.filter(t => t.assignee === assignee);
  if (priority) tasks = tasks.filter(t => t.priority === priority);
  tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  res.json(tasks);
});

router.post('/', (req, res) => {
  const tasks = getTasks();
  const newTask = { id: `task_${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
  tasks.push(newTask);
  saveTasks(tasks);
  res.status(201).json(newTask);
});

router.put('/:id', (req, res) => {
  const tasks = getTasks();
  const idx = tasks.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Task not found' });
  tasks[idx] = { ...tasks[idx], ...req.body };
  saveTasks(tasks);
  res.json(tasks[idx]);
});

router.delete('/:id', (req, res) => {
  const tasks = getTasks();
  const idx = tasks.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Task not found' });
  tasks.splice(idx, 1);
  saveTasks(tasks);
  res.json({ success: true });
});

module.exports = router;
