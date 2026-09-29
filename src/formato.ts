/**
 * Textos listos para pantalla: pesos, horas y títulos de zona.
 *
 * Solo formatean valores; no llaman a la API ni leen la sesión.
 */

/** 8500 -> "$8.500" (pesos colombianos, sin decimales). */
export function formatPesos(valor: number): string {
  const entero = Math.round(valor)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `$${entero}`;
}

function aFecha(valor: string | Date): Date {
  return typeof valor === 'string' ? new Date(valor) : valor;
}

/** "3:45 p. m." en la hora local del dispositivo. */
export function formatHora(valor: string | Date): string {
  const fecha = aFecha(valor);
  if (Number.isNaN(fecha.getTime())) return '—';
  return fecha.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
}

/** "28 sept, 3:45 p. m." en la hora local del dispositivo. */
export function formatFechaHora(valor: string | Date): string {
  const fecha = aFecha(valor);
  if (Number.isNaN(fecha.getTime())) return '—';
  return fecha.toLocaleString('es-CO', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Solo la hora si es hoy ("3:45 p. m."); con fecha si es otro día. */
export function formatMomento(valor: string | Date): string {
  const esHoy = aFecha(valor).toDateString() === new Date().toDateString();
  return esHoy ? formatHora(valor) : formatFechaHora(valor);
}

/**
 * "28 sept, 3:00 p. m. → 5:00 p. m.". Si el fin cae otro día, también lleva
 * su fecha.
 */
export function formatVentana(inicio: string, fin: string | null): string {
  if (!fin) return `Desde ${formatFechaHora(inicio)}`;
  const mismoDia = new Date(inicio).toDateString() === new Date(fin).toDateString();
  return `${formatFechaHora(inicio)} → ${mismoDia ? formatHora(fin) : formatFechaHora(fin)}`;
}

/** 2 -> "2 h"; 1.5 -> "1,5 h". */
export function formatHoras(horas: number): string {
  const redondeo = Math.round(horas * 10) / 10;
  const texto = Number.isInteger(redondeo) ? String(redondeo) : redondeo.toFixed(1).replace('.', ',');
  return `${texto} h`;
}

/** Milisegundos restantes -> "14:52". */
export function formatCuentaRegresiva(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutos = Math.floor(total / 60);
  const segundos = total % 60;
  return `${minutos}:${String(segundos).padStart(2, '0')}`;
}

/**
 * Título de una zona: la primera línea de `indicaciones`, igual que en el
 * panel admin. Sin indicaciones queda "Zona #id".
 */
export function tituloZona(indicaciones: string | null | undefined, id: number | null): string {
  const linea = indicaciones?.trim().split('\n')[0]?.trim();
  if (linea) return linea;
  return id === null ? 'Zona sin asignar' : `Zona #${id}`;
}

/** Las líneas de `indicaciones` después del título, o null si no hay más. */
export function detalleZona(indicaciones: string | null | undefined): string | null {
  const lineas = (indicaciones ?? '')
    .split('\n')
    .map((linea) => linea.trim())
    .filter(Boolean);
  if (lineas.length <= 1) return null;
  return lineas.slice(1).join('\n');
}
