// Ejemplo usando Express.js
const express = require('express');
const router = express.Router();
// Asumiendo que tienes un módulo de conexión a la base de datos (db)
// o una lista de facturas en memoria.

// 🚨 Ruta para marcar una factura como pagada
router.put('/facturas/:id/pagar', async (req, res) => {
    try {
        // 1. Obtener el ID de la factura de los parámetros de la URL
        const facturaId = req.params.id; 
        
        // 2. Realizar la actualización en la base de datos
        const resultado = await db.actualizarEstadoFactura(facturaId, 'pagado');

        // Verificar si la actualización fue exitosa
        if (resultado.filasAfectadas === 0) {
            return res.status(404).json({ message: 'Factura no encontrada.' });
        }

        // 3. Responder con un código de éxito (200 OK)
        res.status(200).json({ message: `Factura ${facturaId} marcada como pagada.` });

    } catch (error) {
        console.error('Error al marcar factura como pagada:', error);
        // Responder con un error del servidor (500 Internal Server Error)
        res.status(500).json({ message: 'Error interno del servidor al actualizar la factura.' });
    }
});

module.exports = router;