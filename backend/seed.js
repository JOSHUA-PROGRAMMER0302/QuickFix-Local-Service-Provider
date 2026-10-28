/**
 * seed.js — QuickFix Database Seeder
 * Run with: npm run seed
 *
 * Seeds:
 *   - 1 Admin user
 *   - 2 Normal users
 *   - 12 realistic Chennai service providers
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const ServiceProvider = require('./models/ServiceProvider');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/local_service_directory';

// ─── Seed Data ────────────────────────────────────────────────────────────────

const users = [
  {
    name: 'Admin User',
    email: 'admin@servicedir.com',
    password: 'Admin@123',
    phone: '9876543210',
    role: 'admin',
    status: 'active',
  },
  {
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    password: 'User@123',
    phone: '9123456780',
    role: 'user',
    status: 'active',
  },
  {
    name: 'Priya Nair',
    email: 'priya@example.com',
    password: 'User@123',
    phone: '9988776655',
    role: 'user',
    status: 'active',
  },
];

const providers = [
  {
    name: 'Murugan Pipe Works',
    category: 'Plumber',
    email: 'murugan.pipes@gmail.com',
    phone: '9444123456',
    area: 'Anna Nagar',
    city: 'Chennai',
    experienceYears: 12,
    visitCharge: 150,
    availability: true,
    verified: true,
    rating: 4.8,
    skills: ['Pipe Fitting', 'Leak Repair', 'Bathroom Fixtures', 'Water Heater Installation'],
    description:
      'Experienced plumber with 12+ years serving Anna Nagar. Expert in all residential and commercial plumbing needs including new installations, repairs, and emergency leak fixes.',
  },
  {
    name: 'Selvam Plumbing Services',
    category: 'Plumber',
    email: 'selvam.plumbing@gmail.com',
    phone: '9500234567',
    area: 'Adyar',
    city: 'Chennai',
    experienceYears: 8,
    visitCharge: 120,
    availability: true,
    verified: true,
    rating: 4.5,
    skills: ['Drain Cleaning', 'Tank Repair', 'Pipe Replacement', 'Motor Pump Service'],
    description:
      'Reliable plumber based in Adyar, available 7 days a week. Specializes in overhead tank repairs, drain unblocking, and pump motor servicing for homes and apartments.',
  },
  {
    name: 'Rajan Electricals',
    category: 'Electrician',
    email: 'rajan.electricals@gmail.com',
    phone: '9677345678',
    area: 'T. Nagar',
    city: 'Chennai',
    experienceYears: 15,
    visitCharge: 200,
    availability: true,
    verified: true,
    rating: 4.9,
    skills: ['Wiring', 'MCB Panel', 'Inverter Installation', 'Ceiling Fan', 'Short Circuit Repair'],
    description:
      'Certified electrician with 15 years of experience in T. Nagar. Handles everything from basic wiring to full electrical panel upgrades, inverter setups, and CCTV installations.',
  },
  {
    name: 'Kumar Power Solutions',
    category: 'Electrician',
    email: 'kumar.power@gmail.com',
    phone: '9380456789',
    area: 'Velachery',
    city: 'Chennai',
    experienceYears: 10,
    visitCharge: 180,
    availability: false,
    verified: true,
    rating: 4.6,
    skills: ['Solar Panel Wiring', 'Earthing', 'Switch Board Repair', 'LED Fitting'],
    description:
      'Velachery-based electrician specializing in modern electrical systems including solar wiring, LED conversions, and smart home device installations.',
  },
  {
    name: 'Vijay Woodcraft',
    category: 'Carpenter',
    email: 'vijay.woodcraft@gmail.com',
    phone: '9445567890',
    area: 'Porur',
    city: 'Chennai',
    experienceYears: 20,
    visitCharge: 250,
    availability: true,
    verified: true,
    rating: 4.7,
    skills: ['Custom Furniture', 'Modular Kitchen', 'Door Frame Repair', 'False Ceiling', 'Cabinet Making'],
    description:
      'Master carpenter with 20 years of craftsmanship. Specializes in modular kitchens, custom wardrobes, false ceilings, and door/window frame repairs across Chennai.',
  },
  {
    name: 'Suresh AC Care',
    category: 'AC Technician',
    email: 'suresh.accare@gmail.com',
    phone: '9841678901',
    area: 'OMR',
    city: 'Chennai',
    experienceYears: 9,
    visitCharge: 300,
    availability: true,
    verified: true,
    rating: 4.8,
    skills: ['AC Installation', 'Gas Refilling', 'Filter Cleaning', 'Compressor Repair', 'Split AC Service'],
    description:
      'Authorized AC technician serving OMR and Sholinganallur. Expert in all AC brands — Samsung, LG, Daikin, Voltas. Provides annual maintenance contracts for residential and office ACs.',
  },
  {
    name: 'Balu Cool Tech',
    category: 'AC Technician',
    email: 'balu.cooltech@gmail.com',
    phone: '9962789012',
    area: 'Tambaram',
    city: 'Chennai',
    experienceYears: 6,
    visitCharge: 275,
    availability: true,
    verified: true,
    rating: 4.4,
    skills: ['Window AC Repair', 'Gas Top-up', 'PCB Repair', 'Cooling Issues'],
    description:
      'Affordable AC repair and maintenance expert in Tambaram. Quick diagnosis and transparent pricing for all AC cooling issues, gas refills, and PCB replacements.',
  },
  {
    name: 'Felix Appliance Experts',
    category: 'Appliance Repair',
    email: 'felix.appliance@gmail.com',
    phone: '9444890123',
    area: 'Chromepet',
    city: 'Chennai',
    experienceYears: 11,
    visitCharge: 199,
    availability: true,
    verified: true,
    rating: 4.6,
    skills: ['Washing Machine', 'Refrigerator', 'Microwave', 'Dishwasher', 'Mixer Grinder'],
    description:
      'Multi-brand home appliance repair specialist in Chromepet. Repairs washing machines, refrigerators, microwaves, and dishwashers with genuine spare parts and 30-day service warranty.',
  },
  {
    name: 'Smart Fix Services',
    category: 'Appliance Repair',
    email: 'smartfix.services@gmail.com',
    phone: '9500901234',
    area: 'Guindy',
    city: 'Chennai',
    experienceYears: 7,
    visitCharge: 149,
    availability: false,
    verified: true,
    rating: 4.3,
    skills: ['TV Repair', 'Set-Top Box', 'Water Purifier', 'Induction Cooktop'],
    description:
      'Budget-friendly appliance repair center in Guindy covering TVs, water purifiers, induction cooktops, and set-top box installations. Same-day service available on most days.',
  },
  {
    name: 'Rainbow Painters',
    category: 'Painter',
    email: 'rainbow.painters@gmail.com',
    phone: '9677012345',
    area: 'Nungambakkam',
    city: 'Chennai',
    experienceYears: 14,
    visitCharge: 100,
    availability: true,
    verified: true,
    rating: 4.7,
    skills: ['Interior Painting', 'Exterior Painting', 'Texture Coating', 'Wood Polish', 'Wallpaper'],
    description:
      'Professional painting team in Nungambakkam. Uses premium Asian Paints and Berger products. Specializes in textured walls, Royale finishes, wood polishing, and full home painting projects.',
  },
  {
    name: 'Artistry Home Painters',
    category: 'Painter',
    email: 'artistry.painters@gmail.com',
    phone: '9380123456',
    area: 'Perambur',
    city: 'Chennai',
    experienceYears: 5,
    visitCharge: 80,
    availability: true,
    verified: true,
    rating: 4.2,
    skills: ['Budget Painting', 'Distemper', 'Emulsion Paint', 'Staircase Painting'],
    description:
      'Affordable and neat painters for budget home renovations in Perambur and surrounding areas. Provides free estimate visits and completes painting projects on time with zero mess.',
  },
  {
    name: 'Sparkle Home Cleaners',
    category: 'House Cleaning',
    email: 'sparkle.cleaners@gmail.com',
    phone: '9841234567',
    area: 'Kilpauk',
    city: 'Chennai',
    experienceYears: 4,
    visitCharge: 500,
    availability: true,
    verified: true,
    rating: 4.9,
    skills: [
      'Deep Cleaning',
      'Sofa Shampooing',
      'Kitchen Degreasing',
      'Bathroom Sanitization',
      'Post-Renovation Cleaning',
    ],
    description:
      'Top-rated professional house cleaning service in Kilpauk. Provides deep cleaning, move-in/move-out cleaning, sofa and carpet shampooing, and post-construction cleaning with eco-friendly products.',
  },
];

// ─── Seeder Function ──────────────────────────────────────────────────────────

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await ServiceProvider.deleteMany({});
    console.log('🗑️  Cleared existing User and ServiceProvider collections');

    // Seed Users (password hashed via pre-save hook)
    const createdUsers = await User.create(users);
    console.log(`✅ Seeded ${createdUsers.length} users:`);
    createdUsers.forEach((u) => console.log(`   - [${u.role.toUpperCase()}] ${u.name} (${u.email})`));

    // Seed Providers
    const createdProviders = await ServiceProvider.insertMany(providers);
    console.log(`\n✅ Seeded ${createdProviders.length} service providers:`);
    createdProviders.forEach((p) =>
      console.log(`   - [${p.category}] ${p.name} — ${p.area}`)
    );

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Demo Credentials:');
    console.log('   Admin  → admin@servicedir.com / Admin@123');
    console.log('   User 1 → rahul@example.com   / User@123');
    console.log('   User 2 → priya@example.com   / User@123');

    await mongoose.disconnect();
    console.log('\n🔌 MongoDB disconnected. Seeding complete.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error(error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seed();
