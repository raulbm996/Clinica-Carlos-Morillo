-- ============================================
-- CLÍNICA CARLOS MORILLO — Datos iniciales
-- Ejecutar DESPUÉS de schema.sql
-- ============================================
-- Contraseña por defecto para todos: CarlosCM2026!
-- Hash bcrypt generado con password_hash('CarlosCM2026!', PASSWORD_BCRYPT)

USE clinica_carlos_morillo;

-- ---- Usuarios del equipo ----
INSERT INTO usuarios (username, nombre, apellidos, email, password, rol) VALUES
('carlos',     'Carlos',    'Morillo',          'carlos@clinicacarlosmorillo.com',     '$2y$10$8KzQxH1wvG0GqJ6YR5V3xuKJq2lF0X3rN5yMpT7vL1wU9cB4mDfOe', 'Director / Fisioterapeuta'),
('javi',       'Javi',      'Lerate',           'javi@clinicacarlosmorillo.com',       '$2y$10$8KzQxH1wvG0GqJ6YR5V3xuKJq2lF0X3rN5yMpT7vL1wU9cB4mDfOe', 'Fisioterapeuta'),
('andrea',     'Andrea',    'Galvarro',         'andrea@clinicacarlosmorillo.com',     '$2y$10$8KzQxH1wvG0GqJ6YR5V3xuKJq2lF0X3rN5yMpT7vL1wU9cB4mDfOe', 'Psicóloga'),
('maite',      'Maite',     'Lozano',           'maite@clinicacarlosmorillo.com',      '$2y$10$8KzQxH1wvG0GqJ6YR5V3xuKJq2lF0X3rN5yMpT7vL1wU9cB4mDfOe', 'Fisioterapeuta'),
('alejandro',  'Alejandro', 'Ríos',             'alejandro@clinicacarlosmorillo.com',  '$2y$10$8KzQxH1wvG0GqJ6YR5V3xuKJq2lF0X3rN5yMpT7vL1wU9cB4mDfOe', 'Fisioterapeuta'),
('codemetria', 'Codemetria','',                 'admin@clinicacarlosmorillo.com',      '$2y$10$8KzQxH1wvG0GqJ6YR5V3xuKJq2lF0X3rN5yMpT7vL1wU9cB4mDfOe', 'Administrador');

-- ---- Pacientes de ejemplo ----
INSERT INTO pacientes (nombre, telefono, email, ultima_visita) VALUES
('Carlos López Fernández',  '600 111 222', 'clopez@mail.com',      '2026-03-10'),
('Elena Navarro Ruiz',      '600 222 333', 'elena.nr@mail.com',    '2026-03-12'),
('Marcos Jiménez',          '600 333 444', 'mjimenez88@mail.com',  '2026-03-15'),
('Lucía Ortega',            '600 444 555', 'lu.ortega@mail.com',   '2026-03-16');

-- ---- Citas de ejemplo ----
INSERT INTO citas (paciente_nombre, telefono, servicio, fecha, hora, mensaje, estado) VALUES
('Carlos López Fernández',  '600 111 222', 'fisioterapia',  CURDATE(), '10:00', 'Dolor lumbar crónico',       'confirmada'),
('Elena Navarro Ruiz',      '600 222 333', 'osteopatia',    CURDATE(), '11:30', 'Revisión mensual',           'confirmada'),
('Marcos Jiménez',          '600 333 444', 'psicologia',    CURDATE(), '16:00', 'Primera consulta',           'pendiente'),
('Lucía Ortega',            '600 444 555', 'nutricion',     CURDATE(), '18:00', 'Plan alimenticio deportivo', 'pendiente');
