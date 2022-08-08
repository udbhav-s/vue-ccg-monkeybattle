export type AddCards = {
  name: string;
  count?: number;
}[];

export interface AddDeck {
  name: string;
  cards: AddCards;
}

export const starterCards: AddCards = [
  // neutral
  {
    name: 'Sneaky Monkey',
    count: 2,
  },
  {
    name: 'Impatient Chimp',
    count: 2,
  },
  {
    name: 'Coco Blocker',
    count: 2,
  },
  {
    name: 'Baboon',
    count: 2,
  },
  {
    name: 'Friendly Orangutan',
  },
  {
    name: 'Peel Head Monkey',
  },
  {
    name: 'Stoned Chimp',
  },
  {
    name: 'Healthy Milkshake',
  },
  {
    name: 'Pointy Banana',
  },
  {
    name: 'Proboscis',
  },
  {
    name: 'Jungle Wood Wall',
  },
  {
    name: 'Black Howler',
  },
  {
    name: 'Mandrill',
  },
  {
    name: "Melon's Musk",
  },
  {
    name: 'Fat Coco Blocker',
  },
  {
    name: 'Hamadryas Baboon',
  },
  {
    name: 'Care Package',
  },
  {
    name: 'Angry Gorilla',
  },
  {
    name: 'Siamang',
  },
  {
    name: 'Ponginae',
  },
  {
    name: 'Throw Big Rock',
  },
  {
    name: 'Gorila',
  },
  {
    name: 'Tapanuli Orangutan',
  },
  {
    name: 'Agile Gibbon',
  },
  // memes
  {
    name: 'Banonus',
  },
  {
    name: "Satoshi's Blessing",
  },
  {
    name: 'EA',
  },
  {
    name: 'Ketamine',
  },
  // movies+tv
  {
    name: 'Bananos',
  },
  {
    name: 'Bonobo Wick',
  },
  {
    name: 'The Twins',
  },
  {
    name: 'Bantama',
  },
  // festive
  {
    name: 'Big Spook',
  },
];
