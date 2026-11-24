/* Personnages créés par le joueur et réglages qu'il a modifiés, enregistrés sur l'appareil ;
   export d'un personnage en .zip prêt à déposer dans la banque (characters/). */
import { characterById, addCharacter, clampSize, restyleCharacter, roster } from '../catalog/roster';
import { SPRITE_BY_KEY, type SpriteKey } from '../catalog/sprite-poses';
import { STYLES } from '../catalog/needs';
import type { Character, StyleId } from '../catalog/types';
import { encodeImage, extensionOf } from './image-codec';
import { spriteEntries, type SpriteAdjust } from './sprite-store';
import { buildZip, type ZipFile } from './zip';

const CUSTOM_KEY = 'ff-custom-chars';
const OVERRIDES_KEY = 'ff-char-overrides';

/** Contenu d'un fichier character.json (dans le dépôt ou dans un export). */
export interface CharacterFile {
  id?: string;
  name?: string;
  style?: StyleId;
  /** Ancien nom du champ `style`. */
  template?: StyleId;
  color?: string;
  /** Taille relative (1 = normale). */
  size?: number;
  title?: string;
  quote?: string;
  /** Fichier de chaque image (`{ "idle": "idle.webp" }`). Ancien format : liste de poses en .png. */
  files?: Partial<Record<SpriteKey, string>>;
  sprites?: SpriteKey[];
  adjust?: Partial<Record<SpriteKey, SpriteAdjust>>;
  /** Date de l'export (ms) : une image importée sur l'appareil après cette date reste prioritaire. */
  updated?: number;
  /** Export des changements seulement : poses dont l'image ou le réglage a changé sur l'appareil. */
  changes?: { images: SpriteKey[]; adjust: SpriteKey[] };
}

/** Ce que le joueur a changé sur un personnage qu'il n'a pas créé lui-même (style, couleur). */
interface Override {
  style?: StyleId;
  color?: string;
  size?: number;
}

export function readJson<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '') as T;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // stockage indisponible : le réglage reste valable pour cette session
  }
}

export function loadCustomCharacters(): void {
  for (const file of readJson<CharacterFile[]>(CUSTOM_KEY, [])) {
    if (!file.id || !file.name || characterById(file.id)) continue;
    addCharacter({
      id: file.id,
      name: file.name,
      style: file.style ?? file.template ?? 'balanced',
      color: file.color ?? '#ff3d7f',
      size: file.size,
      custom: true,
    });
  }
}

export function saveCustomCharacters(): void {
  const list = roster
    .filter((c) => c.custom && !c.repo)
    .map((c) => ({ id: c.id, name: c.name, style: c.styleId, color: c.color, size: c.size }));
  writeJson(CUSTOM_KEY, list);
}

export function setOverride(id: string, override: Override): void {
  const all = readJson<Record<string, Override>>(OVERRIDES_KEY, {});
  all[id] = { ...all[id], ...override };
  writeJson(OVERRIDES_KEY, all);
}

/** Applique les styles et couleurs modifiés par le joueur (à appeler une fois tous les personnages chargés). */
export function applyOverrides(): void {
  for (const [id, override] of Object.entries(readJson<Record<string, Override>>(OVERRIDES_KEY, {}))) {
    const char = characterById(id);
    if (!char) continue;
    if (override.color) char.color = override.color;
    if (override.size) char.size = clampSize(override.size);
    if (override.style && STYLES[override.style]) restyleCharacter(char, override.style);
  }
}

/** Enregistre le style et la couleur d'un personnage, quelle que soit son origine. */
export function saveCharacterSettings(char: Character): void {
  if (char.custom && !char.repo) saveCustomCharacters();
  else setOverride(char.id, { style: char.styleId, color: char.color, size: char.size });
}

/** Fichiers du dossier complet d'un personnage (`<id>/character.json` + toutes ses images). */
export async function characterZipFiles(char: Character): Promise<ZipFile[]> {
  const zipFiles: ZipFile[] = [];
  const files: CharacterFile['files'] = {};
  const adjust: CharacterFile['adjust'] = {};
  for (const [key, entry] of spriteEntries(char.id)) {
    // le fichier compressé d'origine est repris tel quel : aucune perte supplémentaire
    const blob = entry.blob ?? (await encodeImage(entry.img, SPRITE_BY_KEY[key].stage ? 'stage' : 'sprite'));
    const name = `${key}.${extensionOf(blob)}`;
    zipFiles.push({ name: `${char.id}/${name}`, data: new Uint8Array(await blob.arrayBuffer()) });
    files[key] = name;
    adjust[key] = entry.adj;
  }
  const manifest: CharacterFile = {
    id: char.id,
    name: char.name,
    style: char.styleId,
    color: char.color,
    size: char.size,
    title: char.title,
    quote: char.quote,
    files,
    adjust,
    updated: Date.now(),
  };
  zipFiles.unshift({
    name: `${char.id}/character.json`,
    data: new TextEncoder().encode(JSON.stringify(manifest, null, 2)),
  });
  return zipFiles;
}

/** Télécharge `<id>.zip` : le dossier à déposer dans characters/ (banque). */
export async function exportCharacterZip(char: Character): Promise<void> {
  downloadZip(await characterZipFiles(char), `${char.id}.zip`);
}

/** Propose le téléchargement d'un .zip. */
export function downloadZip(zipFiles: ZipFile[], fileName: string): void {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(buildZip(zipFiles));
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 5000);
}
