require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    console.log('🌱 Seeding database...');

    // Create categories - Signs
    const categories = [
      { name: 'MANDATORY SIGNS', description: 'Signs that indicate mandatory requirements', icon: '✓' },
      { name: 'PROHIBITION SIGNS', description: 'Signs that indicate prohibited actions', icon: '✕' },
      { name: 'HAZARD SIGNS', description: 'Signs that indicate warning and hazards', icon: '⚠' },
      { name: 'FIRST AID & FIRE SAFETY SIGNS', description: 'First aid and fire safety signage', icon: '✚' },
      { name: 'MULTIPURPOSE SIGNS', description: 'Versatile signage for multiple uses', icon: '◉' },
      { name: 'PPE SIGNS', description: 'Personal Protective Equipment signs', icon: '◯' },
      { name: 'BESPOKE MULTI PURPOSE SIGNS', description: 'Custom multi-purpose signage solutions', icon: '◆' },
      { name: 'SITE NOTICE BOARDS SIGNS', description: 'Notice boards for construction sites', icon: '▤' },
      { name: 'HAZARD NOTIFIER BOARDS SIGNS', description: 'Hazard notification boards', icon: '▣' },
      { name: 'BANNER SIGNS', description: 'Promotional and informational banners', icon: '▬' },
      { name: 'DOOR SIGNS', description: 'Door signage for identification', icon: '▭' },
      { name: 'ROAD SIGNS', description: 'Traffic and road safety signs', icon: '⬡' },
      { name: 'RECYCLING SIGNS', description: 'Recycling and environmental signs', icon: '♻' }
    ];

    // Create categories in database
    for (const cat of categories) {
      await prisma.category.create({
        data: cat
      });
    }

    // Create admin user
    await prisma.user.create({
      data: {
        username: 'admin',
        password: 'password',
        role: 'admin',
        price_modifier_percentage: 0,
        visible_category_ids: '1,2,3,4,5,6,7,8,9,10,11,12,13'
      }
    });

    // Create regular user
    await prisma.user.create({
      data: {
        username: 'user',
        password: 'password123',
        role: 'user',
        price_modifier_percentage: 10,
        visible_category_ids: '1,2,3,4,5,6,7,8,9,10,11,12,13'
      }
    });

    // Create sample products for each category
    const productTemplates = [
      { name: 'Mandatory Wear PPE Sign', categoryId: 1, price: 29.99 },
      { name: 'No Entry Sign', categoryId: 2, price: 24.99 },
      { name: 'Warning High Voltage Sign', categoryId: 3, price: 19.99 },
      { name: 'First Aid Kit Sign', categoryId: 4, price: 34.99 },
      { name: 'Information Direction Sign', categoryId: 5, price: 49.99 },
      { name: 'Safety Helmet Required Sign', categoryId: 6, price: 22.99 },
      { name: 'Custom Multi-Purpose Sign', categoryId: 7, price: 79.99 },
      { name: 'Construction Site Notice Board', categoryId: 8, price: 149.99 },
      { name: 'Hazard Warning Board', categoryId: 9, price: 89.99 },
      { name: 'Promotional Banner', categoryId: 10, price: 59.99 },
      { name: 'Office Door Sign', categoryId: 11, price: 15.99 },
      { name: 'Stop Traffic Sign', categoryId: 12, price: 39.99 },
      { name: 'Recycle Paper Sign', categoryId: 13, price: 12.99 }
    ];

    for (const product of productTemplates) {
      await prisma.product.create({
        data: {
          name: product.name,
          description: `High quality ${product.name.toLowerCase()} for your business needs`,
          image_url: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=400',
          base_price: product.price,
          categoryId: product.categoryId
        }
      });
    }

    console.log('✅ Seed data created successfully!');
    console.log(`📦 Created ${categories.length} categories`);
    console.log(`👥 Created 2 users (admin & user)`);
    console.log(`📋 Created ${productTemplates.length} products`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

main();
