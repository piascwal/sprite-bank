/* La liste des personnages de l'atelier, en mémoire : ceux de la banque (characters/), puis ceux créés dans
   l'atelier sur cet appareil et pas encore envoyés. */
import { styleOf, STYLE_IDS } from './needs';
import type { Character, CharacterDef, Look, StyleId } from './types';

/** Tailles proposées à la création d'un personnage. */
export const SIZES = [
  { value: 0.8, label: 'Petit' },
  { value: 1, label: 'Normal' },
  { value: 1.12, label: 'Grand' },
] as const;

/** Taille ramenée aux bornes prévues (une valeur absente ou invalide vaut « normal »). */
export const clampSize = (size: number | undefined): number =>
  typeof size === 'number' && size >= 0.7 && size <= 1.3 ? size : 1;

/** Pantin neutre, à la couleur du personnage : vignette d'une pose qui n'a pas encore d'image. */
const lookFor = (color: string): Look => ({
  h: 1,
  bulk: 1,
  skin: '#e8b48a',
  hair: 'short',
  hairCol: '#3a2a1e',
  top: color,
  sleeve: 'short',
  outfit: 'none',
  pants: '#2b3a5a',
  belt: '#1d1b26',
  shoe: '#1d1b26',
  accent: color,
});

export function makeCharacter(def: CharacterDef): Character {
  const styleId = def.style || STYLE_IDS[0] || '';
  return {
    id: def.id,
    name: def.name,
    color: def.color,
    styleId,
    style: styleOf(styleId),
    look: lookFor(def.color),
    title: def.title ?? 'Nouveau challenger',
    quote: def.quote ?? 'À qui le tour ?',
    size: clampSize(def.size),
    custom: def.custom ?? false,
    repo: def.repo ?? false,
  };
}

/** Rempli au démarrage : personnages de la banque, puis ceux créés sur cet appareil. */
export const roster: Character[] = [];

export const characterById = (id: string): Character | undefined => roster.find((c) => c.id === id);

/** Personnages qui utilisent ce style (sauf `except`) : pour éviter d'avoir deux fois le même. */
export function styleUsers(style: StyleId, except?: Character): Character[] {
  return roster.filter((c) => c.styleId === style && c !== except);
}

/** Ajoute un personnage, ou remplace celui qui porte déjà cet identifiant. */
export function addCharacter(def: CharacterDef): Character {
  const char = makeCharacter(def);
  const index = roster.findIndex((c) => c.id === char.id);
  if (index >= 0) roster[index] = char;
  else roster.push(char);
  return char;
}

export function removeCharacter(char: Character): void {
  const index = roster.indexOf(char);
  if (index >= 0) roster.splice(index, 1);
}

/** Change le style d'un personnage (ses images déjà fournies sont conservées). */
export function restyleCharacter(char: Character, style: StyleId): void {
  char.styleId = style;
  char.style = styleOf(style);
  char.look = lookFor(char.color);
}
