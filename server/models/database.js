const { createClient } = require('@libsql/client');
require('dotenv').config();

// Configuration Turso (production) ou SQLite local (développement)
const isProduction = process.env.NODE_ENV === 'production' || process.env.TURSO_DATABASE_URL;

let client;

if (isProduction && process.env.TURSO_DATABASE_URL) {
  // Mode Turso (production/Vercel)
  client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  console.log('🪵 Connexion à Turso réussie');
} else {
  // Mode SQLite local (développement)
  const path = require('path');
  const dbPath = path.join(__dirname, '../../database.db');
  client = createClient({
    url: `file:${dbPath}`,
  });
  console.log('🪵 Connexion à la base de données locale réussie');
}

// Wrapper compatible avec l'ancien code (sqlite3 style)
const db = {
  // Méthode all : retourne toutes les lignes
  all: async function(sql, params = []) {
    try {
      const result = await client.execute({ sql, args: params });
      return result.rows;
    } catch (err) {
      throw err;
    }
  },

  // Méthode get : retourne une seule ligne
  get: async function(sql, params = []) {
    try {
      const result = await client.execute({ sql, args: params });
      return result.rows[0] || null;
    } catch (err) {
      throw err;
    }
  },

  // Méthode run : exécute une requête (INSERT, UPDATE, DELETE)
  run: async function(sql, params = []) {
    try {
      const result = await client.execute({ sql, args: params });
      return {
        id: Number(result.lastInsertRowid),
        changes: result.rowsAffected
      };
    } catch (err) {
      throw err;
    }
  },

  // Méthode batch : exécute plusieurs requêtes en transaction
  batch: async function(statements) {
    try {
      return await client.batch(statements);
    } catch (err) {
      throw err;
    }
  },

  // Accès direct au client pour les cas avancés
  client: client
};

module.exports = db;
