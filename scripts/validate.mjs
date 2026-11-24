/* Vérifie la banque avant chaque nouvelle version : index.json liste des personnages qui existent,
   chaque fiche character.json est lisible et chaque image qu'elle cite est présente (et inversement).
   Sans dépendance : node scripts/validate.mjs */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const CHARACTERS = join(ROOT, 'characters');
/** Images acceptées dans un dossier de personnage. */
const IMAGE = /\.(webp|png|jpe?g)$/i;
/** Au-delà, une image est probablement restée en grand format par erreur (octets). */
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

const errors = [];
const warnings = [];

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    errors.push(`${path} : JSON illisible (${e.message})`);
    return null;
  }
}

function checkCharacter(id) {
  const dir = join(CHARACTERS, id);
  if (!existsSync(dir)) return errors.push(`${id} : listé dans index.json mais dossier absent`);
  const file = readJson(join(dir, 'character.json'));
  if (!file) return;
  if (file.id !== id) errors.push(`${id} : character.json annonce l'id « ${file.id} »`);
  if (!file.name) errors.push(`${id} : nom manquant`);
  const cited = new Set(Object.values(file.files ?? {}));
  for (const name of cited) {
    if (!existsSync(join(dir, name))) errors.push(`${id} : image citée absente : ${name}`);
  }
  for (const name of readdirSync(dir)) {
    if (!IMAGE.test(name)) continue;
    if (!cited.has(name)) warnings.push(`${id} : image non citée dans character.json : ${name}`);
    if (statSync(join(dir, name)).size > MAX_IMAGE_BYTES)
      warnings.push(`${id} : image très lourde : ${name}`);
  }
}

const index = readJson(join(CHARACTERS, 'index.json'));
if (!Array.isArray(index)) {
  errors.push('characters/index.json doit être une liste d’identifiants');
} else {
  if (new Set(index).size !== index.length) errors.push('identifiant en double dans characters/index.json');
  for (const id of index) checkCharacter(id);
  for (const folder of readdirSync(CHARACTERS)) {
    if (statSync(join(CHARACTERS, folder)).isDirectory() && !index.includes(folder))
      warnings.push(`${folder} : dossier absent de characters/index.json`);
  }
  console.log(`characters : ${index.length} personnages`);
}

for (const w of warnings) console.warn(`⚠ ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`✗ ${e}`);
  process.exit(1);
}
console.log('✓ banque valide');
