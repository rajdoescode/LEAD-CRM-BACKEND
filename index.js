import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import leadsRoutes from './routes/leads.js';
import pipelineRoutes from './routes/pipeline.js';
import analyticsRoutes from './routes/analytics.js';
import usersRoutes from './routes/users.js';
import tasksRoutes from './routes/tasks.js';
import notificationsRoutes from './routes/notifications.js';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/pipeline', pipelineRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/notifications', notificationsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
