// app.js

const { createClient } = window.supabase;

const SUPABASE_URL = 'https://dquiwgkifddppehhoegj.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxdWl3Z2tpZmRkcHBlaGhvZWdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3Nzg2NDYsImV4cCI6MjA4MDM1NDY0Nn0.5ZydrNb_dMjbTmAx3yuXM9ZXG-58eKhoXLntvnEBYgs'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 🚨 CORRECCIÓN 1: Sensibilidad a Mayúsculas
const TABLA_FACTURAS = 'factura'; 



function normalizarFecha(dateInput) {
    // 🛑 CORRECCIÓN CLAVE: Convertir la entrada a string si es un objeto Date
    if (!dateInput) { 
        return new Date(0); // Retorna una fecha de referencia si es nulo
    }
    
    // Convertir el Date a string YYYY-MM-DD si es un objeto Date
    const dateStr = dateInput instanceof Date 
        ? dateInput.toISOString().split('T')[0] 
        : String(dateInput); // Aseguramos que sea string
    
    // Si el string es vacío o inválido (ej: "Invalid Date"), retornamos referencia
    if (dateStr.length < 10) {
        return new Date(0);
    }

    const parts = dateStr.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Meses son 0-indexados
    const day = parseInt(parts[2], 10);
    
    // Creamos la fecha en la zona horaria local (evita el desplazamiento de un día)
    const localDate = new Date(year, month, day); 
    return localDate;
}
// cargar facturas al entrar

function iniciarApp(){
    cargarFacturas();



    document.getElementById("registro-form").addEventListener("submit", async (e) => {
        e.preventDefault();
    
        // Asumiendo IDs de inputs correctos:
        const empresa = document.getElementById("nombre-empresa").value;
        const fechaEmision = document.getElementById("fecha-emision").value; // Input para fecha
        const monto = document.getElementById("monto").value;
        const numeroFactura = document.getElementById("numero-factura").value

        const factura = {
            nombre: empresa,
            
            
            // 🚨 CORRECCIÓN 2: Usar 'fecha' (emisión) - ¡Coincide con tu DB!
            "fecha": fechaEmision, 
            
            // 🚨 CORRECCIÓN 3: Usar 'vencimiento' - ¡Coincide con tu DB! 
            
            monto: monto,
            estado: "emitida", 
            factura : numeroFactura,
        };
    
        const { error } = await supabase
            .from(TABLA_FACTURAS)
            .insert([factura]);
    
        if (error) {
            console.error("Error al registrar factura en Supabase:", error);
            alert("Hubo un error al registrar la factura: " + error.message);
        } else {
            document.getElementById("registro-form").reset();
            cargarFacturas();
        }
    });
} 

document.addEventListener("DOMContentLoaded", iniciarApp);

function formatearMontoAR(monto) {
    if (isNaN(monto) || monto === null) return '0,00';
    
    // Convertir a número por si viene como string
    const numeroMonto = parseFloat(monto);

    // Crea un objeto formateador para el locale 'es-AR' (Español - Argentina)
    const formatter = new Intl.NumberFormat('es-AR', {
        minimumFractionDigits: 2, // Asegura que siempre haya al menos dos decimales
        maximumFractionDigits: 2  // Asegura que no haya más de dos decimales
    });

    // Formatea el número
    return formatter.format(numeroMonto); 
}


// obtener facturas
async function cargarFacturas() {

    const { data: facturas, error } = await supabase
        .from(TABLA_FACTURAS) 
        .select('*') 
        .order('fecha', { ascending: false }); // 🚨 CORRECCIÓN 4: Ordenar por 'fecha'

    if (error) {
        console.error("Error al obtener facturas de Supabase:", error);
        return;
    }

    const tbody = document.querySelector("#tablaFacturas tbody");
    tbody.innerHTML = "";

    // Asegúrate de que tu variable local es 'facturas' y no 'data'
    facturas.forEach((f) => {
        // 🚨 CORRECCIÓN 5: Usar f.vencimiento y f.fecha
        const hoy = normalizarFecha(new Date().toISOString().split('T')[0]); 

    // 🚨 CORRECCIÓN 3: Pasar el string de la DB (f.vencimiento)
        const fechaPendiente = normalizarFecha(f.fecha); 
        fechaPendiente.setDate(fechaPendiente.getDate() + 30);
        fechaPendiente.setHours(0, 0, 0, 0);
        
        
        const fechaFormateada = formatearFechaAR(f.fecha);
        

    // 1. Calcular el punto de corte para "Por vencer/Pendiente" (30 días antes)
        
        const plazoCritico = new Date(fechaPendiente);
        plazoCritico.setDate(fechaPendiente.getDate() + 30);
        plazoCritico.setHours(0, 0, 0, 0);
        let estado = f.estado; // Estado original de la factura desde la DB
        
        // ----------------------------------------------------

    // LÓGICA DE ESTADO DINÁMICO (Solo si NO está marcado como pagado)
        if (estado !== "pagado") {
            
            // 🛑 Criterio 1: VENCIDO (Hoy es igual o posterior a la fecha de vencimiento)
            if (hoy.getTime() > plazoCritico.getTime()) {
                estado = "vencida"; // 🚨 Aquí cambiamos la variable 'estado' para la visualización
                
            // 🟡 Criterio 2: PENDIENTE/POR VENCER (La factura vence en los próximos 30 días)
            } else if (hoy.getTime() >= fechaPendiente.getTime()) {
                estado = "pendiente"; 
                
            // 🟢 Criterio 3: EMITIDA (Falta más de 30 días para vencer)
            } else {
                estado = "emitida"; 
            }
        }
    
        let montoformateado = formatearMontoAR(f.monto);

        const estadoClase = `estado-${estado}`;
    
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${f.factura}</td>
            <td>${f.nombre}</td>
            <td>$ ${montoformateado}</td>
            <td>${fechaFormateada}</td>
            <td class='estado-celda' id="${estadoClase}">${estado.toUpperCase()}</td>
            <td>
                ${estado === "pendiente"|| estado === "emitida" || estado === "vencida" 
                    ? `<button class="btn-pagar" onclick="pagar(${f.id})">Marcar Pagado</button>`
                    : "—"}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function formatearFechaAR(fechaString) {
    if (!fechaString) return '';
    // Crea un objeto Date. Usar el string aaaa-mm-dd directamente funciona
    // bien para fechas sin hora en JS.
    const fechaObj = new Date(fechaString); 
    fechaObj.setDate(fechaObj.getDate() + 1);
    
    // Si la fecha es inválida, retorna vacío
    if (isNaN(fechaObj.getTime())) {
        return 'Fecha Inválida';
    }
    
    // Formato de Argentina (dd/mm/aaaa)
    return fechaObj.toLocaleDateString('es-AR');
}

// marcar como pagado
async function pagar(id) {
    const { error } = await supabase
        .from(TABLA_FACTURAS)
        .update({ estado: 'pagado' })
        .eq('id', id);

    if (error) {
        console.error(`Error al marcar factura ${id} como pagada:`, error);
    } else {
        cargarFacturas();
    }
}