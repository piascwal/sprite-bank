/* Vérifie la banque avant chaque nouvelle version :
   - personnages (characters/) : index.json liste des personnages qui existent, chaque fiche character.json
     est lisible et chaque image qu'elle cite est présente (et inversement) ;
   - objets de décor (props/) : index.json liste des objets qui existent, chaque fiche prop.json a un nom,
     une catégorie, une largeur et des images présentes ;
   - ennemis, PNJ et boss (npcs/) : de même, avec une hauteur ou une largeur, et pour chaque variante une
     image source ou une planche d'animation (dont la description tient dans la planche).
   Sans dépendance : node scripts/validate.mjs */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const CHARACTERS = join(ROOT, 'characters');
const PROPS = join(ROOT, 'props');
const NPCS = join(ROOT, 'npcs');
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

function checkProp(id) {
  const dir = join(PROPS, id);
  if (!existsSync(dir)) return errors.push(`objet ${id} : listé dans props/index.json mais dossier absent`);
  const prop = readJson(join(dir, 'prop.json'));
  if (!prop) return;
  if (prop.id !== id) errors.push(`objet ${id} : prop.json annonce l'id « ${prop.id} »`);
  if (!prop.name || !prop.category) errors.push(`objet ${id} : nom ou catégorie manquant`);
  if (!(prop.width > 0)) errors.push(`objet ${id} : largeur manquante`);
  if (!Array.isArray(prop.files) || !prop.files.length) return errors.push(`objet ${id} : aucune image`);
  for (const name of prop.files) {
    if (!existsSync(join(dir, name))) errors.push(`objet ${id} : image citée absente : ${name}`);
  }
  for (const name of readdirSync(dir)) {
    if (IMAGE.test(name) && !prop.files.includes(name))
      warnings.push(`objet ${id} : image non citée dans prop.json : ${name}`);
  }
}

if (existsSync(PROPS)) {
  const props = readJson(join(PROPS, 'index.json'));
  if (!Array.isArray(props)) errors.push('props/index.json doit être une liste d’identifiants');
  else {
    if (new Set(props).size !== props.length) errors.push('identifiant en double dans props/index.json');
    for (const id of props) checkProp(id);
    console.log(`props : ${props.length} objets de décor`);
  }
}

function checkNpc(id) {
  const dir = join(NPCS, id);
  if (!existsSync(dir)) return errors.push(`PNJ ${id} : listé dans npcs/index.json mais dossier absent`);
  const npc = readJson(join(dir, 'npc.json'));
  if (!npc) return;
  if (npc.id !== id) errors.push(`PNJ ${id} : npc.json annonce l'id « ${npc.id} »`);
  if (!npc.name || !npc.category) errors.push(`PNJ ${id} : nom ou catégorie manquant`);
  if (!(npc.height > 0) && !(npc.width > 0)) errors.push(`PNJ ${id} : ni hauteur ni largeur`);
  if (!Array.isArray(npc.variants) || !npc.variants.length) return errors.push(`PNJ ${id} : aucune variante`);
  const cited = new Set();
  npc.variants.forEach((v, i) => {
    if (!v.image && !v.animation) errors.push(`PNJ ${id} : variante ${i + 1} sans image`);
    for (const name of [v.image, v.animation?.sheet].filter(Boolean)) {
      cited.add(name);
      if (!existsSync(join(dir, name))) errors.push(`PNJ ${id} : image citée absente : ${name}`);
    }
    const a = v.animation;
    if (a && !(a.frameWidth > 0 && a.frameHeight > 0 && Array.isArray(a.animations) && a.animations.length))
      errors.push(`PNJ ${id} : animation de la variante ${i + 1} mal décrite`);
  });
  for (const name of readdirSync(dir)) {
    if (IMAGE.test(name) && !cited.has(name))
      warnings.push(`PNJ ${id} : image non citée dans npc.json : ${name}`);
  }
}

if (existsSync(NPCS)) {
  const npcs = readJson(join(NPCS, 'index.json'));
  if (!Array.isArray(npcs)) errors.push('npcs/index.json doit être une liste d’identifiants');
  else {
    if (new Set(npcs).size !== npcs.length) errors.push('identifiant en double dans npcs/index.json');
    for (const id of npcs) checkNpc(id);
    console.log(`npcs : ${npcs.length} ennemis, PNJ et boss`);
  }
}

for (const w of warnings) console.warn(`⚠ ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`✗ ${e}`);
  process.exit(1);
}
console.log('✓ banque valide');
