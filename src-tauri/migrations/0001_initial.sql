-- 1. Usuarios
CREATE TABLE user(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(60) NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    is_admin INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Proveedores (creado antes de product)
CREATE TABLE provider(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    phone1 VARCHAR(50),
    phone2 VARCHAR(50),
    email1 VARCHAR(50),
    email2 VARCHAR(50),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Categorías
CREATE TABLE category(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image VARCHAR(255),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Productos
-- CREATE TABLE product(
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     image VARCHAR(255),
--     barcode VARCHAR(50) UNIQUE,
--     name VARCHAR(100) NOT NULL,
--     description TEXT,
--     stock_min INTEGER NOT NULL DEFAULT 10,
--     expiration_date TEXT,
--     price_in INTEGER NOT NULL DEFAULT 0,
--     price_shop INTEGER NOT NULL DEFAULT 0,
--     unit VARCHAR(50),
--     presentation VARCHAR(50),
--     provider_id INTEGER,
--     category_id INTEGER,
--     created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     is_active INTEGER NOT NULL DEFAULT 1,
--     FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE SET NULL,
--     FOREIGN KEY (provider_id) REFERENCES provider(id) ON DELETE SET NULL
-- );

CREATE TABLE product(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image VARCHAR(255),
    barcode VARCHAR(50) UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    unit VARCHAR(50),
    presentation VARCHAR(50),
    stock_min INTEGER NOT NULL DEFAULT 10,
    price_in INTEGER NOT NULL DEFAULT 0,
    price_shop INTEGER NOT NULL DEFAULT 0,
    provider_id INTEGER,
    category_id INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE SET NULL,
    FOREIGN KEY (provider_id) REFERENCES provider(id) ON DELETE SET NULL
);

CREATE TABLE lot(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    lot_num VARCHAR(50) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 10,
    expiration_date TEXT,
    date_entry TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE SET NULL
);

-- 5. Tipos de operación
CREATE TABLE operation_type(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO operation_type (name) VALUES ('entrada'), ('salida'), ('ajuste');

-- 6. Ventas
CREATE TABLE sell(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total INTEGER NOT NULL DEFAULT 0,
    cash INTEGER NOT NULL DEFAULT 0,
    change INTEGER NOT NULL DEFAULT 0,       -- Cambio / Vuelto
    discount INTEGER NOT NULL DEFAULT 0,     -- Descuento aplicado
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id)
);

-- 7. Operaciones / Movimientos
CREATE TABLE operation(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    q INTEGER NOT NULL,                         -- Cantidad
    price INTEGER NOT NULL DEFAULT 0,        -- Precio histórico de la operación
    operation_type_id INTEGER NOT NULL,
    sell_id INTEGER,                         -- NULL si es ajuste o entrada manual
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES product(id),
    FOREIGN KEY (operation_type_id) REFERENCES operation_type(id),
    FOREIGN KEY (sell_id) REFERENCES sell(id) ON DELETE CASCADE
);

-- Índices recomendados
CREATE INDEX idx_product_barcode ON product(barcode);
CREATE INDEX idx_operation_product ON operation(product_id);
CREATE INDEX idx_operation_sell ON operation(sell_id);
CREATE INDEX idx_sell_created_at ON sell(created_at);