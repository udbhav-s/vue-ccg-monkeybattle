import { AddPlayer } from "monkeybattle-shared";

const defaultCards = [
  // neutral
  {
    name: "Sneaky Monkey",
  },
  {
    name: "Impatient Chimp",
  },
  {
    name: "Coco Blocker",
  },
  {
    name: "Baboon",
  },
  {
    name: "Friendly Orangutan",
  },
  {
    name: "Peel Head Monkey",
  },
  {
    name: "Stoned Chimp",
  },
  {
    name: "Healthy Milkshake",
  },
  {
    name: "Pointy Banana",
  },
  {
    name: "Proboscis",
  },
  {
    name: "Jungle Wood Wall",
  },
  {
    name: "Black Howler",
  },
  {
    name: "Mandrill",
  },
  {
    name: "Ponginae",
  },
  {
    name: "Gorila",
  },
  {
    name: "Tapanuli Orangutan",
  },
  // memes
  {
    name: "Banonus",
  },
  {
    name: "Banana Pie",
  },
  {
    name: "EA",
  },
  {
    name: "Ketamine",
  },
];

export const defaultAiUser: AddPlayer = {
  user: {
    id: 0,
    username: "AI Opponent",
    level: 0,
    xp: 0,
  },
  deck: {
    monkey: {
      id: 999,
      name: "Siamang",
      monkeyClass: "Memes",
      gameClassId: 1,
    },
    cards: defaultCards,
  },
};
