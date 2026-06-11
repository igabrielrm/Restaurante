# Restaurante

![Java](https://img.shields.io/badge/Java-17%2B-007396?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3%2B-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-Vite%20%2B%20TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=111111)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Security](https://img.shields.io/badge/Security-BCrypt%20%2B%20Sessions%20%2B%20CSRF-222222?style=for-the-badge)

**Restaurante - Plataforma Integral de Gestion Gastronomica en Tiempo Real** es un sistema full-stack para administrar la operacion diaria de un restaurante, bar o negocio gastronomico con una experiencia mobile-first, segura y preparada para despliegues productivos.

El sistema integra gestion de mesas, toma de comandas, cocina en tiempo real, caja flexible, pagos por separado, control de inventario y dashboard administrativo en una arquitectura desacoplada: **Backend API REST + WebSockets** y **Frontend SPA responsivo**.

## Valor Del Software

- **Meseros mobile-first:** apertura rapida de mesas, comandas tactiles, notas para cocina, modificacion de cantidades y seguimiento de pedidos desde telefono o tablet.
- **Cocina en tiempo real:** tablero Kanban de comandas con WebSockets/STOMP para recibir pedidos y avanzar estados sin refrescar pantalla.
- **Caja flexible:** cierre total de cuenta, IVA dinamico y pago separado por cantidades especificas de cada producto.
- **Administrador operativo:** reportes de ventas, platos mas vendidos, horas pico e inventario con CRUD de ingredientes.
- **Seguridad integrada:** contraseñas BCrypt, sesion HTTP segura, CSRF, CORS restringido, validaciones Jakarta y manejo global de excepciones.

## Arquitectura Y Stack Tecnologico

```text
Restaurante
├── backend   Spring Boot API REST + WebSockets + PostgreSQL
└── frontend  React SPA + Vite + TypeScript + Tailwind CSS
```

### Backend

- Java 17+
- Spring Boot 3.3+
- Spring Web
- Spring Security
- Spring Data JPA / Hibernate
- Jakarta Bean Validation
- WebSockets STOMP / SockJS
- PostgreSQL
- Maven Wrapper

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- Axios
- STOMP Client + SockJS
- Recharts
- Lucide React

### Base De Datos

- PostgreSQL
- Modelo relacional con usuarios, mesas, ingredientes, platos, recetas, pedidos y detalles de pedido.
- Indices definidos en entidades JPA para busquedas por estado, fecha, mesa, rol, stock y nombres.

## Requisitos

- Java 17 o superior
- Node.js 20 o superior
- PostgreSQL 15 o superior
- Git
- PowerShell, CMD, Git Bash o terminal equivalente

## Instalacion Local

### 1. Clonar El Repositorio

```bash
git clone https://github.com/igabrielrm/Restaurante.git
cd Restaurante
```

### 2. Crear La Base De Datos

En PostgreSQL:

```sql
CREATE DATABASE restaurante_db;
```

El backend usa por defecto:

```properties
DB_URL=jdbc:postgresql://localhost:5432/restaurante_db
DB_USERNAME=postgres
DB_PASSWORD=root
SERVER_PORT=8085
FRONTEND_ORIGIN=http://localhost:5173
```

Puedes mantener esos valores locales o sobrescribirlos con variables de entorno.

Frontend:

```properties
VITE_API_BASE_URL=http://localhost:8085/api
VITE_WS_URL=http://localhost:8085/ws-restaurante
```

### 3. Levantar El Backend

En Windows PowerShell:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

En Git Bash, Linux o macOS:

```bash
cd backend
./mvnw spring-boot:run
```

El backend quedara disponible en:

```text
http://localhost:8085
```

### 4. Levantar El Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Abrir:

```text
http://localhost:5173
```

## Usuarios Base

Al iniciar el backend, `DataBootstrap` crea automaticamente estos usuarios si no existen. Todas las claves se guardan con BCrypt.

| Rol | Usuario | Clave |
| --- | --- | --- |
| Administrador | `admin` | `admin123` |
| Mesero | `mesero` | `mesero123` |
| Cajero | `cajero` | `cajero123` |
| Cocina | `cocina` | `cocina123` |

> En produccion, cambia estas claves inmediatamente desde **Mi Cuenta**.

## Scripts Operativos

Limpiar datos transaccionales y permitir que el backend regenere usuarios base:

```powershell
psql -U postgres -d restaurante_db -f backend/src/main/resources/reset_restaurante.sql
```

Si `psql` no esta en el PATH, abre pgAdmin, selecciona `restaurante_db`, usa Query Tool y ejecuta el contenido del archivo.

## Seguridad

- Autenticacion por sesion HTTP con `JSESSIONID`.
- Cookies `HttpOnly` y `SameSite=Lax`.
- Proteccion CSRF para operaciones `POST`, `PUT` y `DELETE`.
- Password hashing con BCrypt.
- CORS restringido a `FRONTEND_ORIGIN`.
- Control de acceso por roles:
  - `ADMIN`: reportes, inventario y administracion.
  - `CAJERO` y `ADMIN`: caja, historial y pagos.
  - `MESERO` y `ADMIN`: mesas y comandas.
  - `COCINERO` y `ADMIN`: tablero de cocina y estados.
- Validacion de datos con Jakarta Validation.
- Respuestas de error estructuradas sin stack traces.

## WebSockets

- Endpoint SockJS/STOMP: `http://localhost:8085/ws-restaurante`
- Comandas cocina: `/topic/comandas`
- Alertas de stock: `/topic/alertas-stock`
- Pedidos listos para meseros: `/topic/pedidos-listos`

## Documentacion

- [Manual Tecnico](docs/MANUAL_TECNICO.md)
- [Manual de Usuario](docs/MANUAL_USUARIO.md)
- [Guia de Despliegue](docs/GUIA_DESPLIEGUE.md)
- [Checklist de QA y Seguridad](docs/QA_SEGURIDAD.md)

## Estado Del Proyecto

El sistema queda preparado como MVP funcional y documentado para publicacion en GitHub. Antes de operar en produccion real se recomienda configurar backups, monitoreo, dominio, HTTPS, variables de entorno productivas y rotacion de claves iniciales.
