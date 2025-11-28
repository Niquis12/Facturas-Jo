// db/db.config.js

const { Pool } = require('pg');
require('dotenv').config(); // Mantenemos esto para el desarrollo local

// 🚨 Railway inyecta la URL de conexión completa aquí
const connectionString = process.env.DATABASE_URL;

// Si no estamos en Railway (modo local), usamos las variables separadas (si las tienes)
// Si estás usando solo DATABASE_URL en Railway, esto puede ser simplificado:
const pool = new Pool({
    // Usamos la cadena de conexión de Railway
    connectionString: connectionString,
    
    // Necesario para que PostgreSQL en producción (Railway) funcione con SSL/TLS
    ssl: { 
        rejectUnauthorized: false 
    }
});

// Verificación de conexión (opcional pero recomendado)
pool.connect(err => {
    if (err) {
        console.error('Error al conectar a PostgreSQL:', err.stack);
    } else {
        console.log('✅ Conexión a PostgreSQL establecida con éxito.');
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
};