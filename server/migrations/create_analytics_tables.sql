-- Create table for tracking PDF views by category
CREATE TABLE IF NOT EXISTS tbl_pdf_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    category_id INT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    view_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_id INT,
    INDEX idx_category_date (category_id, view_date),
    INDEX idx_book_date (book_id, view_date),
    INDEX idx_ip_date (ip_address, view_date),
    FOREIGN KEY (book_id) REFERENCES tbl_buku(id_buku) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES tbl_kategori(id_kategori) ON DELETE CASCADE
);

-- Create table for tracking unique site visitors
CREATE TABLE IF NOT EXISTS tbl_site_visitors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL UNIQUE,
    first_visit TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_visit TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    visit_count INT DEFAULT 1 NOT NULL,
    user_agent TEXT,
    INDEX idx_ip (ip_address),
    INDEX idx_last_visit (last_visit)
);