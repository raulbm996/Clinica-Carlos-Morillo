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
                        nombre.trim(), (apellidos||'').trim(), (telefono||'').trim(), (email||'').trim(), fecha_nacimiento || null, notas || null,
                        tipo_documento||'DNI/NIF/CIF/NIE', documento||'', sexo||'', ocupacion||'', direccion_facturacion||'',
                        direccion_adicional||'', codigo_postal||'', localidad||'', provincia||'', pais||'',
                        exclusivo_profesionales||'', firmado_proteccion_datos?1:0, recibir_publicidad?1:0, recordatorios_automaticos?1:0,
                        id
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
                        nombre.trim(), (apellidos||'').trim(), (telefono||'').trim(), (email||'').trim(), fecha_nacimiento || null, notas || null,
                        tipo_documento||'DNI/NIF/CIF/NIE', documento||'', sexo||'', ocupacion||'', direccion_facturacion||'',
                        direccion_adicional||'', codigo_postal||'', localidad||'', provincia||'', pais||'',
                        exclusivo_profesionales||'', firmado_proteccion_datos?1:0, recibir_publicidad?1:0, recordatorios_automaticos?1:0
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
            return res.status(200).json({ ok: true, pacientes });
        } catch (err) {
            console.error('Error listando pacientes:', err);
            return res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
        }
    }

    // --- MÉTODO NO PERMITIDO ---
    return res.status(405).json({ ok: false, error: 'Método no permitido.' });
};
