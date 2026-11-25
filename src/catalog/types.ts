/* Modèle de données de la banque : un personnage (ses images vivent dans characters/<id>/) et les besoins
   des jeux qui l'utilisent. Aucune règle de jeu ici : un « style » n'est qu'un identifiant défini par un
   jeu (Fighting Friends : ses styles de combat), qui décide des images propres à demander. */
import type { SpriteKey } from './sprite-poses';

export type StyleId = string;

/** Accessoire d'un style, pour les prompts des images communes (garde, marche, coups de base…). */
export interface StyleGear {
  /** Phrase ajoutée aux poses qui n'ont pas de description propre : comment l'accessoire est tenu. */
  hold: string;
  /** Description complète, à la place de celle de la pose commune, quand l'accessoire change la posture. */
  poses?: Partial<Record<SpriteKey, string>>;
}

/** Un style d'un jeu : ses images propres, et l'accessoire à faire apparaître sur les autres. */
export interface GameStyle {
  label: string;
  hint?: string;
  archetype?: string;
  tags?: string[];
  poses: SpriteKey[];
  gear?: StyleGear;
  /** Animal de compagnie : image au repos et pose de victoire « dans les bras ». */
  companion?: { idle: SpriteKey; win: SpriteKey };
}

/** Fichier games/<jeu>.json : ce dont un jeu a besoin, publié par le jeu lui-même. */
export interface GameNeeds {
  game: string;
  label: string;
  /** Poses demandées à tous les personnages utilisés par ce jeu. */
  common: SpriteKey[];
  /** Poses propres à un style (champ « style » du character.json). */
  styles?: Record<StyleId, GameStyle>;
  /** Objets de décor demandés (props/) : identifiants, catégories, ou « * » pour tous. */
  props?: string[];
  /** Ennemis, PNJ et boss demandés (npcs/) : identifiants, catégories, ou « * » pour tous. */
  npcs?: string[];
}

/** Apparence du pantin (mannequin guide, et vignette d'un personnage sans image). */
export interface Look {
  /** Taille relative (1 = standard). */
  h: number;
  /** Corpulence relative. */
  bulk: number;
  head?: number;
  skin: string;
  hair: 'spiky' | 'ponytail' | 'long' | 'mohawk' | 'hood' | 'short' | 'bald';
  hairCol: string;
  beard?: string;
  top: string;
  sleeve: 'none' | 'short' | 'long';
  outfit: 'gi' | 'stripe' | 'emblem' | 'none';
  pants: string;
  shorts?: boolean;
  belt: string;
  band?: string;
  scarf?: string;
  glove?: string;
  shoe?: string;
  accent: string;
}

/** Ce qu'on écrit pour déclarer un personnage (contenu utile de son character.json). */
export interface CharacterDef {
  id: string;
  name: string;
  style: StyleId;
  color: string;
  title?: string;
  quote?: string;
  /** Taille relative (1 = normale, voir SIZES). */
  size?: number;
  /** Créé dans l'atelier, pas encore dans la banque. */
  custom?: boolean;
  /** Présent dans la banque (characters/). */
  repo?: boolean;
}

/** Personnage de l'atelier : sa définition complétée par son style et son pantin. */
export interface Character {
  id: string;
  name: string;
  color: string;
  styleId: StyleId;
  /** Le style tel que le décrit le jeu qui le définit (vide si aucun jeu ne le connaît). */
  style: GameStyle;
  look: Look;
  title: string;
  quote: string;
  size: number;
  custom: boolean;
  repo: boolean;
}
