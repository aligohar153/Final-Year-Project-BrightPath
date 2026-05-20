import * as SQLite from 'expo-sqlite';

let dbInstance = null;

export const getDb = async () => {
  if (dbInstance) return dbInstance;
  
  dbInstance = await SQLite.openDatabaseAsync('brightpath.db');
  
  // Create tables if they do not exist
  await dbInstance.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      uid TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT,
      fullName TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );
    
    CREATE TABLE IF NOT EXISTS children (
      id TEXT PRIMARY KEY,
      parentUid TEXT,
      name TEXT,
      age INTEGER,
      gender TEXT,
      condition TEXT,
      progressData TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );
    
    CREATE TABLE IF NOT EXISTS content (
      id TEXT PRIMARY KEY,
      childId TEXT,
      url TEXT,
      type TEXT,
      name TEXT,
      createdAt TEXT
    );
    
    CREATE TABLE IF NOT EXISTS routines (
      childId TEXT PRIMARY KEY,
      tasks TEXT,
      updatedAt TEXT
    );
  `);
  
  return dbInstance;
};
