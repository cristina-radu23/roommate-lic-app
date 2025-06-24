'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Drop foreign key constraint on photos.announcementId (SQLite workaround: recreate table)
    await queryInterface.sequelize.query(`
      PRAGMA foreign_keys=off;
      CREATE TABLE photos_backup AS SELECT * FROM photos;
      DROP TABLE photos;
      CREATE TABLE photos (
        photoId INTEGER PRIMARY KEY AUTOINCREMENT,
        listingId INTEGER,
        announcementId INTEGER,
        url VARCHAR(255) NOT NULL,
        isCover BOOLEAN DEFAULT 0,
        "order" INTEGER DEFAULT 0,
        createdAt DATETIME NOT NULL,
        FOREIGN KEY (announcementId) REFERENCES roommate_announcements(announcementId) ON DELETE CASCADE
      );
      INSERT INTO photos (photoId, listingId, announcementId, url, isCover, "order", createdAt)
        SELECT photoId, listingId, announcementId, url, isCover, "order", createdAt FROM photos_backup;
      DROP TABLE photos_backup;
      PRAGMA foreign_keys=on;
    `);
    // 2. Create new roommate_announcements table with correct column names and STRING types for enums
    await queryInterface.createTable('roommate_announcements_new', {
      announcementId: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: Sequelize.INTEGER, allowNull: false },
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: false },
      budgetMin: { type: Sequelize.INTEGER, allowNull: false },
      budgetMax: { type: Sequelize.INTEGER, allowNull: false },
      moveInDate: { type: Sequelize.DATE, allowNull: false },
      leaseDuration: { type: Sequelize.INTEGER, allowNull: false },
      preferredGender: { type: Sequelize.STRING },
      userOccupation: { type: Sequelize.STRING },
      userAgeMin: { type: Sequelize.INTEGER, allowNull: false },
      userAgeMax: { type: Sequelize.INTEGER, allowNull: false },
      smokingStatus: { type: Sequelize.STRING },
      petStatus: { type: Sequelize.STRING },
      cleanlinessAttitude: { type: Sequelize.STRING },
      noiseAttitude: { type: Sequelize.STRING },
      studyHabits: { type: Sequelize.STRING },
      socialAttitude: { type: Sequelize.STRING },
      locationAreas: { type: Sequelize.TEXT, allowNull: true },
      mustHaveAmenities: { type: Sequelize.TEXT, allowNull: true },
      dealBreakers: { type: Sequelize.TEXT, allowNull: true },
      isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      expiresAt: { type: Sequelize.DATE, allowNull: false },
      fullName: { type: Sequelize.STRING, allowNull: true },
      age: { type: Sequelize.INTEGER, allowNull: true },
      gender: { type: Sequelize.STRING, allowNull: true },
      preferredGenderArr: { type: Sequelize.TEXT, allowNull: true },
      lookingFor: { type: Sequelize.STRING, allowNull: true },
      preferredLocations: { type: Sequelize.TEXT, allowNull: true },
      occupation: { type: Sequelize.STRING, allowNull: true },
      occupationOther: { type: Sequelize.STRING, allowNull: true },
      workSchedule: { type: Sequelize.TEXT, allowNull: true },
      smoking: { type: Sequelize.STRING, allowNull: true },
      drinking: { type: Sequelize.STRING, allowNull: true },
      hasPets: { type: Sequelize.STRING, allowNull: true },
      petType: { type: Sequelize.STRING, allowNull: true },
      okayWithPets: { type: Sequelize.STRING, allowNull: true },
      cleanlinessLevelNum: { type: Sequelize.INTEGER, allowNull: true },
      socialPreferenceRaw: { type: Sequelize.STRING, allowNull: true },
      noiseLevelRaw: { type: Sequelize.STRING, allowNull: true },
      sleepSchedule: { type: Sequelize.STRING, allowNull: true },
      visitorsOften: { type: Sequelize.STRING, allowNull: true },
      languages: { type: Sequelize.TEXT, allowNull: true },
      culturalBackground: { type: Sequelize.STRING, allowNull: true },
      hobbies: { type: Sequelize.TEXT, allowNull: true },
      bio: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    // 3. Copy data from old table to new table (map old columns to new columns)
    await queryInterface.sequelize.query(`
      INSERT INTO roommate_announcements_new (
        announcementId, userId, title, description, budgetMin, budgetMax, moveInDate, leaseDuration, preferredGender,
        userOccupation, userAgeMin, userAgeMax, smokingStatus, petStatus, cleanlinessAttitude, noiseAttitude, studyHabits, socialAttitude, locationAreas,
        mustHaveAmenities, dealBreakers, isActive, expiresAt, fullName, age, gender, preferredGenderArr, lookingFor, preferredLocations, occupation, occupationOther, workSchedule, smoking, drinking, hasPets, petType, okayWithPets, cleanlinessLevelNum, socialPreferenceRaw, noiseLevelRaw, sleepSchedule, visitorsOften, languages, culturalBackground, hobbies, bio, createdAt, updatedAt
      )
      SELECT
        announcementId, userId, title, description, budgetMin, budgetMax, moveInDate, leaseDuration, preferredGender,
        preferredOccupation, preferredAgeMin, preferredAgeMax, smokingPreference, petPreference, cleanlinessLevel, noiseLevel, studyHabits, socialPreference, locationPreferences,
        mustHaveAmenities, dealBreakers, isActive, expiresAt, fullName, age, gender, preferredGenderArr, lookingFor, preferredLocations, occupation, occupationOther, workSchedule, smoking, drinking, hasPets, petType, okayWithPets, cleanlinessLevelNum, socialPreferenceRaw, noiseLevelRaw, sleepSchedule, visitorsOften, languages, culturalBackground, hobbies, bio, createdAt, updatedAt
      FROM roommate_announcements;
    `);
    // 4. Drop old table
    await queryInterface.dropTable('roommate_announcements');
    // 5. Rename new table to original name
    await queryInterface.renameTable('roommate_announcements_new', 'roommate_announcements');
    // 6. Recreate foreign key constraint on photos.announcementId (already handled by table definition above)
  },
  down: async (queryInterface, Sequelize) => {
    // 1. Drop foreign key constraint on photos.announcementId (SQLite workaround: recreate table)
    await queryInterface.sequelize.query(`
      PRAGMA foreign_keys=off;
      CREATE TABLE photos_backup AS SELECT * FROM photos;
      DROP TABLE photos;
      CREATE TABLE photos (
        photoId INTEGER PRIMARY KEY AUTOINCREMENT,
        listingId INTEGER,
        announcementId INTEGER,
        url VARCHAR(255) NOT NULL,
        isCover BOOLEAN DEFAULT 0,
        "order" INTEGER DEFAULT 0,
        createdAt DATETIME NOT NULL,
        FOREIGN KEY (announcementId) REFERENCES roommate_announcements(announcementId) ON DELETE CASCADE
      );
      INSERT INTO photos (photoId, listingId, announcementId, url, isCover, "order", createdAt)
        SELECT photoId, listingId, announcementId, url, isCover, "order", createdAt FROM photos_backup;
      DROP TABLE photos_backup;
      PRAGMA foreign_keys=on;
    `);
    // 2. Create old roommate_announcements table with old column names and STRING types for enums
    await queryInterface.createTable('roommate_announcements_old', {
      announcementId: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: Sequelize.INTEGER, allowNull: false },
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: false },
      budgetMin: { type: Sequelize.INTEGER, allowNull: false },
      budgetMax: { type: Sequelize.INTEGER, allowNull: false },
      moveInDate: { type: Sequelize.DATE, allowNull: false },
      leaseDuration: { type: Sequelize.INTEGER, allowNull: false },
      preferredGender: { type: Sequelize.STRING },
      preferredOccupation: { type: Sequelize.STRING },
      preferredAgeMin: { type: Sequelize.INTEGER, allowNull: false },
      preferredAgeMax: { type: Sequelize.INTEGER, allowNull: false },
      smokingPreference: { type: Sequelize.STRING },
      petPreference: { type: Sequelize.STRING },
      cleanlinessLevel: { type: Sequelize.STRING },
      noiseLevel: { type: Sequelize.STRING },
      studyHabits: { type: Sequelize.STRING },
      socialPreference: { type: Sequelize.STRING },
      locationPreferences: { type: Sequelize.TEXT, allowNull: true },
      mustHaveAmenities: { type: Sequelize.TEXT, allowNull: true },
      dealBreakers: { type: Sequelize.TEXT, allowNull: true },
      isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      expiresAt: { type: Sequelize.DATE, allowNull: false },
      fullName: { type: Sequelize.STRING, allowNull: true },
      age: { type: Sequelize.INTEGER, allowNull: true },
      gender: { type: Sequelize.STRING, allowNull: true },
      preferredGenderArr: { type: Sequelize.TEXT, allowNull: true },
      lookingFor: { type: Sequelize.STRING, allowNull: true },
      preferredLocations: { type: Sequelize.TEXT, allowNull: true },
      occupation: { type: Sequelize.STRING, allowNull: true },
      occupationOther: { type: Sequelize.STRING, allowNull: true },
      workSchedule: { type: Sequelize.TEXT, allowNull: true },
      smoking: { type: Sequelize.STRING, allowNull: true },
      drinking: { type: Sequelize.STRING, allowNull: true },
      hasPets: { type: Sequelize.STRING, allowNull: true },
      petType: { type: Sequelize.STRING, allowNull: true },
      okayWithPets: { type: Sequelize.STRING, allowNull: true },
      cleanlinessLevelNum: { type: Sequelize.INTEGER, allowNull: true },
      socialPreferenceRaw: { type: Sequelize.STRING, allowNull: true },
      noiseLevelRaw: { type: Sequelize.STRING, allowNull: true },
      sleepSchedule: { type: Sequelize.STRING, allowNull: true },
      visitorsOften: { type: Sequelize.STRING, allowNull: true },
      languages: { type: Sequelize.TEXT, allowNull: true },
      culturalBackground: { type: Sequelize.STRING, allowNull: true },
      hobbies: { type: Sequelize.TEXT, allowNull: true },
      bio: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    // 3. Copy data from new table to old table (map new columns to old columns)
    await queryInterface.sequelize.query(`
      INSERT INTO roommate_announcements_old (
        announcementId, userId, title, description, budgetMin, budgetMax, moveInDate, leaseDuration, preferredGender,
        preferredOccupation, preferredAgeMin, preferredAgeMax, smokingPreference, petPreference, cleanlinessLevel, noiseLevel, studyHabits, socialPreference, locationPreferences,
        mustHaveAmenities, dealBreakers, isActive, expiresAt, fullName, age, gender, preferredGenderArr, lookingFor, preferredLocations, occupation, occupationOther, workSchedule, smoking, drinking, hasPets, petType, okayWithPets, cleanlinessLevelNum, socialPreferenceRaw, noiseLevelRaw, sleepSchedule, visitorsOften, languages, culturalBackground, hobbies, bio, createdAt, updatedAt
      )
      SELECT
        announcementId, userId, title, description, budgetMin, budgetMax, moveInDate, leaseDuration, preferredGender,
        userOccupation, userAgeMin, userAgeMax, smokingStatus, petStatus, cleanlinessAttitude, noiseAttitude, studyHabits, socialAttitude, locationAreas,
        mustHaveAmenities, dealBreakers, isActive, expiresAt, fullName, age, gender, preferredGenderArr, lookingFor, preferredLocations, occupation, occupationOther, workSchedule, smoking, drinking, hasPets, petType, okayWithPets, cleanlinessLevelNum, socialPreferenceRaw, noiseLevelRaw, sleepSchedule, visitorsOften, languages, culturalBackground, hobbies, bio, createdAt, updatedAt
      FROM roommate_announcements;
    `);
    // 4. Drop new table
    await queryInterface.dropTable('roommate_announcements');
    // 5. Rename old table to original name
    await queryInterface.renameTable('roommate_announcements_old', 'roommate_announcements');
    // 6. Recreate foreign key constraint on photos.announcementId (already handled by table definition above)
  }
};
