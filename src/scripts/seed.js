import { faker } from '@faker-js/faker';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../../data');

const writeData = (filename, data) => {
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✅ Seeded ${filename} (${Array.isArray(data) ? data.length : Object.keys(data).length} records)`);
};

// ─── UTILS ──────────────────────────────────────────────────────────
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const generateDate = (daysAgo = 60) => faker.date.recent({ days: daysAgo }).toISOString();

const runSeed = () => {
  console.log('🌱 Starting database seeding...');

  // 1. USERS
  const roles = ['admin', 'sales_manager', 'sales_rep', 'support_agent', 'marketing'];
  const users = Array.from({ length: 50 }).map((_, i) => ({
    id: `user_${i + 1}`,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: randomItem(roles),
    avatar: faker.image.avatar(),
    pin: faker.string.numeric(4),
    status: randomItem(['active', 'active', 'active', 'inactive', 'suspended']),
    performance: {
      leadsConverted: randomInt(10, 200),
      totalDeals: randomInt(5, 50),
      revenue: randomInt(10000, 500000),
      winRate: randomInt(20, 85)
    },
    createdAt: generateDate(365)
  }));
  
  // Ensure we have specific user types requested by user
  users[0] = { ...users[0], role: 'admin', email: 'admin@leadcrm.com', pin: '1234', name: 'Super Admin' };
  writeData('users.json', users);

  // 2. SETTINGS
  const settings = {
    general: { companyName: 'LeadCRM Enterprise', timezone: 'UTC', currency: 'USD' },
    notifications: { email: true, push: true, slack: false },
    security: { require2FA: false, sessionTimeout: 60 }
  };
  writeData('settings.json', settings);

  // 3. LEADS
  const sources = ['Website', 'Referral', 'LinkedIn', 'Cold Email', 'Conference', 'Organic Search'];
  const leadStatuses = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
  const allTags = ['enterprise', 'high-value', 'mid-market', 'startup', 'saas', 'healthcare', 'fintech', 'creative', 'urgent'];
  
  const leads = Array.from({ length: 150 }).map((_, i) => {
    const id = `lead_${i + 1}`;
    const status = randomItem(leadStatuses);
    const score = randomInt(10, 99);
    return {
      id,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      company: faker.company.name(),
      position: faker.person.jobTitle(),
      source: randomItem(sources),
      status,
      score,
      value: randomInt(5000, 150000),
      owner: randomItem(users).id,
      tags: faker.helpers.arrayElements(allTags, randomInt(1, 4)),
      createdAt: generateDate(180),
      updatedAt: generateDate(30),
      notes: Array.from({ length: randomInt(0, 3) }).map((_, ni) => ({
        id: `note_${id}_${ni}`,
        text: faker.lorem.sentences(2),
        createdBy: randomItem(users).id,
        createdAt: generateDate(30)
      })),
      activities: [] // Will populate globally later
    };
  });
  writeData('leads.json', leads);

  // 4. PIPELINE (Deals & Stages)
  const pipelineStages = [
    { id: "stage_new", name: "New Leads", color: "#8B5CF6", order: 0 },
    { id: "stage_contacted", name: "Contacted", color: "#3B82F6", order: 1 },
    { id: "stage_qualified", name: "Qualified", color: "#06B6D4", order: 2 },
    { id: "stage_proposal", name: "Proposal Sent", color: "#F59E0B", order: 3 },
    { id: "stage_negotiation", name: "Negotiation", color: "#EF4444", order: 4 },
    { id: "stage_won", name: "Won", color: "#10B981", order: 5 }
  ];

  const activeLeads = leads.filter(l => l.status !== 'lost');
  const deals = activeLeads.slice(0, 80).map((lead, i) => {
    // Map lead status to stage
    const stageId = `stage_${lead.status}`;
    return {
      id: `deal_${i + 1}`,
      leadId: lead.id,
      title: `${lead.company} - ${faker.commerce.productName()} License`,
      value: lead.value,
      stage: stageId,
      probability: randomInt(10, 90),
      owner: lead.owner,
      expectedClose: faker.date.future({ years: 0.5 }).toISOString().split('T')[0],
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt
    };
  });
  writeData('pipeline.json', { stages: pipelineStages, deals });

  // 5. ACTIVITIES (Global)
  const activityTypes = ['lead_created', 'email_sent', 'call_made', 'meeting_scheduled', 'deal_won', 'note_added', 'deal_lost'];
  const activities = Array.from({ length: 300 }).map((_, i) => ({
    id: `act_${i + 1}`,
    type: randomItem(activityTypes),
    title: faker.hacker.phrase(),
    user: randomItem(users).name,
    leadId: randomItem(leads).id,
    createdAt: generateDate(60)
  }));
  // Attach some to leads
  activities.forEach(act => {
    const lead = leads.find(l => l.id === act.leadId);
    if (lead && lead.activities.length < 5) lead.activities.push(act);
  });
  writeData('activities.json', activities);
  writeData('leads.json', leads); // Re-write leads with activities

  // 6. TASKS
  const taskTypes = ['call', 'meeting', 'email', 'document'];
  const taskStatuses = ['pending', 'in_progress', 'completed'];
  const priorities = ['low', 'medium', 'high', 'urgent'];
  
  const tasks = Array.from({ length: 150 }).map((_, i) => ({
    id: `task_${i + 1}`,
    title: faker.company.catchPhrase(),
    description: faker.lorem.sentence(),
    type: randomItem(taskTypes),
    priority: randomItem(priorities),
    status: randomItem(taskStatuses),
    dueDate: faker.date.soon({ days: 14 }).toISOString(),
    assignee: randomItem(users).id,
    leadId: randomItem(leads).id,
    createdAt: generateDate(30),
    updatedAt: generateDate(5)
  }));
  writeData('tasks.json', tasks);

  // 7. NOTIFICATIONS
  const notifTypes = ['deal_update', 'new_lead', 'task_due', 'deal_won', 'mention', 'task_assigned'];
  const notifications = Array.from({ length: 120 }).map((_, i) => ({
    id: `notif_${i + 1}`,
    type: randomItem(notifTypes),
    title: faker.helpers.arrayElement(['Deal moved', 'New comment', 'Task overdue', 'Meeting reminder']),
    message: faker.lorem.sentence(),
    read: Math.random() > 0.4,
    createdAt: generateDate(10),
    userId: randomItem(users).id
  }));
  writeData('notifications.json', notifications);

  // 8. POLICIES & SUBSCRIPTIONS (Requested by user)
  const policies = Array.from({ length: 100 }).map((_, i) => ({
    id: `pol_${i + 1}`,
    policyNumber: faker.string.alphanumeric(10).toUpperCase(),
    type: randomItem(['motor', 'health', 'life', 'property']),
    provider: faker.company.name(),
    premium: randomInt(500, 5000),
    status: randomItem(['active', 'expired', 'cancelled', 'pending']),
    clientId: randomItem(leads).id,
    agentId: randomItem(users).id,
    startDate: generateDate(365),
    endDate: faker.date.future({ years: 1 }).toISOString(),
    commission: randomInt(50, 500)
  }));
  writeData('policies.json', policies);

  const subscriptions = Array.from({ length: 100 }).map((_, i) => ({
    id: `sub_${i + 1}`,
    plan: randomItem(['Basic', 'Pro', 'Enterprise']),
    status: randomItem(['active', 'past_due', 'canceled', 'trialing']),
    amount: randomItem([49, 99, 299, 999]),
    billingCycle: randomItem(['monthly', 'yearly']),
    clientId: randomItem(leads).id,
    nextBillingDate: faker.date.soon({ days: 30 }).toISOString(),
    createdAt: generateDate(180)
  }));
  writeData('subscriptions.json', subscriptions);

  // 9. PAYMENTS & INCENTIVES
  const payments = Array.from({ length: 200 }).map((_, i) => ({
    id: `pay_${i + 1}`,
    amount: randomInt(100, 10000),
    currency: 'USD',
    status: randomItem(['successful', 'successful', 'failed', 'refunded', 'pending']),
    method: randomItem(['credit_card', 'bank_transfer', 'crypto']),
    referenceId: randomItem(subscriptions).id,
    clientId: randomItem(leads).id,
    createdAt: generateDate(90)
  }));
  writeData('payments.json', payments);

  const incentives = Array.from({ length: 80 }).map((_, i) => ({
    id: `inc_${i + 1}`,
    agentId: randomItem(users).id,
    amount: randomInt(100, 2500),
    type: randomItem(['commission', 'bonus', 'referral']),
    status: randomItem(['paid', 'pending', 'approved']),
    period: 'Q2 2026',
    createdAt: generateDate(60)
  }));
  writeData('incentives.json', incentives);

  // 10. SESSIONS & REPORTS
  const sessions = Array.from({ length: 150 }).map((_, i) => ({
    id: `sess_${i + 1}`,
    userId: randomItem(users).id,
    ipAddress: faker.internet.ipv4(),
    device: randomItem(['Desktop - Chrome', 'Mobile - iOS', 'Desktop - Safari', 'Mobile - Android']),
    location: `${faker.location.city()}, ${faker.location.countryCode()}`,
    startedAt: generateDate(10),
    endedAt: generateDate(9),
    durationSeconds: randomInt(60, 7200)
  }));
  writeData('sessions.json', sessions);

  const reports = Array.from({ length: 20 }).map((_, i) => ({
    id: `rep_${i + 1}`,
    title: `${faker.company.buzzAdjective()} Performance Report`,
    type: randomItem(['sales', 'revenue', 'activity', 'conversion']),
    generatedBy: randomItem(users).id,
    url: `/downloads/report_${i+1}.pdf`,
    createdAt: generateDate(30)
  }));
  writeData('reports.json', reports);

  // 11. ANALYTICS (Aggregated stats)
  const analytics = {
    revenue: {
      monthly: Array.from({ length: 6 }).map((_, i) => ({
        month: faker.date.month({ abbreviated: true }),
        value: randomInt(30000, 120000)
      })),
      total: 450000,
      change: 14.5
    },
    leadSources: sources.map(s => ({
      source: s,
      count: randomInt(10, 80),
      percentage: randomInt(5, 35)
    })),
    conversionFunnel: pipelineStages.map(s => ({
      stage: s.name,
      count: randomInt(10, 100)
    })).sort((a,b) => b.count - a.count), // funnel should decrease
    kpis: {
      totalLeads: leads.length,
      totalLeadsChange: randomInt(-5, 25),
      activeDeals: deals.length,
      activeDealsChange: randomInt(-5, 15),
      conversionRate: 14.2,
      conversionRateChange: 2.1,
      totalRevenue: deals.reduce((sum, d) => sum + d.value, 0),
      totalRevenueChange: 18.5,
      avgDealSize: 35000,
      avgDealSizeChange: 4.2
    }
  };
  writeData('analytics.json', analytics);

  console.log('✅ Seeding complete! 🚀');
};

runSeed();
