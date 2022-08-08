import { io } from "socket.io-client";
import { Ref, ref } from "vue";

export const socket = io();

export function queue(
  deckId: number,
  customQueueName: string,
  handleJoin: () => void,
  handleError?: (res: { error?: string }) => void
): void {
  if (!socket.connected) socket.connect();
  const options: { deckId: number; custom?: string } = { deckId };
  if (customQueueName) options.custom = customQueueName;
  socket.emit("queue", options, (res: { error?: string }) => {
    if (res.error && handleError) handleError(res);
  });
  socket.once("gameJoined", handleJoin);
}

export function useNumOnline(): {
  numOnline: Ref<number>;
  getNumOnline: () => void;
} {
  const numOnline = ref<number>(0);
  const getNumOnline = () => {
    socket.emit("getNumOnline", (res: { numOnline: number }) => {
      numOnline.value = res.numOnline;
    });
    socket.on("numOnline", (res: { numOnline: number }) => {
      numOnline.value = res.numOnline;
    });
  };
  return { numOnline, getNumOnline };
}
