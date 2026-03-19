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
  telefono        VARCHAR(30)  NOT NULL DEFAULT '',
  email           VARCHAR(200) NOT NULL DEFAULT '',
  fecha_nacimiento DATE        DEFAULT NULL,
  notas           TEXT         DEFAULT NULL,
  ultima_visita   DATE         DEFAULT NULL,
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
