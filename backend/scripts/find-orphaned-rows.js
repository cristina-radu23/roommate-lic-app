// Script to find orphaned rows in tables referencing users and other main FKs
// Usage: node backend/scripts/find-orphaned-rows.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

const queries = [
  // User FKs (already checked)
  {
    table: 'messages (userId)',
    sql: `SELECT * FROM messages WHERE userId IS NOT NULL AND userId NOT IN (SELECT userId FROM users)`
  },
  {
    table: 'likes (userId)',
    sql: `SELECT * FROM likes WHERE userId NOT IN (SELECT userId FROM users)`
  },
  {
    table: 'chat_room_users (userId)',
    sql: `SELECT * FROM chat_room_users WHERE userId NOT IN (SELECT userId FROM users)`
  },
  {
    table: 'matches (userAId)',
    sql: `SELECT * FROM matches WHERE userAId NOT IN (SELECT userId FROM users)`
  },
  {
    table: 'matches (userBId)',
    sql: `SELECT * FROM matches WHERE userBId NOT IN (SELECT userId FROM users)`
  },
  // Other FKs
  {
    table: 'messages (chatRoomId)',
    sql: `SELECT * FROM messages WHERE chatRoomId NOT IN (SELECT chatRoomId FROM chat_rooms)`
  },
  {
    table: 'likes (listingId)',
    sql: `SELECT * FROM likes WHERE listingId NOT IN (SELECT listingId FROM listings)`
  },
  {
    table: 'chat_room_users (chatRoomId)',
    sql: `SELECT * FROM chat_room_users WHERE chatRoomId NOT IN (SELECT chatRoomId FROM chat_rooms)`
  },
  {
    table: 'matches (listingId)',
    sql: `SELECT * FROM matches WHERE listingId NOT IN (SELECT listingId FROM listings)`
  },
  {
    table: 'listings (addressId)',
    sql: `SELECT * FROM listings WHERE addressId NOT IN (SELECT addressId FROM addresses)`
  },
  {
    table: 'photos (listingId)',
    sql: `SELECT * FROM photos WHERE listingId NOT IN (SELECT listingId FROM listings)`
  },
];

function runQuery(q) {
  return new Promise((resolve) => {
    db.all(q.sql, [], (err, rows) => {
      if (err) {
        console.error(`Error querying ${q.table}:`, err);
        resolve([]);
      } else {
        resolve({ table: q.table, rows });
      }
    });
  });
}

(async () => {
  console.log('Scanning for orphaned rows (all major FKs)...');
  for (const q of queries) {
    const result = await runQuery(q);
    if (result.rows.length > 0) {
      console.log(`\nOrphaned rows in ${result.table}:`);
      console.table(result.rows);
    } else {
      console.log(`No orphaned rows found in ${result.table}.`);
    }
  }
  db.close();
})(); 