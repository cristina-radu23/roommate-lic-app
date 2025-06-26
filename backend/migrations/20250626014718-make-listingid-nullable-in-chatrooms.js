'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Disable foreign key checks for SQLite
    if (queryInterface.sequelize.getDialect() === 'sqlite') {
      await queryInterface.sequelize.query('PRAGMA foreign_keys = OFF;');
    }
    await queryInterface.changeColumn('chat_rooms', 'listingId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    if (queryInterface.sequelize.getDialect() === 'sqlite') {
      await queryInterface.sequelize.query('PRAGMA foreign_keys = ON;');
    }
  },

  async down (queryInterface, Sequelize) {
    if (queryInterface.sequelize.getDialect() === 'sqlite') {
      await queryInterface.sequelize.query('PRAGMA foreign_keys = OFF;');
    }
    await queryInterface.changeColumn('chat_rooms', 'listingId', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    if (queryInterface.sequelize.getDialect() === 'sqlite') {
      await queryInterface.sequelize.query('PRAGMA foreign_keys = ON;');
    }
  }
};
