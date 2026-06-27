import { io, type Socket } from 'socket.io-client';
import { API_ORIGIN } from './api';

// Realtime socket.io ulanishi (bildirishnomalar uchun).
// Backend cookie `access_token` orqali autentifikatsiya qiladi (withCredentials).

let socket: Socket | null = null;

function resolveOrigin(): string {
  // API_ORIGIN dev'da http://localhost:8000, prod'da https://api.zumex.uz.
  // Bo'sh bo'lsa (proxy rejimi) — joriy origin (vite proxy /socket.io'ni uzatadi).
  if (API_ORIGIN && API_ORIGIN.trim() !== '') return API_ORIGIN;
  return window.location.origin;
}

export function getSocket(): Socket {
  if (socket) return socket;
  socket = io(resolveOrigin(), {
    path: '/socket.io',
    withCredentials: true,
    autoConnect: false,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    // Backend o'chiq bo'lganda kamroq tez-tez urinish (console spam kamayadi),
    // lekin backend qaytsa avtomatik qayta ulanadi.
    reconnectionDelay: 3000,
    reconnectionDelayMax: 30000,
    randomizationFactor: 0.5,
    timeout: 8000,
  });
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}
