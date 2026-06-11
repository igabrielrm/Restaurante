# Guia De Despliegue - Restaurante

## Objetivo

Esta guia resume los pasos recomendados para ejecutar **Restaurante** en entornos locales, staging o produccion.

## 1. Variables De Entorno

Backend:

| Variable | Ejemplo | Descripcion |
| --- | --- | --- |
| `DB_URL` | `jdbc:postgresql://localhost:5432/restaurante_db` | URL JDBC de PostgreSQL. |
| `DB_USERNAME` | `postgres` | Usuario de base de datos. |
| `DB_PASSWORD` | `root` | Contraseña de base de datos. |
| `SERVER_PORT` | `8085` | Puerto del backend. |
| `FRONTEND_ORIGIN` | `http://localhost:5173` | Origen permitido por CORS. |

Frontend:

| Variable | Ejemplo | Descripcion |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:8085/api` | URL base de la API REST. |
| `VITE_WS_URL` | `http://localhost:8085/ws-restaurante` | URL del endpoint WebSocket SockJS/STOMP. |

## 2. Base De Datos

Crear base local:

```sql
CREATE DATABASE restaurante_db;
```

El backend usa `spring.jpa.hibernate.ddl-auto=update`, por lo que puede crear o actualizar tablas durante el arranque. En produccion, se recomienda migrar a Flyway o Liquibase para versionar cambios de esquema.

## 3. Despliegue Local

Backend:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## 4. Build Productivo

Backend:

```powershell
cd backend
.\mvnw.cmd -DskipTests package
java -jar target/restaurante-0.0.1-SNAPSHOT.jar
```

Frontend:

```bash
cd frontend
npm install
npm run build
npm run preview
```

## 5. Recomendaciones Para Produccion

- Publicar backend detras de HTTPS.
- Configurar `FRONTEND_ORIGIN` con el dominio real del frontend.
- Cambiar contraseñas iniciales inmediatamente.
- Usar un usuario PostgreSQL con permisos limitados.
- Programar backups diarios.
- Activar monitoreo de CPU, memoria, logs y errores HTTP.
- Registrar auditoria de pagos si el negocio requiere trazabilidad legal.
- Usar un proxy inverso como Nginx, Caddy o Traefik.

## 6. Checklist Antes De Salir A Produccion

- Base de datos creada y respaldada.
- Variables de entorno configuradas.
- Claves iniciales cambiadas.
- CORS apuntando al dominio productivo.
- HTTPS activo.
- Frontend construido y servido desde hosting confiable.
- Backend ejecutando con perfil productivo.
- Prueba de login por rol completada.
- Prueba de pedido completo: mesa, comanda, cocina, pago e historial.
- Prueba de pago parcial completada.
- Prueba de cambio de contraseña completada.
