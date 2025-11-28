// server.js
require('dotenv').config(); // Carga las variables de entorno del archivo .env
const express = require('express');
const cors = require('cors');
// const db = require('./db/db.config'); // Módulo de conexión a la DB (paso futuro)

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware (Funciones que se ejecutan en cada solicitud)
app.use(cors()); // Permite peticiones de otros dominios/puertos
app.use(express.json()); // Permite a Express leer cuerpos JSON (req.body)

// RUTAS (Endpoints)
// Aquí se montarán tus rutas (ej: app.use('/api/facturas', facturasRoutes);)
app.get('/', (req, res) => {
    res.send('API de Gestión de Facturas funcionando.');
});


// INICIAR EL SERVIDOR
app.listen(PORT, () => {
    console.log(`🚀 Servidor Express escuchando en http://localhost:${PORT}`);
});