import { up } from '../migrations/add-user-fields';
import sequelize from '../config/db';

async function runMigration() {
  try {
    await up(sequelize.getQueryInterface());
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration(); 