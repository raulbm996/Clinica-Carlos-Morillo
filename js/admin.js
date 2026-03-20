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
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

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
                html += `<div class="cal-cell" data-hour="${h}" data-date="${d.toISOString().slice(0, 10)}"></div>`;
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
                    const horaNum = parseInt(cita.hora.split(':')[0], 10);
                    const cell = calGrid.querySelector(`.cal-cell[data-date="${cita.fecha}"][data-hour="${horaNum}"]`);
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

    async function loadPacientes(buscar = '') {
        if (!pacientesBody) return;
        pacientesBody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:#718096;">Cargando…</td></tr>';

        try {
            const url = buscar
                ? `${API}/pacientes/listar?buscar=${encodeURIComponent(buscar)}`
                : `${API}/pacientes/listar`;
            const data = await apiGet(url);

            if (data.ok && data.pacientes) {
                if (data.pacientes.length === 0) {
                    pacientesBody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:#718096;">No se encontraron pacientes.</td></tr>';
                    return;
                }

                let html = '';
                data.pacientes.forEach(p => {
                    html += `<tr>
                        <td data-label="ID"><span style="color:#718096;font-size:.8rem">#${String(p.id).padStart(5, '0')}</span></td>
                        <td data-label="Nombre"><strong>${p.nombre}</strong><br><span style="font-size:.75rem;color:#718096">${p.email || '—'}</span></td>
                        <td data-label="Contacto">${p.telefono || '—'}</td>
                        <td data-label="Última Visita">${p.ultima_visita_fmt}</td>
                        <td data-label="Acciones">
                            <button class="action-btn" title="Ver Ficha"><i class="fa-regular fa-eye"></i></button>
                            <button class="action-btn" title="Editar"><i class="fa-solid fa-pen"></i></button>
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
        asistenteOverlay.classList.add('active');
        const nombreInput = document.getElementById('asiNombre');
        if (nombreInput) setTimeout(() => nombreInput.focus(), 150);
    }

    function closeAsistente() {
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
});
