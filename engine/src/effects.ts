import { Target } from './target';

export interface EffectParams {
  name: string;
  params?: any;
  targets?: Target;
  filterDamageModifiers?: boolean;
}
