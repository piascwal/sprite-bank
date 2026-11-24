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

- **Personnages** (`characters/`) : pixel art 32 bits détaillé, utilisés par Fighting Friends et par les
  futurs jeux qui reprennent ces personnages.
- **Objets de décor** (`props/`, à venir) : ceux de DKK (arbres, barils, barrières…), pour être réutilisés
  par d'autres jeux. Les personnages de DKK, eux, restent dans DKK.

## Contenu

```
characters/                  personnages, pixel art 32 bits détaillé
  index.json                 liste des identifiants, dans l'ordre d'affichage
  <id>/character.json        fiche : nom, couleur, taille, style, fichier de chaque pose, réglages
  <id>/<pose>.webp           une image par pose (fond transparent, détourée)
format.json                  version du format des fichiers (numéro majeur des versions)
scripts/validate.mjs         vérification de la banque (lancée avant chaque version)
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

Le jeu déclare le dossier et la version qu'il veut (exemple de Fighting Friends, `sprites.json`) :

```json
{ "repo": "https://github.com/piascwal/sprite-bank", "path": "characters", "version": "v2" }
```

Un script de construction (`npm run sprites` dans Fighting Friends) trouve le tag correspondant
(`v2` = le plus récent des `v2.x`), le télécharge et copie le dossier demandé dans le jeu. Le dossier copié
n'est pas versionné dans le dépôt du jeu : il est refait à chaque construction.

## Ajouter ou modifier des sprites

Pour l'instant, l'écran **Personnages & sprites** de Fighting Friends sert d'atelier : prompts, mannequins
guides, import, réglages. Son export (`.zip`, un dossier par personnage) se dépose dans
`characters/`. Un nouveau personnage s'ajoute aussi à `index.json`.

Une fois la banque à jour sur `main`, relancer la construction du jeu (onglet **Actions** du dépôt du jeu,
**Run workflow**) pour qu'il récupère la nouvelle version.
