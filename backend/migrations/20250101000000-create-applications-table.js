'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('applications', {
      applicationId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      listingId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'listings',
          key: 'listingId'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      applicantIds: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'JSON array of user IDs'
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending'
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('applications', ['listingId']);
    await queryInterface.addIndex('applications', ['status']);
    await queryInterface.addIndex('applications', ['createdAt']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('applications');
  }
}; 