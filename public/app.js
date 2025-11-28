const API = "http://localhost:3000/api/facturas";

// cargar facturas al entrar
document.addEventListener("DOMContentLoaded", cargarFacturas);

// enviar formulario
document.getElementById("registro-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre-empresa").value;
    const fechaEmision = document.getElementById("fecha-emision").value;
    const diasVencimiento = document.getElementById("fecha-vencimiento").value;
    const monto = document.getElementById("monto").value;

    // calcular fecha de vencimiento real
    const fechaVenc = new Date(fechaEmision);
    fechaVenc.setDate(fechaVenc.getDate() + Number(diasVencimiento));

    const factura = {
        empresa: nombre,
        fechaEmision,
        fechaVencimiento: fechaVenc.toISOString(),
        monto,
        estado: "pendiente"
    };

    await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(factura)
    });

    cargarFacturas();
});

// obtener facturas
async function cargarFacturas() {
    const res = await fetch(API);
    const data = await res.json();

    const tbody = document.querySelector("#tablaFacturas tbody");
    tbody.innerHTML = "";

    data.forEach((f) => {
        const venc = new Date(f.fechaVencimiento).toLocaleDateString();
        
        let estado = f.estado;
        const hoy = new Date();
        if (estado !== "pagado" && new Date(f.fechaVencimiento) < hoy) {
            estado = "vencido";
        }
        const estadoClase = `estado-${estado}`;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${f.id}</td>
            <td>$ ${f.monto}</td>
            <td>${venc}</td>
            <td class = 'estado-celda' ${estadoClase}>${estado.toUpperCase()}</td>
            <td>
                ${estado === "pendiente" 
                    ? `<button onclick="pagar(${f.id})">Marcar pagado</button>`
                    : "—"}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// marcar como pagado
async function pagar(id) {
    await fetch(${API}/${id}/pagar, { method: "PUT" });
    cargarFacturas();
}