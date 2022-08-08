import { GameClass } from '../../gameClasses';
import { Monkey } from '../../monkey';

export const monkeys: Partial<Monkey>[] = [
  {
    name: 'Holiday Monkey',
    monkeyClass: GameClass.Festive,
    description: 'Always ready for a day off',
  },
  {
    name: 'Caesar',
    monkeyClass: GameClass.Movies,
    description: 'The revolutionary',
  },
  {
    name: 'Harambe',
    monkeyClass: GameClass.Memes,
    description: 'He will never leave our hearts',
  },
];
