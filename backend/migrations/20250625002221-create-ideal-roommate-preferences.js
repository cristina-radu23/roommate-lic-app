'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('ideal_roommate_preferences', {
      preferenceId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'userId'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      preferredAgeMin: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      preferredAgeMax: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      preferredGender: {
        type: Sequelize.ENUM('male', 'female', 'non-binary', 'no-preference'),
        defaultValue: 'no-preference'
      },
      arrangementTypes: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      moveInDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      budgetMin: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      budgetMax: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      preferredLocations: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      preferredOccupationTypes: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      preferredWorkSchedules: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      smokingPreference: {
        type: Sequelize.ENUM('yes', 'no', 'doesnt-matter'),
        defaultValue: 'doesnt-matter'
      },
      petPreference: {
        type: Sequelize.ENUM('yes', 'no', 'depends'),
        defaultValue: 'depends'
      },
      cleanlinessPreference: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      sociabilityPreference: {
        type: Sequelize.ENUM('very-social', 'friendly-private', 'quiet-independent', 'no-preference'),
        defaultValue: 'no-preference'
      },
      noiseLevelPreference: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      sleepSchedulePreference: {
        type: Sequelize.ENUM('early-bird', 'night-owl', 'doesnt-matter'),
        defaultValue: 'doesnt-matter'
      },
      guestPreference: {
        type: Sequelize.ENUM('yes', 'no', 'sometimes'),
        defaultValue: 'sometimes'
      },
      preferredLanguages: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      openToAnyBackground: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      culturalComments: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      sharedInterests: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      additionalRequirements: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      isComplete: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('ideal_roommate_preferences');
  }
};
