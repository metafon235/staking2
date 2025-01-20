import { db } from '@db';
import { users } from '@db/schema';
import crypto from 'crypto';

async function createAdminUser() {
  const email = 'admin@example.com';
  const password = 'admin123'; // This is just an example password

  try {
    const [admin] = await db.insert(users)
      .values({
        email,
        password: crypto.createHash('sha256').update(password).digest('hex'),
        isAdmin: true,
        createdAt: new Date()
      })
      .returning();

    console.log('Admin user created successfully:', {
      email,
      password,
      id: admin.id
    });
  } catch (error) {
    console.error('Failed to create admin user:', error);
  }
}

createAdminUser().catch(console.error);
