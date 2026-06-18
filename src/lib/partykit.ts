export const PARTYKIT_HOST = import.meta.env.VITE_PARTYKIT_HOST || "service-jay-ws.feuerschwanz.workers.dev";

export function roomJoinUrl(roomId: string): string {
  return `${location.protocol}//${location.host}/#/guest/${roomId}`;
}

export function partySocketOptions(roomId: string) {
  return {
    host: PARTYKIT_HOST,
    room: roomId,
  };
}
