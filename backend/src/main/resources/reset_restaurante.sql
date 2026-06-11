-- Reset operativo de Restaurante
-- Ejecutar manualmente contra la base restaurante_db cuando se quiera limpiar datos de prueba.
-- Preserva estructura. El backend crea los usuarios base con BCrypt al reiniciar.

BEGIN;

TRUNCATE TABLE pedido_detalles RESTART IDENTITY CASCADE;
TRUNCATE TABLE pedidos RESTART IDENTITY CASCADE;
TRUNCATE TABLE mesas RESTART IDENTITY CASCADE;
TRUNCATE TABLE plato_ingredientes RESTART IDENTITY CASCADE;
TRUNCATE TABLE platos RESTART IDENTITY CASCADE;
TRUNCATE TABLE ingredientes RESTART IDENTITY CASCADE;
TRUNCATE TABLE usuarios RESTART IDENTITY CASCADE;

COMMIT;
