# Sprite Bank

Banque de sprites partagée entre les jeux : les images des personnages (et bientôt des objets de décor),
versionnées, et récupérées par chaque jeu au moment de sa construction. Les dossiers sont rangés par type
d'image, jamais par jeu : un même sprite sert à tous les jeux.

## Principe

- La banque ne contient que des **images et leurs fiches** (`character.json`), rien de propre au gameplay
  d'un jeu : les coups, zones de frappe ou styles de combat restent dans chaque jeu.
- **Chaque jeu embarque une copie figée** d'une version de la banque. Une erreur dans la banque ne casse
  donc aucun jeu déjà publié, et un jeu ne reçoit les nouveautés qu'à sa prochaine construction.
- Une pose générée une fois sert à tous les jeux.

## Usage prévu

- **Personnages** (`characters/`) : pixel art 32 bits détaillé, utilisés par Fighting Friends, Foot Friends
  (foot en un contre un) et les futurs jeux qui reprennent ces personnages.
- **Objets de décor** (`props/`, à venir) : ceux de DKK (arbres, barils, barrières…), pour être réutilisés
  par d'autres jeux. Les personnages de DKK, eux, restent dans DKK.

## Contenu

```
characters/                  personnages, pixel art 32 bits détaillé
  index.json                 liste des identifiants, dans l'ordre d'affichage
  <id>/character.json        fiche : nom, couleur, taille, style, fichier de chaque pose, réglages
  <id>/<pose>.webp           une image par pose (fond transparent, détourée)
games/<jeu>.json             besoins d'un jeu : poses communes, poses et accessoire de chaque style
                             (publié par le jeu lui-même, ex. `npm run needs` dans Fighting Friends)
format.json                  version du format des fichiers (numéro majeur des versions)
scripts/validate.mjs         vérification des images et des fiches (lancée avant chaque version)
scripts/copy-for-game.mjs    copie dans un jeu des seules images qu'il demande
src/                         l'atelier (catalogue des poses, prompts, mannequins guides, import, export)
tests/                       le catalogue couvre bien les besoins de chaque jeu
```

Le format de `characters/` est celui de `public/assets/characters/` de Fighting Friends : un dossier par
personnage, prêt à copier tel quel.

## Versions

À chaque changement sur `main`, l'automatisme **Vérifier et versionner** contrôle la banque
(`node scripts/validate.mjs`) puis pose le tag suivant : `v2.0`, `v2.1`, `v2.2`…

Historique du format : **v1** rangeait les personnages dans `collections/fighting-friends/` ; **v2** les
range dans `characters/` (les dossiers ne portent plus le nom d'un jeu).

- Un ajout ou une retouche (nouvelle pose, nouveau personnage, image refaite) donne une **version
  mineure** : les jeux qui suivent « la dernière v2 » la récupèrent à leur prochaine construction.
- Un changement de format qui casserait les jeux (dossiers réorganisés, champs renommés) passe par une
  **nouvelle version majeure** (`major` dans `format.json`) : chaque jeu reste sur son numéro majeur tant qu'il n'a pas été
  migré.
- Un jeu peut aussi se figer sur une version exacte (`v2.4`) si une nouveauté lui pose problème.

## Utiliser la banque dans un jeu

Le jeu déclare la version qu'il veut et son nom de jeu (exemple de Fighting Friends, `sprites.json`) :

```json
{ "repo": "https://github.com/piascwal/sprite-bank", "game": "fighting-friends", "version": "v2" }
```

Un script de construction (`npm run sprites` dans Fighting Friends) trouve le tag correspondant
(`v2` = le plus récent des `v2.x`), le télécharge, puis lance le script de la banque de cette version :

```bash
node scripts/copy-for-game.mjs <jeu> <dossier de destination>
```

Il ne copie que les images **demandées par ce jeu** (`games/<jeu>.json`) : pour chaque personnage, les poses
communes du jeu, plus celles de son style. Un jeu qui ne demande que les portraits ne reçoit que les
portraits. Les fiches copiées ne citent que ces images. Le dossier copié n'est pas versionné dans le dépôt
du jeu : il est refait à chaque construction.

## L'atelier

L'atelier est publié sur **https://piascwal.github.io/sprite-bank/**. Pour chaque personnage, il montre les
images de la banque, ce qui manque **jeu par jeu** (« Fighting Friends : 26 / 28 »), le prompt de chaque
pose, le mannequin guide, et permet d'importer, régler et exporter.

Les images importées restent sur l'appareil (marquées ✎ À ENVOYER) jusqu'à l'export : **Exporter les
changements** pour un personnage, ou **Export en masse** pour tout choisir d'un coup. Le `.zip` se dépose
dans `characters/` (un dossier par personnage ; un nouveau personnage s'ajoute aussi à `index.json`).

Une fois la banque à jour sur `main`, relancer la construction des jeux concernés (onglet **Actions** du
dépôt du jeu, **Run workflow**) pour qu'ils récupèrent la nouvelle version.

## Une nouvelle pose pour un jeu

1. Le catalogue (`src/catalog/sprite-poses.ts` ou `special-poses.ts`) reçoit la pose : nom, description
   pour le prompt, posture du mannequin guide.
2. Le jeu l'ajoute à ses besoins (`games/<jeu>.json`) et l'utilise dans son code.
3. Dans l'atelier, la pose apparaît comme manquante pour ce jeu : générer, importer, exporter.

Les autres jeux ne sont pas touchés : ils ne copient que les poses qu'ils demandent.

## Développer l'atelier

```bash
npm install
npm run dev        # atelier sur http://localhost:5173 (lit characters/ et games/ directement)
npm run check      # images et fiches + types + lint + tests
```
