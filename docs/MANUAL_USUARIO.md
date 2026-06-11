# Manual De Usuario - Restaurante

## Bienvenida

**Restaurante** es una plataforma para administrar el trabajo diario del restaurante desde una interfaz sencilla, segura y adaptable a telefonos, tablets y computadores.

Cada usuario ingresa con su cuenta y ve solo las funciones que necesita segun su rol:

- Mesero
- Cocina
- Caja
- Administrador

## 1. Control De Acceso

### Iniciar Sesion

1. Abre el sistema en el navegador.
2. Escribe tu usuario.
3. Escribe tu clave.
4. Presiona **Ingresar**.

Si los datos son correctos, el sistema abrira automaticamente tu panel de trabajo.

### Recomendaciones De Seguridad

- No compartas tu clave con otros usuarios.
- Cierra sesion al terminar tu turno.
- Cambia tu contraseña si sospechas que alguien mas la conoce.

### Cambiar Contraseña

1. En la barra superior, presiona **Mi Cuenta**.
2. Escribe tu **Contraseña Actual**.
3. Escribe tu **Nueva Contraseña**.
4. Repite la nueva contraseña en **Confirmar Contraseña**.
5. Presiona **Actualizar Contraseña**.

Si la contraseña actual es correcta y la confirmacion coincide, el sistema guardara el cambio.

## 2. Flujo Del Mesero

La vista del mesero esta optimizada para telefonos y tablets.

### Abrir Una Mesa

1. Presiona el boton **+**.
2. El sistema mostrara una pantalla para crear la nueva mesa.
3. Si deseas, escribe una descripcion, por ejemplo:
   - `Familia ventana`
   - `Juan gorra roja`
   - `Reserva Perez`
4. Agrega los platos de la comanda.
5. Presiona **Enviar Comanda**.

La mesa quedara activa y disponible para volver a entrar si el cliente pide mas productos.

### Agregar Platos A Una Comanda

1. Dentro de la mesa, presiona **+ Agregar Plato**.
2. Busca o selecciona el plato del menu.
3. Ajusta la cantidad con los botones **+** y **-**.
4. Si hace falta, escribe una nota para cocina, por ejemplo:
   - `Sin cebolla`
   - `Termino medio`
   - `Salsa aparte`
5. Confirma la seleccion.

Puedes repetir este proceso hasta completar la comanda.

### Modificar Cantidades

En el resumen de la comanda:

- Presiona **+** para aumentar unidades.
- Presiona **-** para disminuir unidades.
- Si ya no quieres un plato, elimina esa linea antes de enviar.

### Enviar La Comanda A Cocina

1. Revisa la lista de productos.
2. Verifica cantidades y notas.
3. Presiona **Enviar Comanda**.

La cocina recibira el pedido en tiempo real.

### Entrar A Una Mesa Activa

1. En la pantalla principal, selecciona una mesa activa.
2. Revisa los pedidos existentes.
3. Agrega nuevos platos si el cliente lo solicita.
4. Envia la nueva comanda.

### Avisos De Comida Lista

Cuando cocina marca un pedido como **Listo**, el mesero recibe una notificacion en pantalla indicando:

- Mesa correspondiente.
- Platos listos para recoger.

Esto permite entregar la comida sin revisar manualmente la cocina.

## 3. Flujo Del Cocinero

La vista de cocina muestra las comandas en columnas para facilitar el seguimiento.

### Ver Comandas Pendientes

Al entrar al panel de cocina veras las comandas organizadas por estado:

- **Pendiente**
- **En preparacion**
- **Listo**

Cada tarjeta muestra:

- Mesa
- Numero de pedido
- Platos
- Cantidades
- Notas especiales del mesero

### Avanzar Un Pedido

1. Lee la tarjeta del pedido.
2. Cuando empieces a prepararlo, presiona el boton para avanzar a **En Preparacion**.
3. Cuando este terminado, presiona el boton para avanzar a **Listo**.

Al marcar un pedido como listo:

- El mesero recibe un aviso inmediato.
- El inventario se descuenta automaticamente segun las recetas.
- Si algun ingrediente queda bajo minimo, el sistema muestra alerta de stock.

## 4. Flujo Del Cajero

La vista de caja permite cobrar cuentas completas o dividir pagos por persona.

### Ver Cuentas Por Cobrar

1. Entra al panel de caja.
2. Revisa la pestaña **Por cobrar**.
3. Selecciona la mesa que deseas cobrar.
4. El sistema mostrara el detalle de productos y totales.

### Activar O Desactivar IVA

En la cuenta seleccionada, usa el interruptor de IVA:

- Activado: el total incluye IVA.
- Desactivado: el total se calcula sin IVA.

El total cambia inmediatamente al mover el interruptor.

### Pago Total

1. Selecciona el tipo de pago:
   - Efectivo
   - Transferencia
   - Tarjeta
2. Verifica subtotal, IVA y total.
3. Presiona **Pago Total**.

La mesa queda cerrada cuando no quedan saldos pendientes.

### Pagar Por Separado

Este modulo permite cobrar a una persona solo una parte de la mesa.

1. Presiona **Pagar por Separado**.
2. En cada producto, selecciona cuantas unidades pagara la persona.
3. Usa los botones **+** y **-** para ajustar cantidades.
4. El sistema calcula automaticamente el subtotal de esa seleccion.
5. Selecciona el tipo de pago.
6. Confirma el pago parcial.

Ejemplo:

- La mesa pidio 3 hamburguesas.
- Una persona paga 1 hamburguesa.
- El sistema descuenta 1 y deja 2 pendientes en la cuenta.

Cuando todos los productos quedan pagados, la mesa se cierra.

### Historial De Ventas

1. Abre la pestaña **Historial**.
2. Selecciona una venta o mesa cerrada.
3. Revisa el detalle del ticket:
   - Productos
   - Cantidades
   - Tipo de pago
   - Total

Este historial ayuda a auditar ventas ya cobradas.

## 5. Flujo Del Administrador

El administrador tiene acceso al panel de reportes e inventario.

### Dashboard Estadistico

El dashboard muestra indicadores clave:

- Ventas por periodo.
- Ventas por tipo de pago.
- Horas pico.
- Platos mas vendidos.
- Unidades top.
- Alertas de stock bajo.

### Leer Unidades Top

La seccion **Unidades Top** muestra los productos con mayor movimiento.

Al interactuar con esta seccion, se despliega un detalle con:

- Nombre del plato.
- Cantidad vendida.
- Ranking de rendimiento.

Esto ayuda a identificar platos estrella y tomar decisiones de compra o promocion.

### Gestionar Inventario

En la seccion de inventario puedes:

- Crear ingredientes.
- Editar nombre, stock y stock minimo.
- Eliminar ingredientes que no esten vinculados a recetas activas.

Campos principales:

- **Nombre:** ingrediente o insumo.
- **Stock:** cantidad disponible.
- **Stock minimo:** limite que activa alerta.

### Gestionar Menu

El administrador puede crear o editar platos:

- Nombre
- Descripcion
- Precio
- Imagen
- Estado activo/inactivo
- Receta con ingredientes y cantidades requeridas

Las recetas permiten que el sistema descuente inventario automaticamente cuando cocina marca pedidos como listos.

## 6. Mensajes Y Errores

El sistema muestra avisos claros cuando algo no se puede completar, por ejemplo:

- Usuario o clave incorrectos.
- No tienes permiso para realizar esta accion.
- La cantidad debe ser mayor que cero.
- No se pudo procesar el pago.
- La contraseña actual no coincide.

Si aparece un error repetidamente, comunica el mensaje al administrador del sistema.

## 7. Cierre De Turno Recomendado

Antes de terminar el turno:

1. Verifica que no queden mesas pendientes.
2. Revisa pagos separados incompletos.
3. Confirma que cocina no tenga comandas pendientes.
4. En caja, revisa el historial de ventas.
5. Cierra sesion desde el boton superior.
