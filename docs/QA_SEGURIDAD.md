# Checklist De QA Y Seguridad - Restaurante

## 1. Pruebas Funcionales Criticas

### Acceso

- Login correcto con `admin`, `mesero`, `cajero` y `cocina`.
- Login rechazado con clave incorrecta.
- Logout invalida la sesion.
- Cambio de contraseña exitoso.
- Cambio de contraseña rechazado si la clave actual no coincide.

### Mesero

- Abrir mesa nueva.
- Agregar plato con cantidad 1.
- Agregar plato con cantidad mayor a 1.
- Agregar nota de cocina.
- Reingresar a mesa activa y agregar mas productos.
- Recibir notificacion de pedido listo.

### Cocina

- Ver comandas pendientes.
- Cambiar pedido a `EN_PREPARACION`.
- Cambiar pedido a `LISTO`.
- Confirmar descuento de inventario.
- Confirmar alerta de stock bajo si aplica.

### Caja

- Ver mesas por cobrar.
- Activar y desactivar IVA.
- Procesar pago total.
- Procesar pago parcial por cantidades especificas.
- Verificar que la mesa cierre cuando no quedan saldos.
- Revisar historial de ventas.

### Administrador

- Ver dashboard.
- Revisar unidades top.
- Crear ingrediente.
- Editar ingrediente.
- Eliminar ingrediente no vinculado.
- Crear plato con receta.
- Editar plato existente.
- Desactivar plato.

## 2. Seguridad

### Contraseñas

- Ninguna contraseña debe guardarse en texto plano.
- Los hashes deben iniciar con prefijo BCrypt (`$2a`, `$2b` o equivalente).
- Las claves base deben cambiarse antes de produccion.

### Sesion

- La cookie de sesion debe ser `HttpOnly`.
- La cookie debe usar `SameSite=Lax`.
- Las operaciones protegidas deben requerir sesion.

### CSRF

- `POST`, `PUT` y `DELETE` deben enviar `X-XSRF-TOKEN`.
- El token debe obtenerse desde `/api/auth/csrf`.
- Login y logout no deben bloquearse por ausencia de token.

### CORS

- No usar `*` como origen permitido.
- `FRONTEND_ORIGIN` debe coincidir con el dominio real del frontend.

### Roles

- `ADMIN` puede acceder a dashboard e inventario.
- `CAJERO` no puede acceder a inventario.
- `MESERO` no puede cobrar cuentas.
- `COCINERO` no puede crear ingredientes ni cobrar.
- Usuarios no autenticados reciben `401`.
- Usuarios sin permiso reciben `403`.

## 3. Validacion De Datos

- No permitir pedidos sin detalles.
- No permitir cantidades menores a 1.
- No permitir precios negativos.
- No permitir nombres vacios.
- No permitir notas excesivamente largas.
- No permitir pago parcial sin items.
- No permitir eliminar ingredientes usados en recetas activas.

## 4. Robustez

- El backend debe responder errores en JSON estructurado.
- El frontend debe mostrar mensajes legibles.
- La interfaz no debe congelarse ante errores del backend.
- WebSockets deben reconectar automaticamente.
- Si backend esta apagado, login debe mostrar mensaje claro.

## 5. Comandos De Verificacion

Backend:

```powershell
cd backend
.\mvnw.cmd -DskipTests compile
```

Frontend:

```bash
cd frontend
npm run build
```

## 6. Evidencia Recomendada

Antes de una entrega formal, registrar:

- Capturas de login por rol.
- Capturas de mesa abierta y comanda enviada.
- Captura de tablero de cocina.
- Captura de pago parcial.
- Captura de dashboard administrador.
- Resultado de build frontend.
- Resultado de compile backend.
