import { CathegoriesBlog } from '../types/cathegoriesBlog';

export function afficherCategories(charactereJoin: string): string {
  return Object.values(CathegoriesBlog).join(charactereJoin);
}
