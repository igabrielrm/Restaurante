export type Rol = 'ADMIN' | 'MESERO' | 'COCINERO' | 'CAJERO';
export type PedidoEstado = 'PENDIENTE' | 'EN_PREPARACION' | 'LISTO' | 'PAGADO';
export type TipoPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA';

export interface Usuario {
  id: number;
  username: string;
  rol: Rol;
}

export interface Mesa {
  id: number;
  identificadorDinamico: string;
  descripcion: string;
  activa: boolean;
}

export interface Ingrediente {
  id: number;
  nombre: string;
  stock: number;
  stockMinimo: number;
}

export interface RecetaItem {
  ingredienteId: number;
  ingredienteNombre: string;
  cantidadRequerida: number;
}

export interface Plato {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenUrl: string;
  activo: boolean;
  receta: RecetaItem[];
}

export interface PedidoDetalle {
  id: number;
  platoId: number;
  platoNombre: string;
  cantidad: number;
  notasChef: string;
  precioUnitario: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  mesa: Mesa;
  estado: PedidoEstado;
  tipoPago: TipoPago | null;
  total: number;
  fechaCreacion: string;
  detalles: PedidoDetalle[];
}

export interface PedidoListo {
  pedidoId: number;
  mesa: Mesa;
  platos: string[];
}

export interface TopPlato {
  platoId: number;
  platoNombre: string;
  unidadesVendidas: number;
  ingresoTotal: number;
}

export interface VentasPorPago {
  tipoPago: TipoPago;
  total: number;
}

export interface PedidosPorHora {
  hora: number;
  cantidad: number;
}

export interface Dashboard {
  topPlatos: TopPlato[];
  ventas: Record<string, VentasPorPago[]>;
  horasPico: PedidosPorHora[];
}
