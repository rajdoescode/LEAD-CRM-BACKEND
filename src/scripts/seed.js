/**
 * Seed script — Creates initial admin user for the CRM.
 * Run: npm run seed
 *
 * NOTE: This is SAFE for production — it only creates the admin user
 * if no users exist, and NEVER generates fake data.
 */
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/User.js';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not set in .env');
  process.exit(1);
}

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const existingUsers = await User.countDocuments();

    if (existingUsers > 0) {
      console.log(`ℹ️  ${existingUsers} user(s) already exist. Skipping seed.`);
      console.log('   To add users, use the POST /api/users endpoint.');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create default admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@leadcrm.com',
      pin: '1234',
      role: 'admin',
      phone: '',
      department: 'Management',
      isActive: true,
    });

    console.log('✅ Admin user created:');
    console.log(`   Name:  ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   PIN:   1234`);
    console.log(`   Role:  ${admin.role}`);

    await mongoose.disconnect();
    console.log('\n🎉 Seed completed. You can now login with PIN: 1234');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();
