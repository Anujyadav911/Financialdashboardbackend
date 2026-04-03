/**
 * Database Seeder — creates sample users and financial records for testing.
 * Run: npm run seed
 * WARNING: This will clear existing data in development!
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');
const FinancialRecord = require('../models/record.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/finance_dashboard';

const SEED_USERS = [
  {
    name: 'Super Admin',
    email: 'admin@finance.dev',
    password: 'Admin@123',
    role: 'admin',
    isActive: true,
  },
  {
    name: 'Alice Analyst',
    email: 'analyst@finance.dev',
    password: 'Analyst@123',
    role: 'analyst',
    isActive: true,
  },
  {
    name: 'Bob Viewer',
    email: 'viewer@finance.dev',
    password: 'Viewer@123',
    role: 'viewer',
    isActive: true,
  },
];

const generateRecords = (userId) => {
  const categories = [
    'salary', 'freelance', 'food', 'transport', 'utilities',
    'entertainment', 'shopping', 'healthcare', 'investment', 'other',
  ];

  const records = [];
  const now = new Date();

  for (let i = 0; i < 60; i++) {
    const isIncome = Math.random() > 0.5;
    const daysAgo = Math.floor(Math.random() * 365);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);

    records.push({
      user: userId,
      amount: parseFloat((Math.random() * 5000 + 50).toFixed(2)),
      type: isIncome ? 'income' : 'expense',
      category: isIncome
        ? categories.filter(c => ['salary', 'freelance', 'investment'].includes(c))[Math.floor(Math.random() * 3)]
        : categories.filter(c => !['salary', 'freelance', 'investment'].includes(c))[Math.floor(Math.random() * 7)],
      date,
      description: isIncome
        ? `Income entry #${i + 1}`
        : `Expense entry #${i + 1}`,
    });
  }

  return records;
};

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing collections
    await User.deleteMany({});
    await FinancialRecord.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const createdUsers = await User.create(SEED_USERS);
    console.log(`👤 Created ${createdUsers.length} users:`);
    createdUsers.forEach(u => console.log(`   → ${u.role.padEnd(8)} | ${u.email} | password: ${SEED_USERS.find(s => s.email === u.email).password}`));

    // Create financial records for each user
    for (const user of createdUsers) {
      const records = generateRecords(user._id);
      await FinancialRecord.insertMany(records);
      console.log(`📊 Created ${records.length} financial records for ${user.name}`);
    }

    console.log('\n✅ Seeding complete!');
    console.log('\n📋 Login Credentials:');
    console.log('   Admin   → admin@finance.dev     / Admin@123');
    console.log('   Analyst → analyst@finance.dev   / Analyst@123');
    console.log('   Viewer  → viewer@finance.dev    / Viewer@123');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seed();
