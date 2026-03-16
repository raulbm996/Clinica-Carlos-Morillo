/* =========================================
   ADMIN PANEL SCRIPTS (MOCK DATA & LOGIC)
   Para demostración de la interfaz gráfica
========================================= */

document.addEventListener('DOMContentLoaded', () => {

    /* --- LOGIN LOGIC --- */
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = document.getElementById('adminUser').value;
            const pass = document.getElementById('adminPass').value;
            const feedback = document.getElementById('loginFeedback');

            // Simulación simple de Auth
            if (user === 'admin' && pass === '1234') {
                feedback.style.color = 'var(--primary)';
                feedback.textContent = 'Acceso correcto. Redirigiendo...';
                setTimeout(() => {
                    globalThis.location.href = 'admin-dashboard.html';
                }, 800);
            } else {
                feedback.style.color = '#e74c3c';
                feedback.textContent = 'Usuario o contraseña incorrectos.';
            }
        });
    }


    /* --- DASHBOARD LOGIC --- */

    // Sidebar Navigation
    const navItems = document.querySelectorAll('.nav-item');
    const viewSections = document.querySelectorAll('.view-section');

    if (navItems.length > 0 && viewSections.length > 0) {
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const targetId = item.dataset.target;
                if (!targetId) return; // Ignore logout link

                e.preventDefault();

                // Remove active class from all
                navItems.forEach(nav => nav.classList.remove('active'));
                viewSections.forEach(sec => sec.classList.remove('active'));

                // Add active to current
                item.classList.add('active');
                document.getElementById(targetId).classList.add('active');

                // Mobile: close sidebar on click
                if (window.innerWidth <= 900) {
                    document.getElementById('adminSidebar').classList.remove('show');
                }
            });
        });
    }

    // Mobile Sidebar Toggle
    const openSidebarBtn = document.getElementById('openSidebar');
    const closeSidebarBtn = document.getElementById('closeSidebar');
    const adminSidebar = document.getElementById('adminSidebar');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');

    if (openSidebarBtn && closeSidebarBtn && adminSidebar) {
        openSidebarBtn.addEventListener('click', () => {
            adminSidebar.classList.add('show');
        });

        closeSidebarBtn.addEventListener('click', () => {
            adminSidebar.classList.remove('show');
        });

        if (sidebarBackdrop) {
            sidebarBackdrop.addEventListener('click', () => {
                adminSidebar.classList.remove('show');
            });
        }

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                adminSidebar.classList.remove('show');
            }
        });
    }

    /* --- MOCK DATA INJECTION --- */

    // 1. Reservas Web Mock Data
    const mockReservas = [
        { fecha: '18/03/2026 - 10:30', paciente: 'Laura Gómez', servicio: 'Osteopatía', tel: '654 321 098', status: 'pending', statusText: 'Pendiente' },
        { fecha: '18/03/2026 - 12:00', paciente: 'Pedro Sánchez', servicio: 'Fisioterapia', tel: '643 210 987', status: 'confirmed', statusText: 'Confirmada' },
        { fecha: '19/03/2026 - 09:00', paciente: 'Ana Ruiz', servicio: 'Pilates', tel: '632 109 876', status: 'pending', statusText: 'Pendiente' },
        { fecha: '19/03/2026 - 16:30', paciente: 'Miguel Torres', servicio: 'Recuperación Pie', tel: '621 098 765', status: 'cancelled', statusText: 'Cancelada' },
        { fecha: '20/03/2026 - 11:15', paciente: 'Sofía Martín', servicio: 'Psicología', tel: '610 987 654', status: 'confirmed', statusText: 'Confirmada' }
    ];

    const reservasBody = document.getElementById('reservasTableBody');
    if (reservasBody) {
        let html = '';
        mockReservas.forEach(r => {
            html += `
            <tr>
                <td data-label="Fecha / Hora"><strong>${r.fecha}</strong></td>
                <td data-label="Paciente">${r.paciente}</td>
                <td data-label="Servicio">${r.servicio}</td>
                <td data-label="Teléfono">${r.tel}</td>
                <td data-label="Estado"><span class="status ${r.status}">${r.statusText}</span></td>
                <td data-label="Acción">
                    <button class="action-btn" title="Confirmar"><i class="fa-solid fa-check text-success" style="color:#15803d"></i></button>
                    <button class="action-btn" title="Eliminar"><i class="fa-solid fa-trash text-danger"></i></button>
                </td>
            </tr>`;
        });
        reservasBody.innerHTML = html;
    }

    // 2. Pacientes Mock Data
    const mockPacientes = [
        { id: '#00145', nombre: 'Carlos López Fernández', tel: '600 111 222', email: 'clopez@mail.com', visita: '10/03/2026' },
        { id: '#00146', nombre: 'Elena Navarro Ruiz', tel: '600 222 333', email: 'elena.nr@mail.com', visita: '12/03/2026' },
        { id: '#00147', nombre: 'Marcos Jiménez', tel: '600 333 444', email: 'mjimenez88@mail.com', visita: '15/03/2026' },
        { id: '#00148', nombre: 'Lucía Ortega', tel: '600 444 555', email: 'lu.ortega@mail.com', visita: '16/03/2026' }
    ];

    const pacientesBody = document.getElementById('pacientesTableBody');
    if (pacientesBody) {
        let html = '';
        mockPacientes.forEach(p => {
            html += `
            <tr>
                <td data-label="ID"><span style="color:var(--text-light); font-size:0.8rem;">${p.id}</span></td>
                <td data-label="Nombre Completo"><strong>${p.nombre}</strong><br><span style="font-size:0.75rem; color:var(--text-light)">${p.email}</span></td>
                <td data-label="Contacto">${p.tel}</td>
                <td data-label="Última Visita">${p.visita}</td>
                <td data-label="Acciones">
                    <button class="action-btn" title="Ver Ficha"><i class="fa-regular fa-eye"></i></button>
                    <button class="action-btn" title="Editar"><i class="fa-solid fa-pen"></i></button>
                </td>
            </tr>`;
        });
        pacientesBody.innerHTML = html;
    }

    // New patient button interaction
    const addPatientBtn = document.getElementById('addPatientBtn');
    if (addPatientBtn) {
        addPatientBtn.addEventListener('click', () => {
            alert('En una integración real con Base de Datos, esto abriría un formulario para añadir un nuevo paciente a la nube.');
        });
    }
});
