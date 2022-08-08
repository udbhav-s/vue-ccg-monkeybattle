import {
  SelectableTarget,
  Player,
  InvalidEffectParamsError,
  TargetTypes,
} from '../../';
import { Game } from '../../';
import { Triggers } from '../../triggers';

export interface EffectActivateParams {
  targets: SelectableTarget[];
  params: any;
  player: Player;
  game: Game;
}

export interface Effect {
  activate: (e: EffectActivateParams) => void;
}

const DamageEffect = {
  activate(e: EffectActivateParams) {
    if (!e.params.value) throw new InvalidEffectParamsError();
    for (const target of e.targets) {
      if (target === TargetTypes.EnemyMonkey)
        e.game.dealMonkeyDamage(e.game.otherPlayer(e.player), e.params.value);
      else e.game.dealDamage(target, e.params.value);
    }
  },
};

const BuffEffect = {
  activate(e: EffectActivateParams) {
    for (const target of e.targets) {
      if (target === TargetTypes.EnemyMonkey) continue;
      if (e.params.attack)
        e.game.setAttack(target, target.attack + e.params.attack);
      if (e.params.health)
        e.game.setHealth(target, target.health + e.params.health);
    }
  },
};

const BuffForTurnEffect = {
  activate(e: EffectActivateParams) {
    BuffEffect.activate(e);
    const handler = ({ player }: { player: Player }) => {
      if (player.user.id === e.player.user.id) {
        e.params.attack *= -1;
        BuffEffect.activate(e);
        e.game.eventEmitter.off(Triggers.TurnEndTrigger, handler);
      }
    };
    e.game.eventEmitter.on(Triggers.TurnEndTrigger, handler);
  },
};

const HealEffect = {
  activate(e: EffectActivateParams) {
    for (const target of e.targets) {
      if (target === TargetTypes.EnemyMonkey) continue;
      e.game.heal(target, e.params.value);
    }
  },
};

const HealMonkeyEffect = {
  activate(e: EffectActivateParams) {
    if (!e.params.value) return;
    e.game.healMonkey(e.player, e.params.value);
  },
};

const ModifierEffect = {
  activate(e: EffectActivateParams) {
    if (!e.params.modifier || e.params.value === undefined)
      throw new InvalidEffectParamsError();
    for (const target of e.targets) {
      if (target === TargetTypes.EnemyMonkey) continue;
      e.game.setModifier(target, e.params.modifier, e.params.value);
    }
  },
};

const SummonEffect = {
  activate(e: EffectActivateParams) {
    if (e.player.board.length < 6) {
      if (e.params && e.params.name) {
        e.game.summon(
          e.player,
          e.params.name,
          e.params.count ? e.params.count : 1,
        );
      } else if (e.targets) {
        for (const target of e.targets) {
          if (target === TargetTypes.EnemyMonkey) continue;
          e.game.summon(
            e.player,
            target.name,
            e.params?.count ? e.params.count : 1,
          );
        }
      }
    }
  },
};

const IncreaseCostEffect = {
  activate(e: EffectActivateParams) {
    let target = e.player;
    if (e.params.player === 'OPPONENT') target = e.game.otherPlayer(e.player);

    if (e.params.cards === 'ALL') {
      for (const card of target.hand) {
        e.game.setBananas(card, card.bananas + e.params.value);
      }
    }
  },
};

const DoubleHealthEffect = {
  activate(e: EffectActivateParams) {
    for (const target of e.targets) {
      if (target === TargetTypes.EnemyMonkey) continue;
      if (!target.health) throw new Error('Target does not have health!');
      e.game.setHealth(target, target.health * 2);
    }
  },
};

const BananosEffect = {
  activate(e: EffectActivateParams) {
    const targetPlayer = e.game.otherPlayer(e.player);
    for (const card of targetPlayer.board) {
      if (Math.random() > 0.5) e.game.dealDamage(card, 2);
    }
  },
};

export const Effects: { [key: string]: Effect } = {
  DamageEffect,
  BuffEffect,
  BuffForTurnEffect,
  ModifierEffect,
  SummonEffect,
  IncreaseCostEffect,
  DoubleHealthEffect,
  BananosEffect,
  HealEffect,
  HealMonkeyEffect,
};
