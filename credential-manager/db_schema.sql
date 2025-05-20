-- MySQL Database Schema

-- Database Creation
CREATE DATABASE IF NOT EXISTS credential_manager;
USE credential_manager;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    role ENUM('admin', 'manager', 'user') NOT NULL DEFAULT 'user',
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE INDEX idx_email (email),
    UNIQUE INDEX idx_username (username)
);

-- Clients Table
CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    notes TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_name (name)
);

-- Platform Categories Table
CREATE TABLE IF NOT EXISTS platform_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_name (name)
);

-- Platforms Table
CREATE TABLE IF NOT EXISTS platforms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category_id INT,
    website VARCHAR(255),
    description TEXT,
    logo_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES platform_categories(id),
    UNIQUE INDEX idx_name (name)
);

-- Credentials Table
CREATE TABLE IF NOT EXISTS credentials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    platform_id INT NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    username VARCHAR(255) NOT NULL,
    password TEXT NOT NULL, -- Encrypted
    url VARCHAR(255),
    notes TEXT,
    expiry_date DATE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_used DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (platform_id) REFERENCES platforms(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_client_platform (client_id, platform_id)
);

-- Additional Credential Fields Table
CREATE TABLE IF NOT EXISTS credential_fields (
    id INT AUTO_INCREMENT PRIMARY KEY,
    credential_id INT NOT NULL,
    field_name VARCHAR(50) NOT NULL,
    field_value TEXT NOT NULL, -- Encrypted
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (credential_id) REFERENCES credentials(id) ON DELETE CASCADE,
    INDEX idx_credential (credential_id)
);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action_type ENUM('create', 'read', 'update', 'delete', 'export', 'login', 'logout') NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- 'user', 'client', 'credential', etc.
    entity_id INT,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_action (user_id, action_type),
    INDEX idx_entity (entity_type, entity_id)
);

-- Export Logs Table
CREATE TABLE IF NOT EXISTS export_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    export_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    record_count INT NOT NULL,
    filters TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user (user_id)
);

-- Insert Default Data
INSERT INTO platform_categories (name, description) VALUES 
('Domain Registrar', 'Companies that manage domain name registration'),
('Web Hosting', 'Web hosting service providers'),
('CMS', 'Content Management Systems'),
('Cloud Services', 'Cloud computing service providers'),
('Email Services', 'Email hosting and marketing platforms'),
('Development', 'Development platforms and services'),
('Database', 'Database hosting and management services'),
('Security', 'Security and SSL certificate providers'),
('Analytics', 'Web analytics and tracking services'),
('Marketing', 'Digital marketing platforms');

-- Insert Common Platforms
INSERT INTO platforms (name, category_id, website, description) VALUES 
('GoDaddy', 1, 'https://www.godaddy.com', 'Domain registrar and web hosting company'),
('Namecheap', 1, 'https://www.namecheap.com', 'Domain name registrar and web hosting company'),
('HostGator', 2, 'https://www.hostgator.com', 'Web hosting provider'),
('WordPress', 3, 'https://wordpress.org', 'Content management system'),
('Azure', 4, 'https://azure.microsoft.com', 'Microsoft cloud computing service'),
('AWS', 4, 'https://aws.amazon.com', 'Amazon Web Services cloud platform'),
('Google Cloud', 4, 'https://cloud.google.com', 'Google Cloud Platform'),
('cPanel', 2, 'https://cpanel.net', 'Web hosting control panel'),
('Cloudflare', 8, 'https://www.cloudflare.com', 'CDN and security provider'),
('GitHub', 6, 'https://github.com', 'Code hosting platform');

-- Create an admin user (password: AdminSecurePass123)
INSERT INTO users (username, email, password, first_name, last_name, role) 
VALUES ('admin', 'admin@example.com', '$2b$10$Tm3z7vgpv5xQUdQrL9rPk.Cxcw8H7Xz9EkIL4JWljYwdDqMxCrSCC', 'Admin', 'User', 'admin');