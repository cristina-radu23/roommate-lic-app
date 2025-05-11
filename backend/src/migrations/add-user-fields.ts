import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.addColumn('users', 'bio', {
    type: DataTypes.TEXT,
    allowNull: true
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.removeColumn('users', 'bio');
} 