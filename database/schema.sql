-- ============================================
-- CLÍNICA CARLOS MORILLO — Database Schema
-- Ejecutar en phpMyAdmin o MySQL CLI
-- ============================================

CREATE DATABASE IF NOT EXISTS clinica_carlos_morillo
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE clinica_carlos_morillo;

-- ---- Usuarios (profesionales de la clínica) ----
CREATE TABLE IF NOT EXISTS usuarios (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(50)  NOT NULL UNIQUE,
  nombre      VARCHAR(100) NOT NULL,
  apellidos   VARCHAR(150) NOT NULL DEFAULT '',
  email       VARCHAR(200) NOT NULL DEFAULT '',
  password    VARCHAR(255) NOT NULL,
  rol         VARCHAR(80)  NOT NULL DEFAULT 'Fisioterapeuta',
  foto        LONGTEXT     DEFAULT NULL,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---- Pacientes ----
CREATE TABLE IF NOT EXISTS pacientes (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(200) NOT NULL,
  apellidos       VARCHAR(150) NOT NULL DEFAULT '',
  telefono        VARCHAR(30)  NOT NULL DEFAULT '',
  email           VARCHAR(200) NOT NULL DEFAULT '',
  fecha_nacimiento DATE        DEFAULT NULL,
  notas           TEXT         DEFAULT NULL,
  ultima_visita   DATE         DEFAULT NULL,
  tipo_documento  VARCHAR(20)  DEFAULT 'DNI/NIF/CIF/NIE',
  documento       VARCHAR(50)  DEFAULT '',
  sexo            VARCHAR(20)  DEFAULT '',
  ocupacion       VARCHAR(150) DEFAULT '',
  direccion_facturacion VARCHAR(255) DEFAULT '',
  direccion_adicional   VARCHAR(255) DEFAULT '',
  codigo_postal   VARCHAR(20)  DEFAULT '',
  localidad       VARCHAR(100) DEFAULT '',
  provincia       VARCHAR(50)  DEFAULT '',
  pais            VARCHAR(50)  DEFAULT '',
  exclusivo_profesionales TEXT DEFAULT NULL,
  firmado_proteccion_datos BOOLEAN DEFAULT FALSE,
  recibir_publicidad BOOLEAN DEFAULT FALSE,
  recordatorios_automaticos BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---- Citas ----
CREATE TABLE IF NOT EXISTS citas (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  paciente_nombre VARCHAR(200) NOT NULL,
  telefono        VARCHAR(30)  NOT NULL DEFAULT '',
  servicio        VARCHAR(100) NOT NULL DEFAULT '',
  fecha           DATE         NOT NULL,
  hora            VARCHAR(10)  NOT NULL,
  mensaje         TEXT         DEFAULT NULL,
  estado          ENUM('pendiente','confirmada','cancelada') NOT NULL DEFAULT 'pendiente',
  usuario_id      INT          DEFAULT NULL,
  created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---- Mensajes de Contacto ----
CREATE TABLE IF NOT EXISTS mensajes_contacto (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(200) NOT NULL,
  email       VARCHAR(200) NOT NULL DEFAULT '',
  telefono    VARCHAR(30)  NOT NULL DEFAULT '',
  mensaje     TEXT         NOT NULL,
  leido       TINYINT(1)   NOT NULL DEFAULT 0,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---- Registro de Auditoría (Trazabilidad LOPD) ----
CREATE TABLE IF NOT EXISTS registro_auditoria (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id      INT NOT NULL,
  usuario_nombre  VARCHAR(150) NOT NULL,
  paciente_id     INT DEFAULT NULL,
  paciente_nombre VARCHAR(200) DEFAULT NULL,
  accion          VARCHAR(100) NOT NULL,
  detalles        TEXT DEFAULT NULL,
  ip_address      VARCHAR(45) DEFAULT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

