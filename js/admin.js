document.addEventListener('DOMContentLoaded', () => {

    // Mostrar/ocultar contraseña en login
    const adminPass = document.getElementById('adminPass');
    const toggleLoginPass = document.getElementById('toggleLoginPass');
    const iconLoginPass = document.getElementById('iconLoginPass');
    if (adminPass && toggleLoginPass && iconLoginPass) {
        toggleLoginPass.addEventListener('click', (e) => {
            e.preventDefault();
            if (adminPass.type === 'password') {
                adminPass.type = 'text';
                iconLoginPass.classList.remove('fa-eye-slash');
                iconLoginPass.classList.add('fa-eye');
            } else {
                adminPass.type = 'password';
                iconLoginPass.classList.remove('fa-eye');
                iconLoginPass.classList.add('fa-eye-slash');
            }
        });
    }

    // Mostrar/ocultar contraseña en cambio de contraseña
    const currentPass = document.getElementById('currentPass');
    const toggleCurrentPass = document.getElementById('toggleCurrentPass');
    const iconCurrentPass = document.getElementById('iconCurrentPass');
    if (currentPass && toggleCurrentPass && iconCurrentPass) {
        toggleCurrentPass.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPass.type === 'password') {
                currentPass.type = 'text';
                iconCurrentPass.classList.remove('fa-eye-slash');
                iconCurrentPass.classList.add('fa-eye');
            } else {
                currentPass.type = 'password';
                iconCurrentPass.classList.remove('fa-eye');
                iconCurrentPass.classList.add('fa-eye-slash');
            }
        });
    }
    const newPass = document.getElementById('newPass');
    const toggleNewPass = document.getElementById('toggleNewPass');
    const iconNewPass = document.getElementById('iconNewPass');
    if (newPass && toggleNewPass && iconNewPass) {
        toggleNewPass.addEventListener('click', (e) => {
            e.preventDefault();
            if (newPass.type === 'password') {
                newPass.type = 'text';
                iconNewPass.classList.remove('fa-eye-slash');
                iconNewPass.classList.add('fa-eye');
            } else {
                newPass.type = 'password';
                iconNewPass.classList.remove('fa-eye');
                iconNewPass.classList.add('fa-eye-slash');
            }
        });
    }
});
/* =========================================
   ADMIN PANEL – Clínica Carlos Morillo
   Conectado a Vercel Serverless + TiDB Cloud
========================================= */

const API = '/api';


function getMonday(d) {
    const dt = new Date(d);
    const day = dt.getDay();
    const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
    dt.setDate(diff);
    dt.setHours(0, 0, 0, 0);
    return dt;
}

function isSameDay(a, b) {
    return a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();
}

function formatLocalDate(value) {
    if (value instanceof Date) {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, '0');
        const day = String(value.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    if (typeof value === 'string') {
        const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match) return `${match[1]}-${match[2]}-${match[3]}`;
    }
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
        return formatLocalDate(parsed);
    }
    return '';
}

function formatDisplayDate(value) {
    const local = formatLocalDate(value);
    if (!local) return '';
    const [year, month, day] = local.split('-');
    return `${day}/${month}/${year}`;
}

/* ======== Utilidad fetch ======== */
async function apiPost(url, body = {}) {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
    });
    return res.json();
}

async function apiGet(url) {
    const res = await fetch(url, { credentials: 'include' });
    return res.json();
}

document.addEventListener('DOMContentLoaded', () => {

    /* ======== LOGIN ======== */
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = document.getElementById('adminUser').value.trim().toLowerCase();
            const pass = document.getElementById('adminPass').value;
            const feedback = document.getElementById('loginFeedback');
            const btn = loginForm.querySelector('button[type="submit"]');

            btn.disabled = true;
            feedback.style.color = '#718096';
            feedback.textContent = 'Verificando…';

            try {
                const data = await apiPost(`${API}/auth`, {
                    username: user,
                    password: pass,
                });

                if (data.ok) {
                    feedback.style.color = '#3bb2b8';
                    feedback.textContent = 'Acceso correcto. Redirigiendo…';
                    setTimeout(() => { location.href = 'admin-dashboard.html'; }, 800);
                } else {
                    feedback.style.color = '#e53e3e';
                    feedback.textContent = data.error || 'Usuario o contraseña incorrectos.';
                    btn.disabled = false;
                }
            } catch (err) {
                feedback.style.color = '#e53e3e';
                feedback.textContent = 'Error de conexión. Inténtalo de nuevo.';
                btn.disabled = false;
            }
        });
        return; // La página de login no necesita más lógica
    }

    /* ======== DASHBOARD ======== */
    const adminSidebar = document.getElementById('adminSidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    const calGrid = document.getElementById('calendarGrid');
    if (!calGrid) return; // rest is dashboard-only

    /* --- Verificar sesión al cargar dashboard --- */
    let currentUser = null;

    async function loadSession() {
        try {
            const data = await apiGet(`${API}/auth`);
            if (!data.ok) {
                location.href = 'admin-login.html';
                return;
            }
            currentUser = data.user;
            const displayName = (currentUser.nombre + (currentUser.apellidos ? ' ' + currentUser.apellidos : '')) || 'Usuario';
            const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

            // Foto: siempre usar la de la BD y actualizar sessionStorage
            if (currentUser.foto) {
                sessionStorage.setItem('adminPhoto', currentUser.foto);
                if (avatarEl) {
                    avatarEl.innerHTML = '<img src="' + currentUser.foto.replaceAll('"', '&quot;') + '" alt="avatar">';
                }
            } else {
                sessionStorage.removeItem('adminPhoto');
                if (avatarEl) avatarEl.textContent = initials;
            }
            if (nameEl) nameEl.textContent = displayName;
            if (breadcrumbEl) breadcrumbEl.textContent = '› ' + displayName;
        } catch (err) {
            location.href = 'admin-login.html';
        }
    }

    const avatarEl = document.getElementById('userAvatarInitials');
    const nameEl = document.getElementById('userDisplayName');
    const breadcrumbEl = document.getElementById('calBreadcrumbUser');

    loadSession();

    /* --- Member tooltips --- */
    const tooltip = document.createElement('div');
    tooltip.className = 'member-tooltip';
    document.body.appendChild(tooltip);

    document.querySelectorAll('.member-avatar[data-name]').forEach(av => {
        av.addEventListener('mouseenter', () => {
            tooltip.textContent = av.dataset.name;
            const rect = av.getBoundingClientRect();
            tooltip.style.left = rect.left + 'px';
            tooltip.style.top = (rect.bottom + 6) + 'px';
            tooltip.style.transform = 'none';
            tooltip.classList.add('visible');
        });
        av.addEventListener('mouseleave', () => {
            tooltip.classList.remove('visible');
        });
    });

    /* --- Mobile sidebar --- */
    const openBtn = document.getElementById('openSidebar');
    if (openBtn) {
        openBtn.addEventListener('click', () => adminSidebar.classList.add('show'));
    }
    if (backdrop) {
        backdrop.addEventListener('click', () => adminSidebar.classList.remove('show'));
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') adminSidebar.classList.remove('show');
    });

    /* --- Sidebar nav active state + view switching --- */
    const tabBar = document.querySelector('.admin-tabs');
    const allViews = document.querySelectorAll('.view-section');

    function showView(targetId) {
        allViews.forEach(v => v.classList.remove('active'));
        const section = document.getElementById(targetId);
        if (section) section.classList.add('active');

        if (targetId === 'calendario' || targetId === 'pacientes') {
            tabBar.style.display = '';
            tabs.forEach(t => {
                t.classList.toggle('active', t.dataset.target === targetId);
            });
        } else {
            tabBar.style.display = 'none';
        }

        // Cargar datos al cambiar de vista
        if (targetId === 'pacientes') loadPacientes();
        if (targetId === 'calendario') renderCalendar();
    }

    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.sidebar-nav .nav-item').forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            const target = item.dataset.target;
            if (target) showView(target);
            if (window.innerWidth <= 900) adminSidebar.classList.remove('show');
        });
    });

    /* --- Tab switching --- */
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            showView(btn.dataset.target);
        });
    });

    /* --- Auto-toggle SI/NO --- */
    document.querySelectorAll('.auto-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.auto-toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    /* --- Mode toggle --- */
    const savedTheme = localStorage.getItem('adminTheme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        const darkBtn = document.querySelector('.mode-btn[data-mode="dark"]');
        const lightBtn = document.querySelector('.mode-btn[data-mode="light"]');
        if (darkBtn && lightBtn) {
            lightBtn.classList.remove('active');
            darkBtn.classList.add('active');
        }
    }

    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const mode = btn.dataset.mode;
            if (mode === 'dark') {
                document.body.classList.add('dark-theme');
                localStorage.setItem('adminTheme', 'dark');
            } else {
                document.body.classList.remove('dark-theme');
                localStorage.setItem('adminTheme', 'light');
            }
        });
    });

    /* --- Collapsible Sidebar --- */
    const sidebarToggle = document.getElementById('sidebarToggle');
    const savedSidebarState = localStorage.getItem('sidebarCollapsed');

    if (savedSidebarState === 'true') {
        if (adminSidebar) adminSidebar.classList.add('collapsed');
        const mainEl = document.querySelector('.admin-main');
        if (mainEl) mainEl.classList.add('collapsed');
    }

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', (e) => {
            e.preventDefault();
            const mainEl = document.querySelector('.admin-main');

            if (adminSidebar.classList.contains('collapsed')) {
                adminSidebar.classList.remove('collapsed');
                if (mainEl) mainEl.classList.remove('collapsed');
                localStorage.setItem('sidebarCollapsed', 'false');
            } else {
                adminSidebar.classList.add('collapsed');
                if (mainEl) mainEl.classList.add('collapsed');
                localStorage.setItem('sidebarCollapsed', 'true');
            }
        });
    }

    /* --- Topbar Search --- */
    const topbarSearchInput = document.querySelector('.topbar-search input');
    if (topbarSearchInput) {
        let topbarSearchTimeout;
        topbarSearchInput.addEventListener('input', () => {
            clearTimeout(topbarSearchTimeout);
            topbarSearchTimeout = setTimeout(() => {
                const query = topbarSearchInput.value.trim();

                // Cambiar a la pestaña de pacientes
                showView('pacientes');

                // Actualizar el buscador de la sección de pacientes si existe
                const secSearchInput = document.querySelector('.search-box input');
                if (secSearchInput) {
                    secSearchInput.value = query;
                }

                // Cargar los pacientes filtrados
                loadPacientes(query);
            }, 400);
        });
    }

    /* --- Logout --- */
    const logoutLink = document.querySelector('.logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await apiPost(`${API}/auth`, { logout: true });
            } catch (_) { /* ignore */ }
            sessionStorage.removeItem('adminPhoto');
            location.href = 'admin-login.html';
        });
    }

    /* ======================================================
       CALENDAR – Weekly grid con citas reales
       ====================================================== */
    const DAY_NAMES = ['lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.', 'dom.'];
    const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const HOUR_START = 8;
    const HOUR_END = 21;

    // Fecha de referencia para el calendario (lunes de la semana mostrada)
    let calSelectedDate = new Date();

    // Poblar selector de año (rango: año actual ± 5)
    const calMonthSelect = document.getElementById('calMonthSelect');
    const calYearSelect = document.getElementById('calYearSelect');
    if (calYearSelect) {
        const currentYear = new Date().getFullYear();
        for (let y = currentYear - 5; y <= currentYear + 5; y++) {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = y;
            if (y === currentYear) opt.selected = true;
            calYearSelect.appendChild(opt);
        }
    }
    // Sincronizar selects con la fecha actual
    function syncMonthYearSelects() {
        if (calMonthSelect) calMonthSelect.value = calSelectedDate.getMonth();
        if (calYearSelect) calYearSelect.value = calSelectedDate.getFullYear();
    }
    syncMonthYearSelects();

    // Colores por servicio
    const SERVICE_COLORS = {
        fisioterapia: { bg: '#e6f7f8', border: '#3bb2b8', text: '#1a7a7e' },
        osteopatia: { bg: '#fef3e2', border: '#f0a030', text: '#8a5a10' },
        neurofisioterapia: { bg: '#e8eef8', border: '#5a7dba', text: '#2d4a7a' },
        uroginecologia: { bg: '#fce4ec', border: '#e05580', text: '#8a1a40' },
        psicologia: { bg: '#f3e5f5', border: '#ab47bc', text: '#6a1b7a' },
        nutricion: { bg: '#e8f5e9', border: '#66bb6a', text: '#2e6b30' },
        pilates: { bg: '#fff8e1', border: '#fbc02d', text: '#7a6a10' },
        otro: { bg: '#f0f0f0', border: '#999', text: '#555' },
    };

    const STATUS_LABELS = {
        pendiente: '⏳',
        confirmada: '✅',
        cancelada: '❌',
    };

    async function renderCalendar() {
        const now = new Date();
        const monday = getMonday(calSelectedDate);

        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            days.push(d);
        }

        const hdr = document.getElementById('calMonthYear');
        if (hdr) hdr.textContent = MONTH_NAMES[days[0].getMonth()] + ' ' + days[0].getFullYear();

        // Build grid HTML
        let html = '';
        html += '<div class="cal-corner"><button class="cal-expand-btn"><i class="fa-solid fa-expand"></i></button></div>';
        days.forEach((d, i) => {
            const isToday = isSameDay(d, now);
            html += `<div class="cal-day-header ${isToday ? 'cal-today' : ''}">
                <span class="day-name">${DAY_NAMES[i]}</span>
                <span class="day-num">${d.getDate()}</span>
            </div>`;
        });

        for (let h = HOUR_START; h < HOUR_END; h++) {
            const label = String(h).padStart(2, '0') + ':00';
            html += `<div class="cal-time-label">${label}</div>`;
            days.forEach(d => {
                html += `<div class="cal-cell" data-hour="${h}" data-date="${formatLocalDate(d)}"></div>`;
            });
        }

        calGrid.innerHTML = html;

        // Cargar citas de la semana desde el backend
        const fechaInicio = days[0].toISOString().slice(0, 10);
        const fechaFin = days[6].toISOString().slice(0, 10);

        try {
            const data = await apiGet(`${API}/citas/listar?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`);
            if (data.ok && data.citas) {
                data.citas.forEach(cita => {
                    const citaFecha = formatLocalDate(cita.fecha);
                    const horaNum = parseInt(cita.hora.split(':')[0], 10);
                    const cell = calGrid.querySelector(`.cal-cell[data-date="${citaFecha}"][data-hour="${horaNum}"]`);
                    if (cell) {
                        const colors = SERVICE_COLORS[cita.servicio] || SERVICE_COLORS.otro;
                        const statusIcon = STATUS_LABELS[cita.estado] || '';
                        const citaEl = document.createElement('div');
                        citaEl.className = 'cal-appointment';
                        citaEl.style.cssText = `background:${colors.bg};border-left:3px solid ${colors.border};color:${colors.text};padding:2px 6px;border-radius:4px;font-size:.75rem;cursor:pointer;margin-bottom:2px;`;
                        citaEl.innerHTML = `<strong>${cita.hora}</strong> ${statusIcon}<br>${cita.paciente_nombre}<br><em style="opacity:.7">${cita.servicio}</em>`;
                        citaEl.title = `${cita.paciente_nombre} — ${cita.servicio}\n${cita.hora} | ${cita.estado}\n${cita.mensaje || ''}`;

                        // Click para cambiar estado
                        citaEl.addEventListener('click', () => showCitaActions(cita, citaEl));
                        cell.appendChild(citaEl);
                    }
                });
            }
        } catch (err) {
            console.error('Error cargando citas:', err);
        }
    }

    // Mini-menu para cambiar estado de cita
    function showCitaActions(cita, el) {
        // Eliminar menú previo si existe
        document.querySelectorAll('.cita-actions-popup').forEach(p => p.remove());

        const popup = document.createElement('div');
        popup.className = 'cita-actions-popup';
        popup.style.cssText = 'position:absolute;z-index:999;background:#fff;border:1px solid #ddd;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.15);padding:8px;min-width:160px;';

        const states = ['pendiente', 'confirmada', 'cancelada'];
        states.forEach(estado => {
            const btn = document.createElement('button');
            btn.style.cssText = 'display:block;width:100%;text-align:left;padding:6px 10px;border:none;background:none;cursor:pointer;border-radius:4px;font-size:.85rem;';
            btn.textContent = `${STATUS_LABELS[estado]} ${estado.charAt(0).toUpperCase() + estado.slice(1)}`;
            if (cita.estado === estado) btn.style.fontWeight = 'bold';
            btn.addEventListener('mouseenter', () => btn.style.background = '#f0f4f8');
            btn.addEventListener('mouseleave', () => btn.style.background = 'none');
            btn.addEventListener('click', async () => {
                popup.remove();
                const res = await apiPost(`${API}/citas/actualizar`, { id: cita.id, estado });
                if (res.ok) {
                    renderCalendar(); // Recargar
                } else {
                    alert(res.error || 'Error al actualizar la cita.');
                }
            });
            popup.appendChild(btn);
        });

        el.style.position = 'relative';
        el.appendChild(popup);

        // Cerrar al hacer click fuera
        setTimeout(() => {
            document.addEventListener('click', function handler(e) {
                if (!popup.contains(e.target)) {
                    popup.remove();
                    document.removeEventListener('click', handler);
                }
            });
        }, 10);
    }

    renderCalendar();

    // Calendar navigation
    const prevBtn = document.getElementById('calPrev');
    const nextBtn = document.getElementById('calNext');
    const todayBtn = document.getElementById('calToday');
    if (prevBtn) prevBtn.addEventListener('click', () => {
        calSelectedDate.setDate(calSelectedDate.getDate() - 7);
        syncMonthYearSelects();
        renderCalendar();
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
        calSelectedDate.setDate(calSelectedDate.getDate() + 7);
        syncMonthYearSelects();
        renderCalendar();
    });
    if (todayBtn) todayBtn.addEventListener('click', () => {
        calSelectedDate = new Date();
        syncMonthYearSelects();
        renderCalendar();
    });

    // Cambio de mes/año desde los selectores
    if (calMonthSelect) calMonthSelect.addEventListener('change', () => {
        const m = parseInt(calMonthSelect.value, 10);
        const y = parseInt(calYearSelect.value, 10);
        calSelectedDate = new Date(y, m, 1);
        renderCalendar();
    });
    if (calYearSelect) calYearSelect.addEventListener('change', () => {
        const m = parseInt(calMonthSelect.value, 10);
        const y = parseInt(calYearSelect.value, 10);
        calSelectedDate = new Date(y, m, 1);
        renderCalendar();
    });

    /* ======================================================
       PACIENTES – Datos reales desde PHP
       ====================================================== */
    const pacientesBody = document.getElementById('pacientesTableBody');
    let currentPacientes = [];

    async function loadPacientes(buscar = '') {
        if (!pacientesBody) return;
        pacientesBody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:#718096;">Cargando…</td></tr>';

        try {
            const url = buscar
                ? `${API}/pacientes?buscar=${encodeURIComponent(buscar)}`
                : `${API}/pacientes`;
            const data = await apiGet(url);

            if (data.ok && data.pacientes) {
                currentPacientes = data.pacientes;
                if (data.pacientes.length === 0) {
                    pacientesBody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:#718096;">No se encontraron pacientes.</td></tr>';
                    return;
                }

                let html = '';
                data.pacientes.forEach(p => {
                    html += `<tr class="paciente-row" data-id="${p.id}" style="cursor:pointer;">
                        <td data-label="ID"><span style="color:#718096;font-size:.8rem">#${String(p.id).padStart(5, '0')}</span></td>
                        <td data-label="Nombre"><strong>${p.nombre} ${p.apellidos || ''}</strong><br><span style="font-size:.75rem;color:#718096">${p.email || '—'}</span></td>
                        <td data-label="Contacto">${p.telefono || '—'}</td>
                        <td data-label="Última Visita">${p.ultima_visita_fmt || '—'}</td>
                        <td data-label="Acciones">
                            <button class="action-btn sms-icon js-table-sms" data-tel="${p.telefono || ''}" title="Enviar SMS" onclick="event.stopPropagation()"><i class="fa-solid fa-comment-sms"></i></button>
                            <button class="action-btn wa-icon js-table-wa" data-tel="${p.telefono || ''}" title="Enviar WhatsApp" onclick="event.stopPropagation()"><i class="fa-brands fa-whatsapp"></i></button>
                            <button class="action-btn cal-icon js-table-cal" title="Asignar Cita" onclick="event.stopPropagation()"><i class="fa-solid fa-calendar-plus"></i></button>
                        </td>
                    </tr>`;
                });
                pacientesBody.innerHTML = html;
            } else {
                pacientesBody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:#e53e3e;">Error al cargar pacientes.</td></tr>';
            }
        } catch (err) {
            pacientesBody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:#e53e3e;">Error de conexión.</td></tr>';
        }
    }

    // Delegación de eventos para clics en la tabla
    if (pacientesBody) {
        pacientesBody.addEventListener('click', (e) => {
            const row = e.target.closest('.paciente-row');
            if (row) {
                const id = row.getAttribute('data-id');
                if (id) openFichaPaciente(id);
            }
        });
    }

    /* ======================================================
       FICHA DE PACIENTE LOGIC
       ====================================================== */
    const secPacientes = document.getElementById('pacientes');
    const secFicha = document.getElementById('fichaPaciente');
    const btnBackToPacientes = document.getElementById('btnBackToPacientes');
    const checkExclusivo = document.getElementById('fCheckExclusivo');
    const boxExclusivo = document.getElementById('fBoxExclusivo');

    if (btnBackToPacientes) {
        btnBackToPacientes.addEventListener('click', () => {
            secFicha.classList.remove('active');
            secPacientes.classList.add('active');
            loadPacientes(); // Reload just in case
        });
    }

    if (checkExclusivo) {
        checkExclusivo.addEventListener('change', (e) => {
            boxExclusivo.style.display = e.target.checked ? 'block' : 'none';
        });
    }

    window.openFichaPaciente = function (id) {
        const paciente = currentPacientes.find(p => p.id == id);
        if (!paciente) return;

        // Hide list, show ficha
        if (secPacientes) secPacientes.classList.remove('active');
        if (secFicha) secFicha.classList.add('active');

        // Populate fields
        document.getElementById('fichaId').value = paciente.id;
        document.getElementById('fichaMainName').textContent = `${paciente.nombre} ${paciente.apellidos || ''}`.trim();
        document.getElementById('fNombre').value = paciente.nombre || '';
        document.getElementById('fApellidos').value = paciente.apellidos || '';
        document.getElementById('fNumHistoria').value = String(paciente.id).padStart(5, '0');

        document.getElementById('fTelefono').value = paciente.telefono || '';
        document.getElementById('fEmail').value = paciente.email || '';

        document.getElementById('fTipoDoc').value = paciente.tipo_documento || 'DNI/NIF/CIF/NIE';
        document.getElementById('fNumDoc').value = paciente.documento || '';
        document.getElementById('fSexo').value = paciente.sexo || '';

        if (paciente.fecha_nacimiento) {
            const dStr = typeof paciente.fecha_nacimiento === 'string' ? paciente.fecha_nacimiento.substring(0, 10) : '';
            document.getElementById('fNacimiento').value = dStr;
        } else {
            document.getElementById('fNacimiento').value = '';
        }

        document.getElementById('fOcupacion').value = paciente.ocupacion || '';
        document.getElementById('fDirFacturacion').value = paciente.direccion_facturacion || '';
        document.getElementById('fDirAdicional').value = paciente.direccion_adicional || '';
        document.getElementById('fCodPostal').value = paciente.codigo_postal || '';
        document.getElementById('fLocalidad').value = paciente.localidad || '';
        document.getElementById('fProvincia').value = paciente.provincia || '';
        document.getElementById('fPais').value = paciente.pais || '';
        document.getElementById('fObservaciones').value = paciente.notas || '';

        // Checkboxes
        if (checkExclusivo) {
            const ex = (paciente.exclusivo_profesionales && paciente.exclusivo_profesionales !== '');
            checkExclusivo.checked = ex;
            if (boxExclusivo) boxExclusivo.style.display = ex ? 'block' : 'none';
            if (ex && document.getElementById('fSelectExclusivo')) {
                document.getElementById('fSelectExclusivo').value = paciente.exclusivo_profesionales;
            }
        }

        const chkProt = document.getElementById('fCheckProteccion');
        if (chkProt) chkProt.checked = !!paciente.firmado_proteccion_datos;

        const chkPub = document.getElementById('fCheckPublicidad');
        if (chkPub) chkPub.checked = !!paciente.recibir_publicidad;

        const chkRec = document.getElementById('fCheckRecordatorios');
        // By default should be true based on the DB or design, but we map to DB
        if (chkRec) chkRec.checked = paciente.recordatorios_automaticos !== 0; // Assuming default 1 or true

        // Cargar citas del paciente
        const citasContainer = document.getElementById('fPacienteCitas');
        if (citasContainer) {
            citasContainer.innerHTML = 'Cargando…';
            loadFichaCitas(paciente.id, paciente.telefono || '');
        }
    };

    async function loadFichaCitas(pacienteId, telefono) {
        const container = document.getElementById('fPacienteCitas');
        if (!container) return;
        try {
            let url = `${API}/citas/listar`;
            if (telefono && telefono.trim()) {
                url += `?telefono=${encodeURIComponent(telefono.trim())}`;
            } else if (pacienteId) {
                url += `?paciente_id=${encodeURIComponent(pacienteId)}`;
            }
            const data = await apiGet(url);
            if (!data.ok || !data.citas) {
                container.innerHTML = '<div style="color:#e53e3e;">Error al cargar citas.</div>';
                return;
            }
            if (data.citas.length === 0) {
                container.innerHTML = '<div style="color:#718096;">No hay citas para este paciente.</div>';
                return;
            }
            const list = document.createElement('div');
            list.style.display = 'grid';
            list.style.gap = '8px';
            // Mostrar sólo citas confirmadas
            const confirmed = data.citas.filter(x => x.estado === 'confirmada');
            if (confirmed.length === 0) {
                container.innerHTML = '<div style="color:#718096;">No hay citas confirmadas para este paciente.</div>';
                return;
            }
            confirmed.sort((a, b) => (a.fecha > b.fecha) ? 1 : (a.fecha < b.fecha) ? -1 : (a.hora > b.hora ? 1 : -1));
            confirmed.forEach(c => {
                const colors = SERVICE_COLORS[c.servicio] || SERVICE_COLORS.otro;
                const item = document.createElement('div');
                item.style.border = '1px solid #e6eef4';
                item.style.padding = '8px';
                item.style.borderRadius = '6px';
                item.style.display = 'flex';
                item.style.justifyContent = 'space-between';
                item.style.alignItems = 'center';

                const left = document.createElement('div');
                const fechaFmt = formatDisplayDate(c.fecha);
                left.innerHTML = `<strong style="display:block;color:${colors.text}">${fechaFmt} ${c.hora}</strong><small style="color:#718096">${c.servicio}</small><div style="font-size:.85rem;color:#2d3748;margin-top:6px">${c.paciente_nombre}</div>`;

                const right = document.createElement('div');
                right.style.display = 'flex';
                right.style.gap = '6px';

                const status = document.createElement('span');
                status.textContent = STATUS_LABELS[c.estado] || c.estado;

                const btnCancel = document.createElement('button');
                btnCancel.className = 'btn btn-sm btn-danger';
                btnCancel.textContent = 'Cancelar';
                btnCancel.addEventListener('click', async () => {
                    if (!confirm('¿Confirmas cancelar esta cita?')) return;
                    const res = await apiPost(`${API}/citas/actualizar`, { id: c.id, estado: 'cancelada' });
                    if (res.ok) loadFichaCitas(pacienteId, telefono);
                    renderCalendar();
                });

                right.appendChild(status);
                right.appendChild(btnCancel);

                item.appendChild(left);
                item.appendChild(right);
                list.appendChild(item);
            });
            container.innerHTML = '';
            container.appendChild(list);
        } catch (err) {
            console.error('Error cargando citas paciente:', err);
            container.innerHTML = '<div style="color:#e53e3e;">Error de conexión.</div>';
        }
    }

    // Icons Logic
    const fichaIconSMS = document.getElementById('fichaIconSMS');
    const fichaIconWA = document.getElementById('fichaIconWA');
    const fichaIconCal = document.getElementById('fichaIconCal');

    if (fichaIconSMS) {
        fichaIconSMS.addEventListener('click', () => {
            const t = document.getElementById('fTelefono').value.trim();
            if (t) window.location.href = `sms:+34${t}`;
            else alert('El paciente no tiene teléfono guardado.');
        });
    }

    if (fichaIconWA) {
        fichaIconWA.addEventListener('click', () => {
            const t = document.getElementById('fTelefono').value.trim().replace(/\\D/g, '');
            if (t) window.open(`https://wa.me/34${t}`, '_blank');
            else alert('El paciente no tiene teléfono válido.');
        });
    }

    if (fichaIconCal) {
        fichaIconCal.addEventListener('click', () => {
            const nombre = document.getElementById('fNombre').value.trim();
            const apellidos = document.getElementById('fApellidos').value.trim();
            const telefono = document.getElementById('fTelefono').value.trim();
            const fullName = [nombre, apellidos].filter(Boolean).join(' ');
            // Abrir el modal de Nueva Cita con el paciente pre-seleccionado
            if (window.openNuevaCita) {
                window.openNuevaCita({ nombre: fullName, telefono });
            }
        });
    }

    // Save Ficha
    const btnGuardarFicha = document.getElementById('btnGuardarFicha');
    if (btnGuardarFicha) {
        btnGuardarFicha.addEventListener('click', async () => {
            const id = document.getElementById('fichaId').value;
            const payload = {
                id,
                nombre: document.getElementById('fNombre').value.trim(),
                apellidos: document.getElementById('fApellidos').value.trim(),
                telefono: document.getElementById('fTelefono').value.trim(),
                email: document.getElementById('fEmail').value.trim(),
                tipo_documento: document.getElementById('fTipoDoc').value,
                documento: document.getElementById('fNumDoc').value.trim(),
                sexo: document.getElementById('fSexo').value,
                fecha_nacimiento: document.getElementById('fNacimiento').value || null,
                ocupacion: document.getElementById('fOcupacion').value.trim(),
                direccion_facturacion: document.getElementById('fDirFacturacion').value.trim(),
                direccion_adicional: document.getElementById('fDirAdicional').value.trim(),
                codigo_postal: document.getElementById('fCodPostal').value.trim(),
                localidad: document.getElementById('fLocalidad').value.trim(),
                provincia: document.getElementById('fProvincia').value.trim(),
                pais: document.getElementById('fPais').value.trim(),
                notas: document.getElementById('fObservaciones').value.trim(),
                exclusivo_profesionales: document.getElementById('fCheckExclusivo').checked ? document.getElementById('fSelectExclusivo').value : '',
                firmado_proteccion_datos: document.getElementById('fCheckProteccion').checked ? 1 : 0,
                recibir_publicidad: document.getElementById('fCheckPublicidad').checked ? 1 : 0,
                recordatorios_automaticos: document.getElementById('fCheckRecordatorios').checked ? 1 : 0
            };

            const btn = btnGuardarFicha;
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Guardando...';
            btn.disabled = true;

            try {
                // We reuse the POST endpoint to update by passing an ID
                const res = await apiPost(`${API}/pacientes`, payload);
                if (res.ok) {
                    alert('Ficha guardada exitosamente.');
                    document.getElementById('fichaMainName').textContent = `${payload.nombre} ${payload.apellidos}`.trim();
                    // Refetch current patient data locally to avoid re-fetching all
                    const idx = currentPacientes.findIndex(p => p.id == id);
                    if (idx > -1) currentPacientes[idx] = { ...currentPacientes[idx], ...payload };
                } else {
                    alert('Error: ' + res.error);
                }
            } catch (err) {
                alert('Error de conexión al guardar la ficha.');
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }

    // Búsqueda de pacientes
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                loadPacientes(searchInput.value.trim());
            }, 400);
        });
    }

    // ===== ASISTENTE MODAL =====
    const asistenteOverlay = document.getElementById('asistenteOverlay');
    const asistenteClose = document.getElementById('asistenteClose');
    const asistenteSaveBtn = document.getElementById('asistenteSaveBtn');
    const topbarAddBtn = document.getElementById('topbarAddPatientBtn');

    function openAsistente() {
        if (!asistenteOverlay) return;
        // Limpiar campos
        ['asiNombre', 'asiApellidos', 'asiTelefono', 'asiEmail'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        const asistenteSummary = document.getElementById('asistentePatientSummary');
        if (asistenteSummary) asistenteSummary.classList.add('visible');
        asistenteOverlay.classList.add('active');
        const nombreInput = document.getElementById('asiNombre');
        if (nombreInput) setTimeout(() => nombreInput.focus(), 150);
    }

    function closeAsistente() {
        const asistenteSummary = document.getElementById('asistentePatientSummary');
        if (asistenteSummary) asistenteSummary.classList.remove('visible');
        if (asistenteOverlay) asistenteOverlay.classList.remove('active');
    }

    // Abrir desde botón + del topbar
    if (topbarAddBtn) topbarAddBtn.addEventListener('click', openAsistente);

    // Abrir desde botón "Nuevo paciente" en la sección Pacientes
    const addPatientBtn = document.getElementById('addPatientBtn');
    if (addPatientBtn) addPatientBtn.addEventListener('click', openAsistente);

    // Cerrar modal
    if (asistenteClose) asistenteClose.addEventListener('click', closeAsistente);
    if (asistenteOverlay) {
        asistenteOverlay.addEventListener('click', (e) => {
            if (e.target === asistenteOverlay) closeAsistente();
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && asistenteOverlay?.classList.contains('active')) closeAsistente();
    });

    // Guardar paciente desde el modal
    if (asistenteSaveBtn) {
        asistenteSaveBtn.addEventListener('click', async () => {
            const nombre = (document.getElementById('asiNombre')?.value || '').trim();
            const apellidos = (document.getElementById('asiApellidos')?.value || '').trim();
            const telefono = (document.getElementById('asiTelefono')?.value || '').trim();
            const email = (document.getElementById('asiEmail')?.value || '').trim();

            if (!nombre) {
                alert('El nombre del paciente es obligatorio.');
                return;
            }

            const fullName = nombre + (apellidos ? ' ' + apellidos : '');

            try {
                const data = await apiPost(`${API}/pacientes`, {
                    nombre: fullName,
                    telefono,
                    email,
                });

                if (data.ok) {
                    alert('Paciente creado correctamente.');
                    closeAsistente();
                    loadPacientes();
                } else {
                    alert(data.error || 'Error al crear paciente.');
                }
            } catch (err) {
                alert('Error de conexión.');
            }
        });
    }

    /* ======================================================
       USUARIO – Profile & Password (conectado a PHP)
       ====================================================== */
    const userEmailInput = document.getElementById('userEmail');
    const userNameInput = document.getElementById('userName');
    const userSurnameInput = document.getElementById('userSurname');

    // Los datos se cargan cuando la sesión se verifica (loadSession)
    // Proveemos un setter que se ejecuta después
    const originalLoadSession = loadSession;
    loadSession = async function () {
        await originalLoadSession();
        if (currentUser) {
            if (userNameInput) userNameInput.value = currentUser.nombre || '';
            if (userSurnameInput) userSurnameInput.value = currentUser.apellidos || '';
            if (userEmailInput) userEmailInput.value = currentUser.email || '';

            // Cargar foto en la sección de perfil (siempre desde la BD)
            if (currentUser.foto && profilePhotoImg && photoCameraIcon) {
                sessionStorage.setItem('adminPhoto', currentUser.foto);
                profilePhotoImg.src = currentUser.foto;
                profilePhotoImg.style.display = 'block';
                photoCameraIcon.style.display = 'none';
            } else if (profilePhotoImg && photoCameraIcon) {
                sessionStorage.removeItem('adminPhoto');
                profilePhotoImg.src = '';
                profilePhotoImg.style.display = 'none';
                photoCameraIcon.style.display = '';
            }
        }
    };
    // Re-run con la nueva versión
    loadSession();

    /* ======== Cargar profesionales para el select exclusivo ======== */
    async function loadProfesionales() {
        try {
            const data = await apiGet(`${API}/usuario`);
            const select = document.getElementById('fSelectExclusivo');
            if (!select || !data?.ok) return;
            select.innerHTML = '';
            data.usuarios.forEach(u => {
                const opt = document.createElement('option');
                opt.value = u.username || u.id;
                opt.textContent = (u.nombre || '') + (u.apellidos ? ' ' + u.apellidos : '') + (u.username ? ' (' + u.username + ')' : '');
                select.appendChild(opt);
            });
        } catch (err) {
            console.warn('No se pudieron cargar profesionales', err);
        }
    }
    loadProfesionales();

    /* ======== Auditoría: modal, fetch y paginación ======== */
    let auditState = { page: 1, perPage: 20, pacienteId: null };

    async function fetchAudit() {
        try {
            const params = new URLSearchParams();
            if (auditState.pacienteId) params.set('pacienteId', auditState.pacienteId);
            params.set('page', auditState.page);
            params.set('perPage', auditState.perPage);
            const u = `${API}/auditoria?` + params.toString();
            const data = await apiGet(u);
            return data;
        } catch (err) {
            console.error('Error fetching audit', err);
            return null;
        }
    }

    async function openAuditModal(pacienteId) {
        auditState.pacienteId = pacienteId;
        auditState.page = 1;
        document.getElementById('auditModal').style.display = 'block';
        await renderAuditPage();
    }

    async function renderAuditPage() {
        const listEl = document.getElementById('auditList');
        const infoEl = document.getElementById('auditPageInfo');
        listEl.innerHTML = 'Cargando…';
        const data = await fetchAudit();
        if (!data || !data.ok) {
            listEl.innerHTML = '<div class="text-red">Error cargando auditoría.</div>';
            return;
        }
        if (!data.registros || data.registros.length === 0) {
            listEl.innerHTML = '<div>No hay registros.</div>';
        } else {
            listEl.innerHTML = data.registros.map(r => {
                const fecha = new Date(r.created_at).toLocaleString('es-ES');
                return `<div style="padding:8px;border-bottom:1px solid #f0f0f0;"><strong>${r.accion}</strong> — <em>${r.usuario_nombre}</em> — <small>${r.paciente_nombre || ''}</small><div style="font-size:0.9rem;color:#555;">${r.detalles || ''}</div><div style="font-size:0.8rem;color:#999;">${fecha} — IP: ${r.ip_address || '—'}</div></div>`;
            }).join('');
        }
        if (data.pagination) {
            infoEl.textContent = `Página ${data.pagination.page} de ${data.pagination.totalPages} (total ${data.pagination.total})`;
        } else {
            infoEl.textContent = '';
        }
    }

    // Modal controls
    const auditModal = document.getElementById('auditModal');
    const auditClose = document.getElementById('auditModalClose');
    if (auditClose) auditClose.addEventListener('click', () => { auditModal.style.display = 'none'; });
    document.getElementById('auditPrev').addEventListener('click', async () => {
        if (auditState.page > 1) { auditState.page--; await renderAuditPage(); }
    });
    document.getElementById('auditNext').addEventListener('click', async () => {
        auditState.page++; await renderAuditPage();
    });

    document.getElementById('btnHistorialAccesos')?.addEventListener('click', () => {
        const pid = document.getElementById('fichaId')?.value;
        if (!pid) return alert('ID de paciente no disponible');
        openAuditModal(pid);
    });

    document.getElementById('auditApplyFilters')?.addEventListener('click', async () => {
        const userFilter = document.getElementById('auditFilterUser').value.trim();
        const actionFilter = document.getElementById('auditFilterAction').value.trim();
        const desde = document.getElementById('auditDesde').value;
        const hasta = document.getElementById('auditHasta').value;
        auditState.page = 1;
        // Build URL with extra params
        const params = new URLSearchParams();
        if (auditState.pacienteId) params.set('pacienteId', auditState.pacienteId);
        if (userFilter) params.set('usuarioId', userFilter);
        if (actionFilter) params.set('accion', actionFilter);
        if (desde) params.set('desde', desde);
        if (hasta) params.set('hasta', hasta);
        params.set('page', auditState.page);
        params.set('perPage', auditState.perPage);
        const data = await apiGet(`${API}/auditoria?` + params.toString());
        const listEl = document.getElementById('auditList');
        const infoEl = document.getElementById('auditPageInfo');
        if (!data || !data.ok) { listEl.innerHTML = 'Error aplicando filtros.'; return; }
        listEl.innerHTML = data.registros.map(r => {
            const fecha = new Date(r.created_at).toLocaleString('es-ES');
            return `<div style="padding:8px;border-bottom:1px solid #f0f0f0;"><strong>${r.accion}</strong> — <em>${r.usuario_nombre}</em> — <small>${r.paciente_nombre || ''}</small><div style="font-size:0.9rem;color:#555;">${r.detalles || ''}</div><div style="font-size:0.8rem;color:#999;">${fecha} — IP: ${r.ip_address || '—'}</div></div>`;
        }).join('');
        if (data.pagination) infoEl.textContent = `Página ${data.pagination.page} de ${data.pagination.totalPages} (total ${data.pagination.total})`;
    });

    /* ======== Exportar y Eliminar paciente ======== */
    document.getElementById('btnExportarPaciente')?.addEventListener('click', () => {
        const id = document.getElementById('fichaId')?.value;
        if (!id) return alert('ID de paciente no disponible');
        // Construir HTML imprimible a partir de campos visibles
        const parts = [];
        const add = (label, value) => parts.push(`<p><strong>${label}:</strong> ${value || '—'}</p>`);
        add('Nombre', document.getElementById('fNombre')?.value);
        add('Apellidos', document.getElementById('fApellidos')?.value);
        add('Teléfono', document.getElementById('fTelefono')?.value);
        add('Email', document.getElementById('fEmail')?.value);
        add('Documento', document.getElementById('fNumDoc')?.value);
        add('Nacimiento', document.getElementById('fNacimiento')?.value);
        add('Observaciones', document.getElementById('fObservaciones')?.value);
        const popup = window.open('', '_blank', 'width=900,height=700');
        const html = `<!doctype html><html><head><meta charset="utf-8"><title>Ficha paciente</title><style>body{font-family:Arial,Helvetica,sans-serif;padding:20px}h1{color:#0f766e}</style></head><body><h1>Ficha Paciente</h1>${parts.join('')}<hr><p>Exportado desde Clínica Carlos Morillo</p></body></html>`;
        popup.document.open(); popup.document.write(html); popup.document.close();
        setTimeout(() => popup.print(), 300);
    });

    document.getElementById('btnEliminarPaciente')?.addEventListener('click', async () => {
        const id = document.getElementById('fichaId')?.value;
        if (!id) return alert('ID de paciente no disponible');
        if (!confirm('¿Estás seguro? Esta acción eliminará permanentemente la ficha.')) return;
        if (!confirm('Confirmación final: eliminar paciente permanentemente. ¿Deseas continuar?')) return;
        try {
            const res = await fetch(`${API}/pacientes?id=${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'include' });
            const data = await res.json();
            if (data.ok) {
                alert('Paciente eliminado.');
                showView('pacientes');
                loadPacientes();
            } else {
                alert('Error: ' + (data.error || 'no se pudo eliminar'));
            }
        } catch (err) {
            alert('Error al eliminar paciente.');
        }
    });

    // Profile photo (mantener en sessionStorage para rapidez, no guardar en BD por tamaño)
    const profilePhoto = document.getElementById('profilePhoto');
    const profilePhotoInput = document.getElementById('profilePhotoInput');
    const profilePhotoImg = document.getElementById('profilePhotoImg');
    const photoCameraIcon = document.getElementById('photoCameraIcon');
    const removePhotoBtn = document.getElementById('removePhotoBtn');

    const savedPhoto = sessionStorage.getItem('adminPhoto');
    if (savedPhoto && profilePhotoImg && photoCameraIcon) {
        profilePhotoImg.src = savedPhoto;
        profilePhotoImg.style.display = 'block';
        photoCameraIcon.style.display = 'none';
    }

    if (profilePhoto && profilePhotoInput) {
        profilePhoto.addEventListener('click', () => profilePhotoInput.click());

        profilePhotoInput.addEventListener('change', () => {
            const file = profilePhotoInput.files[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) { alert('Selecciona un archivo de imagen.'); return; }
            if (file.size > 2 * 1024 * 1024) { alert('La imagen no debe superar 2 MB.'); return; }
            const reader = new FileReader();
            reader.onload = (ev) => {
                profilePhotoImg.src = ev.target.result;
                profilePhotoImg.style.display = 'block';
                photoCameraIcon.style.display = 'none';
                sessionStorage.setItem('adminPhoto', ev.target.result);
                if (avatarEl) avatarEl.innerHTML = '<img src="' + ev.target.result.replace(/"/g, '&quot;') + '" alt="avatar">';
            };
            reader.readAsDataURL(file);
        });
    }

    if (removePhotoBtn) {
        removePhotoBtn.addEventListener('click', () => {
            profilePhotoImg.src = '';
            profilePhotoImg.style.display = 'none';
            photoCameraIcon.style.display = '';
            profilePhotoInput.value = '';
            sessionStorage.removeItem('adminPhoto');
            const displayName = nameEl ? nameEl.textContent : 'U';
            const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
            if (avatarEl) avatarEl.textContent = initials;
        });
    }

    // Guardar perfil → PHP
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', async () => {
            const name = (userNameInput.value || '').trim();
            if (name.length < 3) {
                alert('El nombre debe tener al menos 3 letras.');
                return;
            }
            const apellidos = (userSurnameInput.value || '').trim();
            const email = (userEmailInput.value || '').trim();

            try {
                // Tomar la foto actual del perfil (si existe)
                let foto = '';
                if (profilePhotoImg && profilePhotoImg.src && profilePhotoImg.style.display !== 'none') {
                    foto = profilePhotoImg.src;
                }
                const data = await apiPost(`${API}/usuario`, {
                    nombre: name,
                    apellidos,
                    email,
                    foto,
                });

                if (data.ok) {
                    const fullName = name + (apellidos ? ' ' + apellidos : '');
                    if (nameEl) nameEl.textContent = fullName;
                    const newInitials = fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                    // Actualizar avatar y foto de perfil con la guardada en BD
                    if (avatarEl) {
                        if (data.user && data.user.foto) {
                            avatarEl.innerHTML = '<img src="' + data.user.foto.replace(/"/g, '&quot;') + '" alt="avatar">';
                        } else if (!sessionStorage.getItem('adminPhoto')) {
                            avatarEl.textContent = newInitials;
                        }
                    }
                    if (profilePhotoImg && data.user && data.user.foto) {
                        profilePhotoImg.src = data.user.foto;
                        profilePhotoImg.style.display = 'block';
                        if (photoCameraIcon) photoCameraIcon.style.display = 'none';
                    }
                    if (breadcrumbEl) breadcrumbEl.textContent = '› ' + fullName;
                    alert('Perfil guardado correctamente.');
                } else {
                    alert(data.error || 'Error al guardar perfil.');
                }
            } catch (err) {
                alert('Error de conexión.');
            }
        });
    }

    // Password strength meter
    const newPassInput = document.getElementById('newPass');
    const strengthBars = document.querySelectorAll('#passwordStrength .strength-bar');

    if (newPassInput) {
        newPassInput.addEventListener('input', () => {
            const val = newPassInput.value;
            let level = 0;
            if (val.length >= 6) level++;
            if (/[A-Z]/.test(val)) level++;
            if (/\d/.test(val)) level++;
            if (/[^A-Za-z0-9]/.test(val)) level++;

            strengthBars.forEach((bar, i) => {
                bar.className = 'strength-bar';
                if (i < level) bar.classList.add('level-' + level);
            });
        });
    }

    // Cambiar contraseña → PHP
    const changePassBtn = document.getElementById('changePassBtn');
    if (changePassBtn) {
        changePassBtn.addEventListener('click', async () => {
            const current = document.getElementById('currentPass').value;
            const next = newPassInput.value;

            if (!current || !next) {
                alert('Rellena ambos campos.');
                return;
            }
            if (next.length < 6) {
                alert('La nueva contraseña debe tener al menos 6 caracteres.');
                return;
            }

            try {
                const data = await apiPost(`${API}/usuario`, {
                    current_password: current,
                    new_password: next,
                });

                if (data.ok) {
                    alert('Contraseña cambiada correctamente.');
                    document.getElementById('currentPass').value = '';
                    newPassInput.value = '';
                    strengthBars.forEach(b => b.className = 'strength-bar');
                } else {
                    alert(data.error || 'Error al cambiar contraseña.');
                }
            } catch (err) {
                alert('Error de conexión.');
            }
        });
    }
    /* ======================================================
       NUEVA CITA MODAL
       ====================================================== */
    const nuevaCitaOverlay = document.getElementById('nuevaCitaOverlay');
    const btnNuevaCita = document.getElementById('btnNuevaCita');
    const nuevaCitaClose = document.getElementById('nuevaCitaClose');
    const nuevaCitaCancel = document.getElementById('nuevaCitaCancel');
    const nuevaCitaSave = document.getElementById('nuevaCitaSave');
    const nciFeedback = document.getElementById('nciFeedback');

    // Campos del modal
    const nciPacienteSearch = document.getElementById('nciPacienteSearch');
    const nciPacienteDropdown = document.getElementById('nciPacienteDropdown');
    const nciPacienteSelected = document.getElementById('nciPacienteSelected');
    const nciPacienteAvatar = document.getElementById('nciPacienteAvatar');
    const nciPacienteNombreDisplay = document.getElementById('nciPacienteNombreDisplay');
    const nciPacienteTelDisplay = document.getElementById('nciPacienteTelDisplay');
    const nciPacienteRemove = document.getElementById('nciPacienteRemove');
    const nciPacienteNombre = document.getElementById('nciPacienteNombre');
    const nciPacienteTelefono = document.getElementById('nciPacienteTelefono');
    const nciServicioInput = document.getElementById('nciServicio');
    const nciFecha = document.getElementById('nciFecha');
    const nciHora = document.getElementById('nciHora');
    const nciMensaje = document.getElementById('nciMensaje');

    function openNuevaCita(opts = {}) {
        if (!nuevaCitaOverlay) return;
        // Limpiar estado
        nciPacienteSearch.value = '';
        nciPacienteDropdown.classList.remove('open');
        nciPacienteDropdown.innerHTML = '';
        nciPacienteNombre.value = '';
        nciPacienteTelefono.value = '';
        nciPacienteSelected.style.display = 'none';
        nciPacienteSearch.style.display = '';
        document.querySelectorAll('.nci-service-btn').forEach(b => b.classList.remove('selected'));
        nciServicioInput.value = '';
        // Pre-rellenar fecha si se pasa
        nciFecha.value = opts.fecha || formatLocalDate(new Date());
        nciHora.value = opts.hora || '';
        nciMensaje.value = '';
        nciFeedback.textContent = '';
        nciFeedback.className = 'nci-feedback';
        nuevaCitaSave.disabled = false;

        // Pre-rellenar paciente si se pasa
        if (opts.nombre) {
            nciPacienteNombre.value = opts.nombre;
            nciPacienteTelefono.value = opts.telefono || '';
            _selectPatientChip(opts.nombre, opts.telefono || '');
        }

        nuevaCitaOverlay.classList.add('active');
        setTimeout(() => nciPacienteSearch.focus(), 150);
    }

    function closeNuevaCita() {
        if (nuevaCitaOverlay) nuevaCitaOverlay.classList.remove('active');
    }

    function _selectPatientChip(nombre, telefono) {
        const initials = nombre.split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2) || 'P';
        nciPacienteAvatar.textContent = initials;
        nciPacienteNombreDisplay.textContent = nombre;
        nciPacienteTelDisplay.textContent = telefono ? `📞 ${telefono}` : '';
        nciPacienteSelected.style.display = '';
        nciPacienteSearch.style.display = 'none';
        nciPacienteDropdown.classList.remove('open');
    }

    // Abrir desde botón de la barra del calendario
    if (btnNuevaCita) btnNuevaCita.addEventListener('click', () => openNuevaCita());

    // Cerrar modal
    if (nuevaCitaClose) nuevaCitaClose.addEventListener('click', closeNuevaCita);
    if (nuevaCitaCancel) nuevaCitaCancel.addEventListener('click', closeNuevaCita);
    if (nuevaCitaOverlay) {
        nuevaCitaOverlay.addEventListener('click', e => {
            if (e.target === nuevaCitaOverlay) closeNuevaCita();
        });
    }
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && nuevaCitaOverlay?.classList.contains('active')) closeNuevaCita();
    });

    // Quitar paciente seleccionado
    if (nciPacienteRemove) {
        nciPacienteRemove.addEventListener('click', () => {
            nciPacienteNombre.value = '';
            nciPacienteTelefono.value = '';
            nciPacienteSelected.style.display = 'none';
            nciPacienteSearch.style.display = '';
            nciPacienteSearch.value = '';
            nciPacienteSearch.focus();
        });
    }

    // Búsqueda de pacientes en tiempo real
    let nciSearchTimeout;
    if (nciPacienteSearch) {
        nciPacienteSearch.addEventListener('input', () => {
            clearTimeout(nciSearchTimeout);
            const q = nciPacienteSearch.value.trim();
            if (!q) {
                nciPacienteDropdown.classList.remove('open');
                return;
            }
            nciSearchTimeout = setTimeout(async () => {
                try {
                    const data = await apiGet(`${API}/pacientes?buscar=${encodeURIComponent(q)}`);
                    nciPacienteDropdown.innerHTML = '';
                    if (!data.ok || !data.pacientes || data.pacientes.length === 0) {
                        // Opción manual
                        nciPacienteDropdown.innerHTML = `
                            <div class="nci-dropdown-empty">No se encontró el paciente.<br>
                            <small>Se usará el nombre escrito directamente.</small></div>
                            <div class="nci-dropdown-item" id="nciUseManual">
                                <div class="nci-dropdown-avatar" style="background:linear-gradient(135deg,#6b7280,#4b5563);">✎</div>
                                <div class="nci-dropdown-info">
                                    <strong>Usar "${q}" como nombre</strong>
                                    <small>Paciente nuevo o sin ficha</small>
                                </div>
                            </div>`;
                        document.getElementById('nciUseManual')?.addEventListener('click', () => {
                            nciPacienteNombre.value = q;
                            nciPacienteTelefono.value = '';
                            _selectPatientChip(q, '');
                        });
                    } else {
                        data.pacientes.slice(0, 8).forEach(p => {
                            const fullName = `${p.nombre || ''} ${p.apellidos || ''}`.trim();
                            const initials = fullName.split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2) || 'P';
                            const item = document.createElement('div');
                            item.className = 'nci-dropdown-item';
                            item.innerHTML = `
                                <div class="nci-dropdown-avatar">${initials}</div>
                                <div class="nci-dropdown-info">
                                    <strong>${fullName}</strong>
                                    <small>${p.telefono || 'Sin teléfono'}</small>
                                </div>`;
                            item.addEventListener('click', () => {
                                nciPacienteNombre.value = fullName;
                                nciPacienteTelefono.value = p.telefono || '';
                                _selectPatientChip(fullName, p.telefono || '');
                            });
                            nciPacienteDropdown.appendChild(item);
                        });
                    }
                    nciPacienteDropdown.classList.add('open');
                } catch (err) {
                    console.error('Error buscando pacientes:', err);
                }
            }, 350);
        });

        // Cerrar dropdown al hacer click fuera
        document.addEventListener('click', e => {
            if (nciPacienteDropdown && !nciPacienteDropdown.contains(e.target) && e.target !== nciPacienteSearch) {
                nciPacienteDropdown.classList.remove('open');
            }
        });
    }

    // Selección de servicio
    document.querySelectorAll('.nci-service-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nci-service-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            nciServicioInput.value = btn.dataset.service;
        });
    });

    // Guardar cita
    if (nuevaCitaSave) {
        nuevaCitaSave.addEventListener('click', async () => {
            const nombre = nciPacienteNombre.value.trim() || nciPacienteSearch.value.trim();
            const telefono = nciPacienteTelefono.value.trim();
            const servicio = nciServicioInput.value.trim();
            const fecha = nciFecha.value.trim();
            const hora = nciHora.value.trim();
            const mensaje = nciMensaje.value.trim();

            // Validaciones
            const errors = [];
            if (!nombre) errors.push('El nombre del paciente es obligatorio.');
            if (!telefono) errors.push('El teléfono es obligatorio para crear la cita.');
            if (!servicio) errors.push('Selecciona un servicio.');
            if (!fecha) errors.push('La fecha es obligatoria.');
            if (!hora) errors.push('La hora es obligatoria.');

            if (errors.length) {
                nciFeedback.textContent = errors[0];
                nciFeedback.className = 'nci-feedback error';
                return;
            }

            nciFeedback.textContent = '';
            nciFeedback.className = 'nci-feedback';
            nuevaCitaSave.disabled = true;
            nuevaCitaSave.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando…';

            try {
                const res = await apiPost(`${API}/citas/crear`, {
                    paciente_nombre: nombre,
                    telefono,
                    servicio,
                    fecha,
                    hora,
                    mensaje,
                });

                if (res.ok) {
                    nciFeedback.textContent = '✅ Cita confirmada correctamente.';
                    nciFeedback.className = 'nci-feedback success';

                    // Sincronizar calendario: ir a la semana de la cita y refrescar
                    const [y, m, d] = fecha.split('-').map(Number);
                    calSelectedDate = new Date(y, m - 1, d);
                    syncMonthYearSelects();
                    renderCalendar();

                    // Si hay una ficha de paciente abierta para ese teléfono, refrescar sus citas
                    const fichaId = document.getElementById('fichaId')?.value;
                    const fTelEl = document.getElementById('fTelefono');
                    if (fichaId && fTelEl && fTelEl.value.trim() === telefono) {
                        loadFichaCitas(fichaId, telefono);
                    }

                    setTimeout(() => {
                        closeNuevaCita();
                        // Ir a la pestaña calendario para ver la cita creada
                        showView('calendario');
                        tabs.forEach(t => t.classList.toggle('active', t.dataset.target === 'calendario'));
                    }, 1200);
                } else {
                    nciFeedback.textContent = res.error || 'Error al crear la cita. Inténtalo de nuevo.';
                    nciFeedback.className = 'nci-feedback error';
                    nuevaCitaSave.disabled = false;
                    nuevaCitaSave.innerHTML = '<i class="fa-solid fa-calendar-check"></i> Confirmar Cita';
                }
            } catch (err) {
                console.error('Error creando cita:', err);
                nciFeedback.textContent = 'Error de conexión. Inténtalo de nuevo.';
                nciFeedback.className = 'nci-feedback error';
                nuevaCitaSave.disabled = false;
                nuevaCitaSave.innerHTML = '<i class="fa-solid fa-calendar-check"></i> Confirmar Cita';
            }
        });
    }

    // Exponer openNuevaCita globalmente para poder usarla desde la tabla de pacientes
    window.openNuevaCita = openNuevaCita;

    // Conectar botón "Asignar Cita" de la tabla de pacientes con el modal Nueva Cita
    if (pacientesBody) {
        pacientesBody.addEventListener('click', e => {
            const calBtn = e.target.closest('.js-table-cal');
            if (calBtn) {
                e.stopPropagation();
                const row = calBtn.closest('.paciente-row');
                if (!row) return;
                const id = row.getAttribute('data-id');
                const paciente = currentPacientes.find(p => p.id == id);
                if (paciente) {
                    const fullName = `${paciente.nombre || ''} ${paciente.apellidos || ''}`.trim();
                    openNuevaCita({ nombre: fullName, telefono: paciente.telefono || '' });
                }
            }
        });
    }

});

