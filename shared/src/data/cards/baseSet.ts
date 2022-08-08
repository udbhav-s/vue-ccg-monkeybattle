import {
  GameCard,
  GameCardTypes,
  GameClass,
  TargetSelect,
  TargetTypes,
  Triggers,
} from '../../';

export const baseSet: GameCard[] = [
  // NEUTRALS
  // 1 BANANAS
  {
    name: 'Sneaky Monkey',
    description: 'Has camo for one turn',
    bananas: 1,
    attack: 2,
    health: 2,
    type: GameCardTypes.CREATURE,
    modifiers: {
      Camo: true,
    },
    trigger: {
      name: Triggers.TurnStartTrigger,
      once: true,
      effect: {
        name: 'ModifierEffect',
        params: {
          modifier: 'Camo',
          value: false,
        },
        targets: {
          select: TargetSelect.Auto,
          type: [TargetTypes.Self],
        },
      },
      condition: {
        player: 'SELF',
      },
    },
  },
  {
    name: 'Impatient Chimp',
    description: 'Instant: Deal one damage to any enemy',
    bananas: 1,
    attack: 1,
    health: 2,
    type: GameCardTypes.CREATURE,
    instant: {
      name: 'DamageEffect',
      params: {
        value: 1,
      },
      targets: {
        select: TargetSelect.ByPlayer,
        type: [TargetTypes.EnemyCreature, TargetTypes.EnemyMonkey],
      },
      filterDamageModifiers: true,
    },
  },
  {
    name: 'Coco Blocker',
    description: 'Blocker',
    bananas: 1,
    attack: 2,
    health: 2,
    type: GameCardTypes.CREATURE,
    modifiers: {
      Blocker: true,
    },
  },
  {
    name: 'Baboon',
    description: 'Blocker',
    bananas: 1,
    attack: 1,
    health: 3,
    type: GameCardTypes.CREATURE,
    modifiers: {
      Blocker: true,
    },
  },
  {
    name: 'Friendly Orangutan',
    description: 'Instant: Give 1 health to any friendly',
    bananas: 1,
    attack: 1,
    health: 3,
    type: GameCardTypes.CREATURE,
    instant: {
      name: 'BuffEffect',
      params: {
        health: 1,
      },
      targets: {
        select: TargetSelect.ByPlayer,
        type: [TargetTypes.FriendlyCreature],
      },
    },
  },
  {
    name: 'Peel Head Monkey',
    description: 'Monkeshield',
    bananas: 1,
    attack: 1,
    health: 1,
    type: GameCardTypes.CREATURE,
    modifiers: {
      Monkeshield: true,
    },
  },
  {
    name: 'Stoned Chimp',
    description: 'High',
    bananas: 1,
    attack: 2,
    health: 3,
    type: GameCardTypes.CREATURE,
    modifiers: {
      High: true,
    },
  },
  {
    name: 'Healthy Milkshake',
    description: 'Give 2 attack to a creature for this turn',
    bananas: 1,
    type: GameCardTypes.SPELL,
    spell: {
      name: 'BuffForTurnEffect',
      params: {
        attack: 2,
      },
      targets: {
        select: TargetSelect.ByPlayer,
        type: [TargetTypes.FriendlyCreature],
      },
    },
    trigger: {
      name: Triggers.TurnEndTrigger,
      once: true,
      effect: {
        name: 'BuffEffect',
        params: {
          attack: -2,
        },
        targets: {
          select: TargetSelect.Auto,
          type: [TargetTypes.Self],
        },
      },
      condition: {
        player: 'SELF',
      },
    },
  },
  {
    name: 'Pointy Banana',
    description: 'Deal 2 damage to any enemy',
    bananas: 1,
    type: GameCardTypes.SPELL,
    spell: {
      name: 'DamageEffect',
      params: {
        value: 2,
      },
      targets: {
        select: TargetSelect.ByPlayer,
        type: [TargetTypes.EnemyCreature, TargetTypes.EnemyMonkey],
      },
    },
  },
  // 2 BANANAS
  {
    name: 'Proboscis',
    description: 'Instant: Heal a friendly for 2',
    bananas: 2,
    type: GameCardTypes.CREATURE,
    attack: 1,
    health: 2,
    instant: {
      name: 'HealEffect',
      params: {
        value: 2,
      },
      targets: {
        select: TargetSelect.ByPlayer,
        type: [TargetTypes.FriendlyCreature],
      },
    },
  },
  {
    name: 'Jungle Wood Wall',
    description: 'Blocker. Cannot attack',
    bananas: 2,
    attack: 1,
    health: 4,
    attackDisabled: true,
    type: GameCardTypes.CREATURE,
    modifiers: {
      Blocker: true,
    },
  },
  {
    name: 'Black Howler',
    bananas: 2,
    description: 'Blocker',
    attack: 3,
    health: 2,
    type: GameCardTypes.CREATURE,
    modifiers: {
      Blocker: true,
    },
  },
  {
    name: 'Mandrill',
    description: 'Instant: 1 damage to any enemy',
    bananas: 2,
    attack: 2,
    health: 2,
    type: GameCardTypes.CREATURE,
    instant: {
      name: 'DamageEffect',
      params: {
        value: 1,
      },
      targets: {
        select: TargetSelect.ByPlayer,
        type: [TargetTypes.EnemyCreature, TargetTypes.EnemyMonkey],
      },
      filterDamageModifiers: true,
    },
  },
  {
    name: "Melon's Musk",
    description: 'Give +3/-1 to a card',
    bananas: 2,
    type: GameCardTypes.SPELL,
    gameClass: GameClass.Memes,
    spell: {
      name: 'BuffEffect',
      params: {
        attack: 3,
        health: -1,
      },
      targets: {
        select: TargetSelect.ByPlayer,
        type: [TargetTypes.FriendlyCreature, TargetTypes.EnemyCreature],
      },
    },
  },
  // 3 BANANAS
  {
    name: 'Fat Coco Blocker',
    description: 'Blocker. Cannot attack',
    bananas: 3,
    type: GameCardTypes.CREATURE,
    attack: 2,
    health: 4,
    attackDisabled: true,
  },
  {
    name: 'Hamadryas Baboon',
    bananas: 3,
    type: GameCardTypes.CREATURE,
    attack: 4,
    health: 2,
  },
  {
    name: 'Care Package',
    description: 'Heal each friendly for 1',
    bananas: 3,
    type: GameCardTypes.SPELL,
    spell: {
      name: 'HealEffect',
      params: {
        value: 1,
      },
      targets: {
        select: TargetSelect.Auto,
        type: [TargetTypes.FriendlyCreature],
        count: 'ALL',
      },
    },
  },
  // 4 BANANAS
  {
    name: 'Angry Macaque',
    description: 'Instant: 2 damage to any enemy',
    bananas: 4,
    attack: 3,
    health: 3,
    type: GameCardTypes.CREATURE,
    instant: {
      name: 'DamageEffect',
      params: {
        value: 2,
      },
      targets: {
        select: TargetSelect.ByPlayer,
        type: [TargetTypes.EnemyCreature, TargetTypes.EnemyMonkey],
      },
      filterDamageModifiers: true,
    },
  },
  {
    name: 'Siamang',
    bananas: 4,
    type: GameCardTypes.CREATURE,
    attack: 5,
    health: 3,
  },
  {
    name: 'Ponginae',
    bananas: 4,
    type: GameCardTypes.CREATURE,
    description: 'Give +2/+1 to any friendly',
    attack: 3,
    health: 2,
    instant: {
      name: 'BuffEffect',
      params: {
        attack: 2,
        health: 1,
      },
      targets: {
        select: TargetSelect.ByPlayer,
        type: [TargetTypes.FriendlyCreature],
      },
    },
  },
  {
    name: 'Throw Big Rock',
    description: 'Do 4 damage to any enemy',
    bananas: 4,
    type: GameCardTypes.SPELL,
    spell: {
      name: 'DamageEffect',
      params: {
        value: 4,
      },
      targets: {
        select: TargetSelect.ByPlayer,
        type: [TargetTypes.EnemyCreature, TargetTypes.EnemyMonkey],
      },
    },
  },
  // 5 BANANAS
  {
    name: 'Gorilla',
    bananas: 5,
    description: 'Blocker',
    type: GameCardTypes.CREATURE,
    attack: 5,
    health: 4,
    modifiers: {
      Blocker: true,
    },
  },
  {
    name: 'Tapanuli Orangutan',
    description: 'Instant: Summon 2 1/1 langurs',
    bananas: 5,
    type: GameCardTypes.CREATURE,
    attack: 3,
    health: 3,
    instant: {
      name: 'SummonEffect',
      params: {
        name: 'Langur',
        count: 2,
      },
    },
  },
  {
    name: 'Langur',
    type: GameCardTypes.CREATURE,
    bananas: 0,
    notAddableToDeck: true,
    attack: 1,
    health: 1,
  },
  {
    name: 'Agile Gibbon',
    type: GameCardTypes.CREATURE,
    bananas: 5,
    attack: 5,
    health: 2,
    modifiers: {
      Monkeshield: true,
    },
  },
  // MEMES
  {
    name: 'Banonus',
    description:
      'Summon an impostor of any enemy card on your board (Memes Class)',
    bananas: 3,
    type: GameCardTypes.SPELL,
    gameClass: GameClass.Memes,
    spell: {
      name: 'SummonEffect',
      targets: {
        select: TargetSelect.ByPlayer,
        type: [TargetTypes.EnemyCreature],
      },
    },
  },
  {
    name: "Banana Pie",
    description: 'Double the health of any friendly (Memes Class)',
    bananas: 2,
    type: GameCardTypes.SPELL,
    gameClass: GameClass.Memes,
    spell: {
      name: 'DoubleHealthEffect',
      targets: {
        select: TargetSelect.ByPlayer,
        type: [TargetTypes.FriendlyCreature],
      },
    },
  },
  {
    name: 'EA',
    description:
      'Increase cost of all cards in opponent hand by 1 (Memes Class)',
    bananas: 3,
    type: GameCardTypes.SPELL,
    gameClass: GameClass.Memes,
    spell: {
      name: 'IncreaseCostEffect',
      params: {
        cards: 'ALL',
        value: 1,
        player: 'OPPONENT',
      },
    },
  },
  {
    name: 'Ketamine',
    description: 'Give +4/-1 to a card (Memes Class)',
    bananas: 3,
    type: GameCardTypes.SPELL,
    gameClass: GameClass.Memes,
    spell: {
      name: 'BuffEffect',
      params: {
        attack: 4,
        health: -1,
      },
      targets: {
        select: TargetSelect.ByPlayer,
        type: [TargetTypes.FriendlyCreature, TargetTypes.EnemyCreature],
      },
    },
  },
  // MOVIES
  {
    name: 'Bananos',
    description:
      "Deal 2 damage to a random half of the opponent's board (Movies+TV Class)",
    bananas: 4,
    type: GameCardTypes.SPELL,
    gameClass: GameClass.Movies,
    spell: {
      name: 'BananosEffect',
    },
  },
  {
    name: 'Bonobo Wick',
    description: 'Instant: Deal 1 damage to any enemy (Movies+TV Class)',
    bananas: 5,
    attack: 5,
    health: 4,
    type: GameCardTypes.CREATURE,
    gameClass: GameClass.Movies,
    instant: {
      name: 'DamageEffect',
      params: {
        value: 1,
      },
      targets: {
        select: TargetSelect.ByPlayer,
        type: [TargetTypes.EnemyCreature, TargetTypes.EnemyMonkey],
      },
      filterDamageModifiers: true,
    },
  },
  {
    name: 'The Twins',
    description: 'Summon two 1/1 twins (Movies Class)',
    bananas: 2,
    type: GameCardTypes.SPELL,
    gameClass: GameClass.Movies,
    spell: {
      name: 'SummonEffect',
      params: {
        count: 2,
        name: 'Twin',
      },
    },
  },
  {
    name: 'Twin',
    description: '',
    bananas: 0,
    attack: 1,
    health: 1,
    type: GameCardTypes.CREATURE,
    notAddableToDeck: true,
  },
  // FESTIVE
  {
    name: 'Big Spook',
    type: GameCardTypes.SPELL,
    gameClass: GameClass.Festive,
    description: 'Give Burn +1 to any enemy creature (Festive Class)',
    bananas: 2,
    spell: {
      name: 'ModifierEffect',
      params: {
        modifier: 'Burn',
        value: 1,
      },
      targets: {
        select: TargetSelect.ByPlayer,
        type: [TargetTypes.EnemyCreature],
      },
    },
  },
];
