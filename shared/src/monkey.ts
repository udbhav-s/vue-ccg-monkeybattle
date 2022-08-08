export interface Monkey {
  id: number;
  name: string;
  monkeyClass: string;
  description?: string;

  gameClassId: number;
  gameClass?: {
    name: string;
  };
}
