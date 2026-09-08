/**
 * Endpoints de tickets.
 *
 * ATENCIÓN: hoy el backend solo tiene /auth (autenticación y registro, F19-F20).
 * Esta ruta es el contrato que la app espera cuando se implemente F01 "Registro
 * de solicitudes". Mientras no exista, la pantalla mostrará el error que
 * devuelva el servidor ("Ruta no encontrada"), no un fallo de la app.
 */

import type { Category, NewTicket, Priority, Ticket, TicketStatus } from '../types';
import { request } from './client';

/** Forma EXACTA del ticket en el servidor (modelo Ticket del dominio del backend). */
interface TicketResponse {
  id: string;
  asunto: string;
  descripcion: string;
  categoria: Category;
  prioridad: Priority;
  estado: TicketStatus;
  solicitanteId: string;
  agenteId: string | null;
}

/** POST /tickets -> el ticket creado, con su identificador único (F02). */
export async function createTicket(ticket: NewTicket): Promise<Ticket> {
  const created = await request<TicketResponse>('/tickets', {
    asunto: ticket.subject,
    descripcion: ticket.description,
    categoria: ticket.category,
    prioridad: ticket.priority,
  });

  return {
    id: created.id,
    subject: created.asunto,
    description: created.descripcion,
    category: created.categoria,
    priority: created.prioridad,
    status: created.estado,
    requesterId: created.solicitanteId,
    agentId: created.agenteId,
  };
}
