const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Voucher = require('../models/Voucher');
const CartItem = require('../models/CartItem');
const CartItemHistory = require('../models/CartItemHistory');

dotenv.config();

async function seed() {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Voucher.deleteMany({}),
    CartItem.deleteMany({}),
    CartItemHistory.deleteMany({})
  ]);

  const password = await bcrypt.hash('password123', 10);
  await User.create([
    { email: 'user@carter.test', username: 'aisha', password, points: 1500, role: 'user' },
    { email: 'admin@carter.test', username: 'admin', password, points: 5000, role: 'admin' },
    { email: 'john@carter.test', username: 'john', password, points: 2000, role: 'user' },
    { email: 'sarah@carter.test', username: 'sarah', password, points: 3500, role: 'user' },
    { email: 'mike@carter.test', username: 'mike', password, points: 800, role: 'user' }
  ]);

  const categories = await Category.insertMany([
    { name: 'Food' },
    { name: 'Travel' },
    { name: 'Shopping' },
    { name: 'Lifestyle' },
    { name: 'Entertainment' }
  ]);

  const byName = Object.fromEntries(categories.map(category => [category.name, category._id]));
  const future = new Date();
  future.setMonth(future.getMonth() + 3);

  await Voucher.insertMany([
    {
      title: 'RM20 Coffee Treat',
      description: 'Enjoy coffee and pastries at selected partner cafes.',
      terms: 'Valid once per customer at participating outlets.',
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085',
      points: 180,
      category_id: byName.Food,
      limit: 80,
      expiryDate: future
    },
    {
      title: 'Airport Lounge Access',
      description: 'Relax before your flight with one-time lounge access.',
      terms: 'Subject to availability. Booking required.',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05',
      points: 700,
      category_id: byName.Travel,
      limit: 30,
      expiryDate: future
    },
    {
      title: '15% Mall Weekend Voucher',
      description: 'Save on fashion, tech, and home essentials.',
      terms: 'Valid on weekends only. Maximum discount RM60.',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
      points: 350,
      category_id: byName.Shopping,
      limit: 100,
      expiryDate: future
    },
    {
      title: 'Fitness Class Pass',
      description: 'Try a yoga, spinning, or HIIT class with a partner studio.',
      terms: 'Advance booking required.',
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a',
      points: 260,
      category_id: byName.Lifestyle,
      limit: 70,
      expiryDate: future
    },
    {
      title: 'Family Dinner Deal',
      description: 'Redeem a dinner voucher at selected family restaurants.',
      terms: 'Not valid with other promotions.',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0',
      points: 520,
      category_id: byName.Food,
      limit: 45,
      expiryDate: future
    },
    {
      title: 'Movie Night for Two',
      description: 'Two movie tickets at participating cinemas nationwide.',
      terms: 'Valid for standard screenings only.',
      image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba',
      points: 420,
      category_id: byName.Entertainment,
      limit: 60,
      expiryDate: future
    },
    {
      title: 'Hotel Stay Discount',
      description: 'Get 30% off on hotel bookings for weekend getaways.',
      terms: 'Minimum 2 nights stay required.',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
      points: 850,
      category_id: byName.Travel,
      limit: 25,
      expiryDate: future
    },
    {
      title: 'Spa Day Package',
      description: 'Relax with a massage and spa treatment package.',
      terms: 'Appointment must be made 3 days in advance.',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef',
      points: 650,
      category_id: byName.Lifestyle,
      limit: 40,
      expiryDate: future
    },
    {
      title: 'Fast Food Combo Meal',
      description: 'Get a free combo meal at popular fast food chains.',
      terms: 'One voucher per transaction.',
      image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330',
      points: 120,
      category_id: byName.Food,
      limit: 150,
      expiryDate: future
    },
    {
      title: 'Electronics Store Voucher',
      description: 'RM50 voucher for electronics and gadgets.',
      terms: 'Cannot be combined with other offers.',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661',
      points: 400,
      category_id: byName.Shopping,
      limit: 90,
      expiryDate: future
    },
    {
      title: 'Concert Ticket Discount',
      description: '20% off on selected concert and live show tickets.',
      terms: 'Valid for events in the next 6 months.',
      image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4',
      points: 550,
      category_id: byName.Entertainment,
      limit: 50,
      expiryDate: future
    },
    {
      title: 'Flight Booking Voucher',
      description: 'RM100 off on domestic flight bookings.',
      terms: 'Valid for bookings above RM300.',
      image: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e',
      points: 900,
      category_id: byName.Travel,
      limit: 20,
      expiryDate: future
    },
    {
      title: 'Bookstore Gift Card',
      description: 'RM30 gift card for books, magazines, and stationery.',
      terms: 'Valid at all participating bookstores.',
      image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f',
      points: 250,
      category_id: byName.Shopping,
      limit: 120,
      expiryDate: future
    },
    {
      title: 'Pizza Family Pack',
      description: 'Large pizza with sides for the whole family.',
      terms: 'Delivery charges apply separately.',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
      points: 320,
      category_id: byName.Food,
      limit: 110,
      expiryDate: future
    },
    {
      title: 'Streaming Service Voucher',
      description: '3 months free subscription to premium streaming service.',
      terms: 'For new subscribers only.',
      image: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37',
      points: 480,
      category_id: byName.Entertainment,
      limit: 75,
      expiryDate: future
    },
    {
      title: 'Gym Membership Trial',
      description: '1 month free gym membership at partner fitness centers.',
      terms: 'Registration fee may apply.',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
      points: 380,
      category_id: byName.Lifestyle,
      limit: 55,
      expiryDate: future
    },
    {
      title: 'Fashion Outlet Voucher',
      description: 'RM80 shopping voucher for fashion and accessories.',
      terms: 'Valid for regular priced items only.',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d',
      points: 600,
      category_id: byName.Shopping,
      limit: 85,
      expiryDate: future
    },
    {
      title: 'Theme Park Entry',
      description: 'Single day entry to major theme parks.',
      terms: 'Excludes special event days.',
      image: 'https://images.unsplash.com/photo-1594138247401-8a6f9f7a0e36',
      points: 720,
      category_id: byName.Entertainment,
      limit: 35,
      expiryDate: future
    },
    {
      title: 'Car Rental Discount',
      description: '25% off on weekend car rental services.',
      terms: 'Valid driving license required.',
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d',
      points: 780,
      category_id: byName.Travel,
      limit: 28,
      expiryDate: future
    },
    {
      title: 'Fine Dining Experience',
      description: 'Set menu for two at upscale restaurants.',
      terms: 'Advance reservation required 48 hours ahead.',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0',
      points: 950,
      category_id: byName.Food,
      limit: 22,
      expiryDate: future
    }
  ]);

  console.log('Seed complete');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
