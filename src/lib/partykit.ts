export const PARTYKIT_HOST = import.meta.env.VITE_PARTYKIT_HOST as string ?? "localhost:1999";

export function roomJoinUrl(roomId: string): string {
  return `${location.protocol}//${location.host}/#/guest/${roomId}`;
}

export function partySocketOptions(roomId: string) {
  return {
    host: PARTYKIT_HOST,
    room: roomId,
  };
}
