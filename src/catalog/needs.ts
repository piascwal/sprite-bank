/* Besoins des jeux (games/<jeu>.json, publiés par chaque jeu) : quelles poses demander à un personnage,
   et quel accessoire décrire dans ses prompts. Les fichiers sont lus à la construction de l'atelier. */
import { SPRITE_BY_KEY, type SpriteKey } from './sprite-poses';
import type { GameNeeds, GameStyle, StyleId } from './types';

const files = import.meta.glob<GameNeeds>('../../games/*.json', { eager: true, import: 'default' });

/** Tous les jeux qui utilisent la banque, dans l'ordre alphabétique de leur fichier. */
export const GAMES: readonly GameNeeds[] = Object.keys(files)
  .sort()
  .map((path) => files[path]!);

/** Style vide : personnage dont le style n'est connu d'aucun jeu. */
const NO_STYLE: GameStyle = { label: 'Sans style', poses: [] };

/** Tous les styles déclarés par les jeux (le premier jeu qui définit un identifiant l'emporte). */
export const STYLES: Readonly<Record<StyleId, GameStyle>> = Object.assign(
  {},
  ...[...GAMES].reverse().map((g) => g.styles ?? {}),
);

export const STYLE_IDS: readonly StyleId[] = Object.keys(STYLES);

export const styleOf = (id: StyleId): GameStyle => STYLES[id] ?? NO_STYLE;

/** Poses qu'un jeu demande à un personnage de ce style. */
export function gamePoses(game: GameNeeds, style: StyleId): SpriteKey[] {
  return [...game.common, ...(game.styles?.[style]?.poses ?? [])];
}

/** Poses demandées à un personnage par l'ensemble des jeux, sans doublon, dans l'ordre des jeux. */
export function posesFor(style: StyleId): SpriteKey[] {
  const keys = new Set(GAMES.flatMap((g) => gamePoses(g, style)));
  return [...keys].filter((key) => key in SPRITE_BY_KEY);
}

/** Jeux qui demandent cette pose à un personnage de ce style. */
export const gamesNeeding = (key: SpriteKey, style: StyleId): GameNeeds[] =>
  GAMES.filter((g) => gamePoses(g, style).includes(key));
