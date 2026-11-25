/* Copie dans un jeu les seules images dont il a besoin, d'après ses besoins (games/<jeu>.json) :
   pour chaque personnage, les poses communes du jeu, plus celles du style du personnage (et son animal).
   Les fiches copiées ne citent que ces images. Appelé par les jeux depuis la version qu'ils ont téléchargée :
     node scripts/copy-for-game.mjs <jeu> <dossier des personnages> [<dossier des objets de décor>]
   Objets de décor : un jeu qui en veut les liste dans ses besoins (`props` : identifiants, catégories, ou
   « * » pour tous) ; ils sont copiés dans le troisième dossier, avec leur props/index.json.
   Sans dépendance, pour qu'un jeu n'ait rien à installer. */
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const CHARACTERS = join(ROOT, 'characters');
const PROPS = join(ROOT, 'props');

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

/** Poses demandées par ce jeu à un personnage de ce style. */
function wantedPoses(needs, style) {
  const own = needs.styles?.[style];
  const companion = own?.companion ? [own.companion.idle, own.companion.win] : [];
  return new Set([...needs.common, ...(own?.poses ?? []), ...companion]);
}

/** Ne garde, dans une table « pose → valeur », que les poses demandées. */
const keep = (table, wanted) =>
  table && Object.fromEntries(Object.entries(table).filter(([key]) => wanted.has(key)));

/** Copie, pour les besoins d'un jeu (contenu d'un games/<jeu>.json), dans `dest`. */
export function copyForNeeds(needs, dest) {
  const ids = readJson(join(CHARACTERS, 'index.json'));
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true });
  let copied = 0;
  let skipped = 0;
  for (const id of ids) {
    const file = readJson(join(CHARACTERS, id, 'character.json'));
    const wanted = wantedPoses(needs, file.style ?? file.template);
    const files = keep(file.files, wanted) ?? {};
    mkdirSync(join(dest, id), { recursive: true });
    for (const name of Object.values(files)) copyFileSync(join(CHARACTERS, id, name), join(dest, id, name));
    copied += Object.keys(files).length;
    skipped += Object.keys(file.files ?? {}).length - Object.keys(files).length;
    const out = { ...file, files, adjust: keep(file.adjust, wanted) };
    writeFileSync(join(dest, id, 'character.json'), `${JSON.stringify(out, null, 2)}\n`);
  }
  writeFileSync(join(dest, 'index.json'), `${JSON.stringify(ids)}\n`);
  return { characters: ids.length, copied, skipped };
}

/** Copie les objets de décor demandés (`needs.props` : identifiants, catégories, ou « * »). */
export function copyPropsForNeeds(needs, dest) {
  const wanted = new Set(needs.props ?? []);
  const ids = readJson(join(PROPS, 'index.json')).filter((id) => {
    const prop = readJson(join(PROPS, id, 'prop.json'));
    return wanted.has('*') || wanted.has(id) || wanted.has(prop.category);
  });
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true });
  let copied = 0;
  for (const id of ids) {
    const prop = readJson(join(PROPS, id, 'prop.json'));
    mkdirSync(join(dest, id), { recursive: true });
    copyFileSync(join(PROPS, id, 'prop.json'), join(dest, id, 'prop.json'));
    for (const name of prop.files) copyFileSync(join(PROPS, id, name), join(dest, id, name));
    copied += prop.files.length;
  }
  writeFileSync(join(dest, 'index.json'), `${JSON.stringify(ids)}\n`);
  return { props: ids.length, copied };
}

const readNeeds = (game) => {
  const needsPath = join(ROOT, 'games', `${game}.json`);
  if (!existsSync(needsPath)) throw new Error(`Besoins du jeu « ${game} » absents : ${needsPath}`);
  return readJson(needsPath);
};

export function copyForGame(game, dest) {
  return copyForNeeds(readNeeds(game), dest);
}

export function copyPropsForGame(game, dest) {
  return copyPropsForNeeds(readNeeds(game), dest);
}

// lancé en ligne de commande (et non importé)
if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  const [game, dest, propsDest] = process.argv.slice(2);
  if (!game || !dest)
    throw new Error('Usage : node scripts/copy-for-game.mjs <jeu> <dossier de destination>');
  const { characters, copied, skipped } = copyForGame(game, dest);
  console.log(
    `${game} : ${characters} personnages, ${copied} images copiées, ${skipped} non demandées laissées`,
  );
  if (propsDest) {
    const props = copyPropsForGame(game, propsDest);
    console.log(`${game} : ${props.props} objets de décor, ${props.copied} images copiées`);
  }
}
