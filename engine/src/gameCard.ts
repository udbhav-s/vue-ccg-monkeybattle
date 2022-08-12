import { EffectParams } from './effects';
import { GameClass } from './gameClasses';
import { TriggerParams } from './triggers';

export enum GameCardTypes {
  CREATURE = 'CREATURE',
  SPELL = 'SPELL',
}

export interface GameCard {
  uid?: string;
  name: string;
  description?: string;
  bananas: number;
  type: GameCardTypes;
  attack?: number;
  health?: number;
  gameClass?: GameClass;
  notAddableToDeck?: boolean;
  baseHealth?: number;

  enabled?: boolean;
  attackDisabled?: boolean;
  modifiers?: {
    Burn?: number;
    Blocker?: boolean;
    Disoriented?: boolean;
    Camo?: boolean;
    Regen?: number;
    Monkeshield?: boolean;
    [key: string]: any;
  };

  instant?: EffectParams;

  spell?: EffectParams;
  trigger?: TriggerParams;
}
