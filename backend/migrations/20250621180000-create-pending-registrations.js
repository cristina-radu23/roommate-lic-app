'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pending_registrations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userFirstName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      userLastName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: false
      },
      dateOfBirth: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      gender: {
        type: Sequelize.STRING,
        allowNull: false
      },
      occupation: {
        type: Sequelize.STRING,
        allowNull: false
      },
      passwordHash: {
        type: Sequelize.STRING,
        allowNull: false
      },
      emailVerificationCode: {
        type: Sequelize.STRING,
        allowNull: false
      },
      emailVerificationExpires: {
        type: Sequelize.DATE,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('pending_registrations');
  }
}; 