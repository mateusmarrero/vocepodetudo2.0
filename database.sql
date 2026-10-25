-- ==============================================================
-- Banco de Dados: Você Pode Tudo (VCPDTD)
-- Compatível com MySQL 5.7+, MySQL 8.0+ e MariaDB (ServerByte / cPanel)
-- ==============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Tabela de Administradores
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Inserção do Usuário Administrador Padrão
-- Senha inicial: admin123 (Criptografada com BCRYPT nativo)
INSERT IGNORE INTO `admin_users` (`id`, `username`, `password_hash`) 
VALUES (1, 'admin', '$2y$10$wS2aP.75.k0W0WjYp1kMzeVdknV/kYF4v2wJvS/H24r7H9d5y4BTe');

-- 3. Tabela de Cursos Oficiais
CREATE TABLE IF NOT EXISTS `courses` (
  `id` VARCHAR(64) PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `provider` VARCHAR(100) NOT NULL,
  `provider_tag` VARCHAR(50) NULL,
  `provider_color` VARCHAR(100) NULL,
  `category` VARCHAR(50) NOT NULL,
  `description` TEXT NULL,
  `url` VARCHAR(500) NOT NULL,
  `workload_hours` INT NOT NULL DEFAULT 10,
  `has_free_certificate` TINYINT(1) NOT NULL DEFAULT 1,
  `certificate_note` VARCHAR(150) NULL,
  `level` VARCHAR(50) DEFAULT 'Iniciante',
  `tags` TEXT NULL,
  `featured` TINYINT(1) DEFAULT 0,
  `rating` DECIMAL(2,1) DEFAULT 5.0,
  `reviews_count` INT DEFAULT 1,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_category` (`category`),
  INDEX `idx_provider` (`provider`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_featured` (`featured`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
