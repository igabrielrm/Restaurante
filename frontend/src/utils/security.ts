import axios from 'axios';

export function sanitizeText(value: string) {
  return value
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .trim();
}

export function getErrorMessage(error: unknown, fallback = 'No se pudo completar la operacion.') {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
    if (error.response?.status === 401) {
      return 'Tu sesion expiro. Vuelve a iniciar sesion.';
    }
    if (error.response?.status === 403) {
      return 'No tienes permiso para realizar esta accion.';
    }
  }
  return fallback;
}
