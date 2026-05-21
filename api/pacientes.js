/* ============================================
   PACIENTES — Handler único para crear y listar
   ============================================ */
const { query } = require('../lib/db');
const { requireAuth } = require('../lib/auth');

module.exports = async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();

    // --- CREAR/ACTUALIZAR PACIENTE (admin, protegido) ---
    if (req.method === 'POST') {
        const user = requireAuth(req, res);
        if (!user) return;

        const { id, nombre, apellidos, telefono, email, fecha_nacimiento, notas,
            tipo_documento, documento, sexo, ocupacion, direccion_facturacion,
            direccion_adicional, codigo_postal, localidad, provincia, pais,
            exclusivo_profesionales, firmado_proteccion_datos,
            recibir_publicidad, recordatorios_automaticos } = req.body || {};

        if (!nombre?.trim()) {
            return res.status(400).json({ ok: false, error: 'El nombre es obligatorio.' });
        }

        try {
            const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
            const pNombreCompleto = (nombre.trim() + ' ' + (apellidos || '').trim()).trim();

            if (id) {
                // UPDATE
                await query(
                    `UPDATE pacientes SET 
                        nombre=?, apellidos=?, telefono=?, email=?, fecha_nacimiento=?, notas=?,
                        tipo_documento=?, documento=?, sexo=?, ocupacion=?, direccion_facturacion=?,
                        direccion_adicional=?, codigo_postal=?, localidad=?, provincia=?, pais=?,
                        exclusivo_profesionales=?, firmado_proteccion_datos=?,
                        recibir_publicidad=?, recordatorios_automaticos=?
                     WHERE id=?`,
                    [
                        nombre.trim(), (apellidos || '').trim(), (telefono || '').trim(), (email || '').trim(), fecha_nacimiento || null, notas || null,
                        tipo_documento || 'DNI/NIF/CIF/NIE', documento || '', sexo || '', ocupacion || '', direccion_facturacion || '',
                        direccion_adicional || '', codigo_postal || '', localidad || '', provincia || '', pais || '',
                        exclusivo_profesionales || '', firmado_proteccion_datos ? 1 : 0, recibir_publicidad ? 1 : 0, recordatorios_automaticos ? 1 : 0,
                        id
                    ]
                );

                // LOPD Audit Log
                await query(
                    `INSERT INTO registro_auditoria (usuario_id, usuario_nombre, paciente_id, paciente_nombre, accion, detalles, ip_address) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        user.id,
                        (user.nombre + ' ' + (user.apellidos || '')).trim(),
                        id,
                        pNombreCompleto,
                        'MODIFICAR_FICHA',
                        `Modificación de los datos de la ficha del paciente.`,
                        clientIp
                    ]
                );

                return res.status(200).json({
                    ok: true,
                    message: 'Paciente actualizado correctamente.',
                    id: id,
                });
            } else {
                // INSERT
                const result = await query(
                    `INSERT INTO pacientes (
                        nombre, apellidos, telefono, email, fecha_nacimiento, notas,
                        tipo_documento, documento, sexo, ocupacion, direccion_facturacion,
                        direccion_adicional, codigo_postal, localidad, provincia, pais,
                        exclusivo_profesionales, firmado_proteccion_datos,
                        recibir_publicidad, recordatorios_automaticos
                    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                    [
                        nombre.trim(), (apellidos || '').trim(), (telefono || '').trim(), (email || '').trim(), fecha_nacimiento || null, notas || null,
                        tipo_documento || 'DNI/NIF/CIF/NIE', documento || '', sexo || '', ocupacion || '', direccion_facturacion || '',
                        direccion_adicional || '', codigo_postal || '', localidad || '', provincia || '', pais || '',
                        exclusivo_profesionales || '', firmado_proteccion_datos ? 1 : 0, recibir_publicidad ? 1 : 0, recordatorios_automaticos ? 1 : 0
                    ]
                );

                // LOPD Audit Log
                await query(
                    `INSERT INTO registro_auditoria (usuario_id, usuario_nombre, paciente_id, paciente_nombre, accion, detalles, ip_address) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        user.id,
                        (user.nombre + ' ' + (user.apellidos || '')).trim(),
                        result.insertId,
                        pNombreCompleto,
                        'CREAR_PACIENTE',
                        `Creación de la ficha del paciente ${pNombreCompleto}.`,
                        clientIp
                    ]
                );

                return res.status(200).json({
                    ok: true,
                    message: 'Paciente creado correctamente.',
                    id: result.insertId,
                });
            }
        } catch (err) {
            console.error('Error guardando paciente:', err);
            return res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
        }
    }

    // --- LISTAR PACIENTES (admin, protegido) ---
    if (req.method === 'GET') {
        const user = requireAuth(req, res);
        if (!user) return;
        try {
            const buscar = (req.query?.buscar || '').trim();
            let pacientes;
            if (buscar) {
                const like = '%' + buscar + '%';
                pacientes = await query(
                    'SELECT * FROM pacientes WHERE nombre LIKE ? OR telefono LIKE ? OR email LIKE ? ORDER BY nombre ASC LIMIT 50',
                    [like, like, like]
                );
            } else {
                pacientes = await query('SELECT * FROM pacientes ORDER BY id DESC LIMIT 100');
            }

            // Formatear fecha
            pacientes.forEach(p => {
                if (p.ultima_visita) {
                    const d = new Date(p.ultima_visita);
                    p.ultima_visita_fmt = d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
                } else {
                    p.ultima_visita_fmt = '—';
                }
            });

            // LOPD Audit Log
            const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
            await query(
                `INSERT INTO registro_auditoria (usuario_id, usuario_nombre, accion, detalles, ip_address) 
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    user.id,
                    (user.nombre + ' ' + (user.apellidos || '')).trim(),
                    'VER_LISTADO',
                    `Visualización del listado de pacientes${buscar ? ' con filtro de búsqueda: "' + buscar + '"' : ''} (total: ${pacientes.length}).`,
                    clientIp
                ]
            );

            return res.status(200).json({ ok: true, pacientes });
        } catch (err) {
            console.error('Error listando pacientes:', err);
            return res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
        }
    }

    // --- DERECHO AL OLVIDO / ELIMINAR PACIENTE (admin, protegido) ---
    if (req.method === 'DELETE') {
        const user = requireAuth(req, res);
        if (!user) return;

        const id = req.query.id;
        if (!id) {
            return res.status(400).json({ ok: false, error: 'ID de paciente requerido.' });
        }

        try {
            // Obtener nombre del paciente antes de eliminarlo para registrar en la auditoría
            const rows = await query('SELECT nombre, apellidos FROM pacientes WHERE id = ? LIMIT 1', [id]);
            if (rows.length === 0) {
                return res.status(404).json({ ok: false, error: 'Paciente no encontrado.' });
            }
            const paciente = rows[0];
            const pNombreCompleto = (paciente.nombre + ' ' + (paciente.apellidos || '')).trim();

            // Eliminar citas relacionadas (cascada manual)
            await query('DELETE FROM citas WHERE paciente_nombre = ?', [pNombreCompleto]);

            // Eliminar paciente
            await query('DELETE FROM pacientes WHERE id = ?', [id]);

            // LOPD Audit Log
            const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
            await query(
                `INSERT INTO registro_auditoria (usuario_id, usuario_nombre, paciente_id, paciente_nombre, accion, detalles, ip_address) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    user.id,
                    (user.nombre + ' ' + (user.apellidos || '')).trim(),
                    id,
                    pNombreCompleto,
                    'ELIMINAR_PACIENTE',
                    `Ejercicio del Derecho al Olvido (RGPD). Eliminación permanente y completa de la ficha del paciente y citas asociadas.`,
                    clientIp
                ]
            );

            return res.status(200).json({
                ok: true,
                message: 'Paciente y citas asociadas eliminados permanentemente (Derecho al Olvido aplicado).'
            });
        } catch (err) {
            console.error('Error eliminando paciente:', err);
            return res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
        }
    }

    // --- MÉTODO NO PERMITIDO ---
    return res.status(405).json({ ok: false, error: 'Método no permitido.' });
};
