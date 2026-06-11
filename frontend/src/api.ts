import axios from 'axios';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type {
  Dashboard,
  Ingrediente,
  Mesa,
  Pedido,
  PedidoEstado,
  PedidoListo,
  Plato,
  TipoPago,
  Usuario,
} from './types';
import { sanitizeText } from './utils/security';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8085/api';
export const WS_URL = import.meta.env.VITE_WS_URL ?? 'http://localhost:8085/ws-restaurante';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

let csrfToken: string | null = null;

api.interceptors.request.use(async (config) => {
  const method = config.method?.toUpperCase();
  const mutating = method === 'POST' || method === 'PUT' || method === 'DELETE';
  if (mutating && config.url !== '/auth/login' && config.url !== '/auth/logout') {
    if (!csrfToken) {
      const { data } = await axios.get<{ token: string }>(`${API_BASE_URL}/auth/csrf`, { withCredentials: true });
      csrfToken = data.token;
    }
    config.headers.set('X-XSRF-TOKEN', csrfToken);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      csrfToken = null;
    }
    return Promise.reject(error);
  },
);

export async function login(username: string, password: string) {
  const { data } = await api.post<Usuario>('/auth/login', { username, password });
  return data;
}

export async function logoutBackend() {
  await api.post('/auth/logout');
  csrfToken = null;
}

export async function cambiarPassword(payload: { passwordActual: string; nuevaPassword: string }) {
  const { data } = await api.put<Usuario>('/usuarios/cambiar-password', payload);
  return data;
}

export async function getMesasActivas() {
  const { data } = await api.get<Mesa[]>('/mesas/activas');
  return data;
}

export async function abrirMesa(descripcion: string) {
  const { data } = await api.post<Mesa>('/mesas', { descripcion: sanitizeText(descripcion) });
  return data;
}

export async function getPlatos(admin = false) {
  const { data } = await api.get<Plato[]>(admin ? '/platos/admin' : '/platos');
  return data;
}

export async function guardarPlato(payload: Omit<Plato, 'id' | 'receta'> & { receta: Array<{ ingredienteId: number; cantidadRequerida: number }> }, id?: number) {
  const sanitizedPayload = {
    ...payload,
    nombre: sanitizeText(payload.nombre),
    descripcion: sanitizeText(payload.descripcion ?? ''),
  };
  const { data } = id
    ? await api.put<Plato>(`/platos/${id}`, sanitizedPayload)
    : await api.post<Plato>('/platos', sanitizedPayload);
  return data;
}

export async function desactivarPlato(id: number) {
  const { data } = await api.delete<Plato>(`/platos/${id}`);
  return data;
}

export async function getIngredientes() {
  const { data } = await api.get<Ingrediente[]>('/ingredientes');
  return data;
}

export async function guardarIngrediente(payload: Omit<Ingrediente, 'id'>, id?: number) {
  const sanitizedPayload = { ...payload, nombre: sanitizeText(payload.nombre) };
  const { data } = id
    ? await api.put<Ingrediente>(`/ingredientes/${id}`, sanitizedPayload)
    : await api.post<Ingrediente>('/ingredientes', sanitizedPayload);
  return data;
}

export async function eliminarIngrediente(id: number) {
  await api.delete(`/ingredientes/${id}`);
}

export async function crearPedido(payload: { mesaId: number; detalles: Array<{ platoId: number; cantidad: number; notasChef: string }> }) {
  const { data } = await api.post<Pedido>('/pedidos', {
    ...payload,
    detalles: payload.detalles.map((detalle) => ({
      ...detalle,
      notasChef: sanitizeText(detalle.notasChef ?? ''),
    })),
  });
  return data;
}

export async function getPedidosPorMesa(mesaId: number) {
  const { data } = await api.get<Pedido[]>(`/pedidos/mesa/${mesaId}`);
  return data;
}

export async function getComandasActivas() {
  const { data } = await api.get<Pedido[]>('/pedidos/comandas');
  return data;
}

export async function cambiarEstadoPedido(pedidoId: number, estado: PedidoEstado) {
  const { data } = await api.put<Pedido>(`/pedidos/${pedidoId}/estado`, { estado });
  return data;
}

export async function pagarMesa(mesaId: number, tipoPago: TipoPago, aplicarIva: boolean) {
  const { data } = await api.put<Pedido[]>(`/pedidos/mesa/${mesaId}/pagar`, { tipoPago, aplicarIva });
  return data;
}

export async function pagarParcial(
  mesaId: number,
  tipoPago: TipoPago,
  aplicarIva: boolean,
  items: Array<{ detalleId: number; cantidad: number }>,
) {
  const payload = { tipoPago, aplicarIva, items };
  try {
    const { data } = await api.put<Pedido[]>(`/pedidos/mesa/${mesaId}/pagar-parcial`, payload);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      const { data } = await api.post<Pedido[]>(`/pedidos/mesa/${mesaId}/pagar-parcial`, payload);
      return data;
    }
    throw error;
  }
}

export async function getHistorialVentas() {
  const { data } = await api.get<Pedido[]>('/pedidos/historial');
  return data;
}

export async function getDashboard() {
  const { data } = await api.get<Dashboard>('/estadisticas/dashboard');
  return data;
}

export function createStompClient(
  onPedido: (pedido: Pedido) => void,
  onStockAlert?: (payload: unknown) => void,
  onPedidoListo?: (payload: PedidoListo) => void,
) {
  const client = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    reconnectDelay: 3000,
    onConnect: () => {
      client.subscribe('/topic/comandas', (message) => {
        const payload = JSON.parse(message.body) as Pedido | Pedido[];
        if (Array.isArray(payload)) {
          payload.forEach(onPedido);
        } else {
          onPedido(payload);
        }
      });
      client.subscribe('/topic/alertas-stock', (message) => {
        onStockAlert?.(JSON.parse(message.body));
      });
      client.subscribe('/topic/pedidos-listos', (message) => {
        onPedidoListo?.(JSON.parse(message.body) as PedidoListo);
      });
    },
  });
  client.activate();
  return client;
}
