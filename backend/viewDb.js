require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const ServiceProvider = require('./models/ServiceProvider');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/local_service_directory';

async function viewDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('\n============================================================');
    console.log('  MONGODB DATABASE: local_service_directory');
    console.log('  STATUS: Connected successfully on ' + MONGO_URI);
    console.log('============================================================\n');

    // 1. Collections in DB
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 COLLECTIONS (TABLES) IN DATABASE:');
    console.table(collections.map(c => ({ 'Collection Name': c.name, 'Type': c.type })));

    // 2. Users Table
    const users = await User.find({}).select('-password').lean();
    console.log(`\n👤 USERS TABLE (${users.length} Records):`);
    console.table(
      users.map((u, i) => ({
        '#': i + 1,
        'Name': u.name,
        'Email': u.email,
        'Role': u.role.toUpperCase(),
        'Phone': u.phone,
        'Status': u.isActive ? 'Active' : 'Inactive',
        'Created At': new Date(u.createdAt).toLocaleDateString()
      }))
    );

    // 3. Service Providers Table
    const providers = await ServiceProvider.find({}).lean();
    console.log(`\n🔧 SERVICE PROVIDERS TABLE (${providers.length} Records):`);
    console.table(
      providers.map((p, i) => ({
        '#': i + 1,
        'Name': p.name,
        'Category': p.category,
        'Area': p.area,
        'Phone': p.phone,
        'Rating': `★ ${p.rating}`,
        'Experience': `${p.experienceYears} yrs`,
        'Visit Fee': `₹${p.visitCharge}`,
        'Available': p.availability ? 'Yes' : 'No',
        'Verified': p.verified ? 'Yes' : 'No'
      }))
    );

    // 4. Summary Stats
    const stats = await ServiceProvider.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
      { $sort: { count: -1 } }
    ]);
    console.log('\n📊 PROVIDERS BY CATEGORY SUMMARY:');
    console.table(
      stats.map(s => ({
        'Category': s._id,
        'Total Providers': s.count,
        'Average Rating': s.avgRating.toFixed(1)
      }))
    );

    console.log('\n✅ Database check complete.\n');
  } catch (err) {
    console.error('Error viewing database:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

viewDatabase();
