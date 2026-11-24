# Sprite Bank

Banque de sprites partagée entre les jeux : les images des personnages, rangées par **collection**
(une direction artistique), versionnées, et récupérées par chaque jeu au moment de sa construction.

## Principe

- La banque ne contient que des **images et leurs fiches** (`character.json`), rien de propre au gameplay
  d'un jeu : les coups, zones de frappe ou styles de combat restent dans chaque jeu.
- **Chaque jeu embarque une copie figée** d'une version de la banque. Une erreur dans la banque ne casse
  donc aucun jeu déjà publié, et un jeu ne reçoit les nouveautés qu'à sa prochaine construction.
- Une pose générée une fois sert à tous les jeux de la même collection.

## Usage prévu

- **Personnages** : la collection `fighting-friends` sert à Fighting Friends et aux futurs jeux qui
  reprennent ses personnages (même direction artistique).
- **Objets de décor** (à venir) : ceux de DKK (arbres, barils, barrières…), dans une collection à part, pour
  être réutilisés par d'autres jeux. Les personnages de DKK, eux, restent dans DKK.

## Contenu

```
collections/
  fighting-friends/          pixel art 32 bits détaillé (jeu Fighting Friends)
    index.json               liste des identifiants des personnages, dans l'ordre d'affichage
    <id>/character.json      fiche : nom, couleur, taille, style, fichier de chaque pose, réglages
    <id>/<pose>.webp         une image par pose (fond transparent, détourée)
format.json                  version du format des fichiers (numéro majeur des versions)
scripts/validate.mjs         vérification de la banque (lancée avant chaque version)
```

Le format d'une collection est celui de `public/assets/characters/` de Fighting Friends : un dossier par
personnage, prêt à copier tel quel.

## Versions

À chaque changement sur `main`, l'automatisme **Vérifier et versionner** contrôle la banque
(`node scripts/validate.mjs`) puis pose le tag suivant : `v1.0`, `v1.1`, `v1.2`…

- Un ajout ou une retouche (nouvelle pose, nouveau personnage, image refaite) donne une **version
  mineure** : les jeux qui suivent « la dernière v1 » la récupèrent à leur prochaine construction.
- Un changement de format qui casserait les jeux (dossiers réorganisés, champs renommés) passe par une
  **nouvelle version majeure** (`major` dans `format.json`) : chaque jeu reste en v1 tant qu'il n'a pas été
  migré.
- Un jeu peut aussi se figer sur une version exacte (`v1.4`) si une nouveauté lui pose problème.

## Utiliser la banque dans un jeu

Le jeu déclare la collection et la version qu'il veut (exemple de Fighting Friends, `sprites.json`) :

```json
{ "repo": "https://github.com/piascwal/sprite-bank", "collection": "fighting-friends", "version": "v1" }
```

Un script de construction (`npm run sprites` dans Fighting Friends) trouve le tag correspondant
(`v1` = le plus récent des `v1.x`), le télécharge et copie la collection dans le jeu. Le dossier copié
n'est pas versionné dans le dépôt du jeu : il est refait à chaque construction.

## Ajouter ou modifier des sprites

Pour l'instant, l'écran **Personnages & sprites** de Fighting Friends sert d'atelier : prompts, mannequins
guides, import, réglages. Son export (`.zip`, un dossier par personnage) se dépose dans
`collections/fighting-friends/`. Un nouveau personnage s'ajoute aussi à `index.json`.

Une fois la banque à jour sur `main`, relancer la construction du jeu (onglet **Actions** du dépôt du jeu,
**Run workflow**) pour qu'il récupère la nouvelle version.
