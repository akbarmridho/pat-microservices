import createHttpError from 'http-errors';
import {env} from 'src/config/env';
import {EventDetail, EventPreview} from 'src/types/event';

export async function getAllEvents(): Promise<EventPreview[]> {
  const endpoint = `${env.BASE_TICKET_SERVICE_URL}/events`;
  const response = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw createHttpError(500, 'Failed to request service');
  }

  return (
    (await response.json()) as {
      data: EventPreview[];
    }
  ).data;
}

export async function getEventById(id: number): Promise<EventDetail | null> {
  const response = await fetch(`${env.BASE_TICKET_SERVICE_URL}/events/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw createHttpError(500, 'Failed to requese service');
  }

  return (
    (await response.json()) as {
      data: EventDetail;
    }
  ).data;
}
