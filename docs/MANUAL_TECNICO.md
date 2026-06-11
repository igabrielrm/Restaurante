# Manual Tecnico - Restaurante

## 1. Proposito Del Documento

Este manual describe la arquitectura interna de **Restaurante**, sus componentes principales, modelo de datos, seguridad, API REST y canales WebSocket. Esta orientado a desarrolladores, administradores de sistemas y responsables tecnicos que deban mantener, desplegar o extender la plataforma.

## 2. Arquitectura General

Restaurante usa una arquitectura desacoplada:

```text
Cliente Web / Tablet / Movil
        |
        | HTTP + JSON / Cookie de sesion / CSRF
        v
Frontend React + Vite + TypeScript
        |
        | REST API + WebSockets STOMP
        v
Backend Spring Boot 3.3+
        |
        | JPA / Hibernate
        v
PostgreSQL
```

### Componentes Del Backend

- `config`: CORS, seguridad, WebSockets y datos base.
- `controllers`: entrada REST, validacion y contrato HTTP.
- `services`: reglas de negocio, pagos, inventario, estadisticas y autenticacion.
- `repositories`: acceso a datos mediante Spring Data JPA.
- `entities`: modelo persistente JPA.
- `dto`: objetos de entrada y salida de la API.

### Componentes Del Frontend

- `views`: pantallas por rol (`Mesero`, `Cocinero`, `Cajero`, `Admin`, `Login`).
- `components`: layout general y modal de cuenta.
- `state`: contexto de autenticacion.
- `api.ts`: cliente Axios, CSRF, llamadas REST y conexion STOMP.
- `utils/security.ts`: sanitizacion basica y normalizacion de mensajes de error.

## 3. Modelo De Datos

La base de datos principal es PostgreSQL. Por defecto se usa `restaurante_db`.

### `usuarios`

Almacena las credenciales y rol operativo del personal.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `id` | BIGSERIAL | Llave primaria. |
| `username` | VARCHAR(80) | Usuario unico de acceso. |
| `password` | VARCHAR | Hash BCrypt de la clave. |
| `rol` | VARCHAR(20) | `ADMIN`, `MESERO`, `COCINERO`, `CAJERO`. |

Indices:

- `idx_usuarios_username` unico.
- `idx_usuarios_rol`.

### `mesas`

Representa una cuenta operativa o mesa abierta en el restaurante.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `id` | BIGSERIAL | Llave primaria. |
| `identificador_dinamico` | VARCHAR(60) | Nombre visible, por ejemplo `Mesa #1`. |
| `descripcion` | VARCHAR(200) | Referencia opcional del cliente o mesa. |
| `activa` | BOOLEAN | Indica si sigue abierta. |

Relaciones:

- Una mesa puede tener muchos `pedidos`.

### `ingredientes`

Controla inventario base para recetas.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `id` | BIGSERIAL | Llave primaria. |
| `nombre` | VARCHAR(120) | Nombre unico del ingrediente. |
| `stock` | NUMERIC(12,2) | Stock disponible. |
| `stock_minimo` | NUMERIC(12,2) | Umbral de alerta. |

Uso:

- Cuando un pedido cambia a `LISTO`, el servicio descuenta ingredientes segun receta.
- Si el stock cae por debajo del minimo, se emite alerta WebSocket.

### `platos`

Equivale al catalogo de productos vendibles del restaurante.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `id` | BIGSERIAL | Llave primaria. |
| `nombre` | VARCHAR(140) | Nombre del plato/producto. |
| `descripcion` | VARCHAR(500) | Descripcion comercial. |
| `precio` | NUMERIC(12,2) | Precio unitario sin IVA. |
| `imagen_url` | TEXT | URL o Base64 de imagen. |
| `activo` | BOOLEAN | Indica si se ofrece en menu. |

Relaciones:

- Un plato tiene muchas relaciones en `plato_ingredientes`.
- Un plato puede aparecer en muchos `pedido_detalles`.

### `plato_ingredientes`

Tabla intermedia de recetas.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `plato_id` | BIGINT | FK a `platos.id`. |
| `ingrediente_id` | BIGINT | FK a `ingredientes.id`. |
| `cantidad_requerida` | NUMERIC(12,2) | Cantidad usada por unidad de plato. |

Llave primaria:

- Compuesta: `plato_id` + `ingrediente_id`.

### `pedidos`

Encabezado de comanda, cuenta o venta.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `id` | BIGSERIAL | Llave primaria. |
| `mesa_id` | BIGINT | FK a `mesas.id`. |
| `estado` | VARCHAR(30) | `PENDIENTE`, `EN_PREPARACION`, `LISTO`, `PAGADO`. |
| `tipo_pago` | VARCHAR(30) | `EFECTIVO`, `TRANSFERENCIA`, `TARJETA` o `NULL`. |
| `total` | NUMERIC(12,2) | Total acumulado del pedido. |
| `fecha_creacion` | TIMESTAMP | Fecha y hora de creacion. |

Uso:

- Los pedidos activos alimentan la cocina.
- Los pedidos pagados alimentan historial y estadisticas.
- En pago parcial, el sistema crea un pedido pagado con los items cobrados y reduce el pedido pendiente.

### `pedido_detalles`

Detalle de productos dentro de un pedido.

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `id` | BIGSERIAL | Llave primaria. |
| `pedido_id` | BIGINT | FK a `pedidos.id`. |
| `plato_id` | BIGINT | FK a `platos.id`. |
| `cantidad` | INTEGER | Cantidad solicitada. |
| `notas_chef` | TEXT | Indicaciones para cocina. |
| `precio_unitario` | NUMERIC(12,2) | Precio congelado al momento de pedir. |

### `facturas`

El MVP no define una tabla independiente `facturas`. La factura o ticket operativo se representa mediante registros `pedidos` con estado `PAGADO`, `tipo_pago`, `total` y sus `pedido_detalles`. Si se requiere integracion fiscal, se recomienda crear una tabla `facturas` vinculada a `pedidos`.

## 4. Arquitectura De Seguridad

### Autenticacion

1. El frontend envia `POST /api/auth/login` con `username` y `password`.
2. Spring Security valida el usuario usando `UserDetailsService`.
3. La contraseña se compara con `BCryptPasswordEncoder.matches`.
4. Si la autenticacion es correcta, el backend crea una sesion HTTP.
5. El navegador conserva la cookie `JSESSIONID`.
6. Las siguientes peticiones usan `withCredentials: true`.

### BCrypt

- El bean `PasswordEncoder` usa `BCryptPasswordEncoder(12)`.
- `DataBootstrap` crea usuarios base con claves hasheadas.
- `AuthService` migra claves antiguas en texto plano al iniciar si detecta que no empiezan con prefijo BCrypt.
- El cambio de contraseña re-hashea la nueva clave antes de persistir.

### CSRF

- Spring Security expone token CSRF mediante `GET /api/auth/csrf`.
- El frontend solicita el token antes de `POST`, `PUT` o `DELETE`.
- El token se envia en el header `X-XSRF-TOKEN`.
- Login, logout y WebSocket quedan excluidos para no bloquear el arranque de sesion.

### Control De Acceso Por Rol

| Recurso | Roles |
| --- | --- |
| `/api/auth/login` | Publico |
| `/api/auth/csrf` | Publico |
| `/api/usuarios/cambiar-password` | Autenticado |
| `/api/ingredientes/**` | `ADMIN` |
| `/api/estadisticas/**` | `ADMIN` |
| `/api/platos/admin`, crear, editar, eliminar platos | `ADMIN` |
| `/api/pedidos/historial` | `CAJERO`, `ADMIN` |
| `/api/pedidos/mesa/{id}/pagar` | `CAJERO`, `ADMIN` |
| `/api/pedidos/mesa/{id}/pagar-parcial` | `CAJERO`, `ADMIN` |
| `/api/pedidos/{id}/estado` | `COCINERO`, `ADMIN` |
| `/api/pedidos/comandas` | `COCINERO`, `ADMIN` |
| `/api/pedidos` | `MESERO`, `ADMIN` |
| `/api/mesas/**` | `MESERO`, `CAJERO`, `ADMIN` |

### CORS

La URL permitida se configura con:

```properties
app.cors.allowed-origin=${FRONTEND_ORIGIN:http://localhost:5173}
```

No se usa `*`. En produccion debe configurarse el dominio real del frontend.

## 5. Manejo Global De Excepciones

`ApiExceptionHandler` transforma errores en JSON estructurado:

```json
{
  "timestamp": "2026-06-11T06:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Mensaje legible para el usuario"
}
```

Se controlan:

- `IllegalArgumentException`
- `MethodArgumentNotValidException`
- `AuthenticationException`
- `AccessDeniedException`
- `DataAccessException`
- errores inesperados

## 6. Catalogo De Endpoints REST

Base URL local:

```text
http://localhost:8085/api
```

### Autenticacion

| Metodo | URL | Descripcion |
| --- | --- | --- |
| `POST` | `/auth/login` | Inicia sesion y crea cookie de sesion. |
| `POST` | `/auth/logout` | Cierra sesion. |
| `GET` | `/auth/csrf` | Obtiene token CSRF. |

Entrada login:

```json
{
  "username": "mesero",
  "password": "mesero123"
}
```

Salida:

```json
{
  "id": 2,
  "username": "mesero",
  "rol": "MESERO"
}
```

### Usuarios

| Metodo | URL | Descripcion |
| --- | --- | --- |
| `PUT` | `/usuarios/cambiar-password` | Cambia clave del usuario autenticado. |

Entrada:

```json
{
  "passwordActual": "mesero123",
  "nuevaPassword": "nuevaClaveSegura123"
}
```

### Mesas

| Metodo | URL | Descripcion |
| --- | --- | --- |
| `GET` | `/mesas/activas` | Lista mesas abiertas. |
| `POST` | `/mesas` | Abre una nueva mesa. |
| `PUT` | `/mesas/{id}/cerrar` | Cierra una mesa. |

Entrada abrir mesa:

```json
{
  "descripcion": "Cliente con reserva"
}
```

### Platos / Productos

| Metodo | URL | Descripcion |
| --- | --- | --- |
| `GET` | `/platos` | Lista platos activos. |
| `GET` | `/platos/admin` | Lista todos los platos. |
| `POST` | `/platos` | Crea plato. |
| `PUT` | `/platos/{id}` | Actualiza plato. |
| `DELETE` | `/platos/{id}` | Desactiva plato. |

Entrada crear plato:

```json
{
  "nombre": "Hamburguesa artesanal",
  "descripcion": "Pan brioche, carne y queso",
  "precio": 8.5,
  "imagenUrl": "",
  "activo": true,
  "receta": [
    {
      "ingredienteId": 1,
      "cantidadRequerida": 1
    }
  ]
}
```

### Ingredientes

| Metodo | URL | Descripcion |
| --- | --- | --- |
| `GET` | `/ingredientes` | Lista ingredientes. |
| `GET` | `/ingredientes/stock-bajo` | Lista ingredientes bajo minimo. |
| `POST` | `/ingredientes` | Crea ingrediente. |
| `PUT` | `/ingredientes/{id}` | Actualiza ingrediente. |
| `DELETE` | `/ingredientes/{id}` | Elimina ingrediente si no esta en receta activa. |

Entrada:

```json
{
  "nombre": "Tomate",
  "stock": 25,
  "stockMinimo": 5
}
```

### Pedidos Y Comandas

| Metodo | URL | Descripcion |
| --- | --- | --- |
| `GET` | `/pedidos/comandas` | Lista pedidos activos para cocina. |
| `GET` | `/pedidos/historial` | Lista pedidos pagados. |
| `GET` | `/pedidos/mesa/{mesaId}` | Lista pedidos de una mesa. |
| `POST` | `/pedidos` | Crea comanda. |
| `PUT` | `/pedidos/{pedidoId}/estado` | Cambia estado. |
| `PUT` | `/pedidos/mesa/{mesaId}/pagar` | Paga cuenta completa. |
| `PUT` | `/pedidos/mesa/{mesaId}/pagar-parcial` | Paga cantidades especificas por item. |

Entrada crear pedido:

```json
{
  "mesaId": 1,
  "detalles": [
    {
      "platoId": 3,
      "cantidad": 2,
      "notasChef": "Sin cebolla"
    }
  ]
}
```

Cambiar estado:

```json
{
  "estado": "LISTO"
}
```

Pago total:

```json
{
  "tipoPago": "EFECTIVO",
  "aplicarIva": true
}
```

Pago parcial especial:

```json
{
  "tipoPago": "TARJETA",
  "aplicarIva": true,
  "items": [
    {
      "detalleId": 10,
      "cantidad": 1
    },
    {
      "detalleId": 11,
      "cantidad": 2
    }
  ]
}
```

Tambien acepta alias de entrada para integraciones:

```json
{
  "tipoPago": "TRANSFERENCIA",
  "aplicarIva": false,
  "items": [
    {
      "id_producto": 10,
      "cantidad_a_pagar": 1
    }
  ]
}
```

### Estadisticas

| Metodo | URL | Descripcion |
| --- | --- | --- |
| `GET` | `/estadisticas/top-platos` | Ranking de platos vendidos. |
| `GET` | `/estadisticas/ventas` | Ventas dia, semana y mes por tipo de pago. |
| `GET` | `/estadisticas/pedidos-por-hora` | Conteo de pedidos por hora. |
| `GET` | `/estadisticas/dashboard` | Resumen completo para dashboard. |

## 7. Flujo De WebSockets

### Configuracion

Endpoint:

```text
http://localhost:8085/ws-restaurante
```

Broker:

```text
/topic
```

Prefijo de aplicacion:

```text
/app
```

### Canales

| Canal | Emisor | Receptor | Uso |
| --- | --- | --- | --- |
| `/topic/comandas` | Backend | Cocina | Nuevos pedidos y cambios de estado. |
| `/topic/alertas-stock` | Backend | Cocina/Admin | Ingredientes bajo stock minimo. |
| `/topic/pedidos-listos` | Backend | Meseros | Avisos de platos listos para entregar. |

### Flujo Operativo

1. Mesero crea pedido con `POST /api/pedidos`.
2. Backend guarda pedido en estado `PENDIENTE`.
3. Backend publica el pedido en `/topic/comandas`.
4. Cocina recibe la tarjeta en tiempo real.
5. Cocina cambia estado a `EN_PREPARACION` y luego `LISTO`.
6. Al pasar a `LISTO`, backend descuenta inventario.
7. Si hay bajo stock, publica alerta en `/topic/alertas-stock`.
8. Backend publica aviso a meseros en `/topic/pedidos-listos`.

## 8. Recomendaciones Para Produccion

- Configurar variables de entorno reales.
- Usar HTTPS obligatorio.
- Cambiar claves iniciales.
- Configurar backups de PostgreSQL.
- Activar monitoreo de logs y metricas.
- Definir politica de retencion de ventas.
- Revisar integracion fiscal si se requiere facturacion legal.
