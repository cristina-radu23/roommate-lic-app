'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('photos', 'announcementId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'roommate_announcements',
        key: 'announcementId',
      },
      onDelete: 'CASCADE',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('photos', 'announcementId');
  }
};
