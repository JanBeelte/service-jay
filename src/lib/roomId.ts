import { customAlphabet } from "nanoid";

// No ambiguous characters (0/O, 1/I/L)
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const generateRoomId = customAlphabet(alphabet, 6);
export const generateGuestId = customAlphabet(alphabet, 8);
export const generateOrderId = customAlphabet(alphabet, 10);
