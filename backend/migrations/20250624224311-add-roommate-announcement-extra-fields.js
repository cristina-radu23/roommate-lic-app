'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('roommate_announcements', 'fullName', { type: Sequelize.STRING });
    await queryInterface.addColumn('roommate_announcements', 'age', { type: Sequelize.INTEGER });
    await queryInterface.addColumn('roommate_announcements', 'gender', { type: Sequelize.STRING });
    await queryInterface.addColumn('roommate_announcements', 'preferredGenderArr', { type: Sequelize.TEXT });
    await queryInterface.addColumn('roommate_announcements', 'lookingFor', { type: Sequelize.STRING });
    await queryInterface.addColumn('roommate_announcements', 'preferredLocations', { type: Sequelize.TEXT });
    await queryInterface.addColumn('roommate_announcements', 'occupation', { type: Sequelize.STRING });
    await queryInterface.addColumn('roommate_announcements', 'occupationOther', { type: Sequelize.STRING });
    await queryInterface.addColumn('roommate_announcements', 'workSchedule', { type: Sequelize.TEXT });
    await queryInterface.addColumn('roommate_announcements', 'smoking', { type: Sequelize.STRING });
    await queryInterface.addColumn('roommate_announcements', 'drinking', { type: Sequelize.STRING });
    await queryInterface.addColumn('roommate_announcements', 'hasPets', { type: Sequelize.STRING });
    await queryInterface.addColumn('roommate_announcements', 'petType', { type: Sequelize.STRING });
    await queryInterface.addColumn('roommate_announcements', 'okayWithPets', { type: Sequelize.STRING });
    await queryInterface.addColumn('roommate_announcements', 'cleanlinessLevelNum', { type: Sequelize.INTEGER });
    await queryInterface.addColumn('roommate_announcements', 'socialPreferenceRaw', { type: Sequelize.STRING });
    await queryInterface.addColumn('roommate_announcements', 'noiseLevelRaw', { type: Sequelize.STRING });
    await queryInterface.addColumn('roommate_announcements', 'sleepSchedule', { type: Sequelize.STRING });
    await queryInterface.addColumn('roommate_announcements', 'visitorsOften', { type: Sequelize.STRING });
    await queryInterface.addColumn('roommate_announcements', 'languages', { type: Sequelize.TEXT });
    await queryInterface.addColumn('roommate_announcements', 'culturalBackground', { type: Sequelize.STRING });
    await queryInterface.addColumn('roommate_announcements', 'hobbies', { type: Sequelize.TEXT });
    await queryInterface.addColumn('roommate_announcements', 'bio', { type: Sequelize.TEXT });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('roommate_announcements', 'fullName');
    await queryInterface.removeColumn('roommate_announcements', 'age');
    await queryInterface.removeColumn('roommate_announcements', 'gender');
    await queryInterface.removeColumn('roommate_announcements', 'preferredGenderArr');
    await queryInterface.removeColumn('roommate_announcements', 'lookingFor');
    await queryInterface.removeColumn('roommate_announcements', 'preferredLocations');
    await queryInterface.removeColumn('roommate_announcements', 'occupation');
    await queryInterface.removeColumn('roommate_announcements', 'occupationOther');
    await queryInterface.removeColumn('roommate_announcements', 'workSchedule');
    await queryInterface.removeColumn('roommate_announcements', 'smoking');
    await queryInterface.removeColumn('roommate_announcements', 'drinking');
    await queryInterface.removeColumn('roommate_announcements', 'hasPets');
    await queryInterface.removeColumn('roommate_announcements', 'petType');
    await queryInterface.removeColumn('roommate_announcements', 'okayWithPets');
    await queryInterface.removeColumn('roommate_announcements', 'cleanlinessLevelNum');
    await queryInterface.removeColumn('roommate_announcements', 'socialPreferenceRaw');
    await queryInterface.removeColumn('roommate_announcements', 'noiseLevelRaw');
    await queryInterface.removeColumn('roommate_announcements', 'sleepSchedule');
    await queryInterface.removeColumn('roommate_announcements', 'visitorsOften');
    await queryInterface.removeColumn('roommate_announcements', 'languages');
    await queryInterface.removeColumn('roommate_announcements', 'culturalBackground');
    await queryInterface.removeColumn('roommate_announcements', 'hobbies');
    await queryInterface.removeColumn('roommate_announcements', 'bio');
  }
};
