-- Migración para añadir eliminación lógica (soft delete) a product y provider
ALTER TABLE product ADD COLUMN is_deleted INTEGER NOT NULL DEFAULT 0;
ALTER TABLE provider ADD COLUMN is_deleted INTEGER NOT NULL DEFAULT 0;
