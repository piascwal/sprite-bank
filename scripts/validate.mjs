/* Vérifie la banque avant chaque nouvelle version : chaque collection liste des personnages qui existent,
   chaque fiche character.json est lisible et chaque image qu'elle cite est présente (et inversement).
   Sans dépendance : node scripts/validate.mjs */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const COLLECTIONS = join(ROOT, 'collections');
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

function checkCharacter(collection, id) {
  const dir = join(COLLECTIONS, collection, id);
  if (!existsSync(dir)) return errors.push(`${collection}/${id} : listé dans index.json mais dossier absent`);
  const file = readJson(join(dir, 'character.json'));
  if (!file) return;
  if (file.id !== id) errors.push(`${collection}/${id} : character.json annonce l'id « ${file.id} »`);
  if (!file.name) errors.push(`${collection}/${id} : nom manquant`);
  const cited = new Set(Object.values(file.files ?? {}));
  for (const name of cited) {
    if (!existsSync(join(dir, name))) errors.push(`${collection}/${id} : image citée absente : ${name}`);
  }
  for (const name of readdirSync(dir)) {
    if (!IMAGE.test(name)) continue;
    if (!cited.has(name)) warnings.push(`${collection}/${id} : image non citée dans character.json : ${name}`);
    if (statSync(join(dir, name)).size > MAX_IMAGE_BYTES) warnings.push(`${collection}/${id} : image très lourde : ${name}`);
  }
}

for (const collection of readdirSync(COLLECTIONS)) {
  const index = readJson(join(COLLECTIONS, collection, 'index.json'));
  if (!Array.isArray(index)) {
    errors.push(`${collection} : index.json doit être une liste d'identifiants`);
    continue;
  }
  if (new Set(index).size !== index.length) errors.push(`${collection} : identifiant en double dans index.json`);
  for (const id of index) checkCharacter(collection, id);
  const folders = readdirSync(join(COLLECTIONS, collection)).filter((n) =>
    statSync(join(COLLECTIONS, collection, n)).isDirectory(),
  );
  for (const folder of folders) {
    if (!index.includes(folder)) warnings.push(`${collection}/${folder} : dossier absent de index.json`);
  }
  console.log(`${collection} : ${index.length} personnages`);
}

for (const w of warnings) console.warn(`⚠ ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`✗ ${e}`);
  process.exit(1);
}
console.log('✓ banque valide');
