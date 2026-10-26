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

-- 4. Tabela de Alunos Cadastrados
CREATE TABLE IF NOT EXISTS `students` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `avatar_color` VARCHAR(20) DEFAULT '#002776',
  `goal` VARCHAR(50) DEFAULT 'primeiro_emprego',
  `device_preference` VARCHAR(20) DEFAULT 'ambos',
  `weekly_hours` VARCHAR(20) DEFAULT '5-10h',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `last_login_at` TIMESTAMP NULL,
  INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Histórico de Testes Vocacionais dos Alunos
CREATE TABLE IF NOT EXISTS `student_career_tests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `primary_area` VARCHAR(50) NOT NULL,
  `secondary_area` VARCHAR(50) NULL,
  `scores_json` TEXT NOT NULL,
  `recommended_track` VARCHAR(50) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  INDEX `idx_student_test` (`student_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Cursos Acompanhados, Em Andamento e Certificados dos Alunos
CREATE TABLE IF NOT EXISTS `student_courses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `course_id` VARCHAR(64) NOT NULL,
  `status` ENUM('saved', 'in_progress', 'completed') DEFAULT 'saved',
  `workload_hours` INT DEFAULT 10,
  `started_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `completed_at` TIMESTAMP NULL,
  `certificate_url` VARCHAR(500) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_student_course` (`student_id`, `course_id`),
  INDEX `idx_student_status` (`student_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Tabela de Métricas & Controle de Acessos (Analytics)
CREATE TABLE IF NOT EXISTS `analytics_events` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_type` VARCHAR(50) NOT NULL, -- 'pageview_home', 'pageview_tracks', 'course_click'
  `course_id` VARCHAR(64) NULL,
  `course_title` VARCHAR(255) NULL,
  `course_provider` VARCHAR(100) NULL,
  `city` VARCHAR(100) NULL,
  `region` VARCHAR(10) NULL, -- UF (ex: SP, RJ, MG)
  `country` VARCHAR(50) DEFAULT 'Brasil',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_event_type` (`event_type`),
  INDEX `idx_region` (`region`),
  INDEX `idx_country` (`country`),
  INDEX `idx_course_id` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
