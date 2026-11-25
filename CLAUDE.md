# Consignes pour les agents

- Lire `README.md` avant toute modification.
- La banque ne contient que des images, leurs fiches et l'atelier : aucun réglage de gameplay propre à un jeu
  (les besoins d'un jeu sont publiés par le jeu lui-même dans `games/<jeu>.json`).
- Toute modification se termine par `npm run check` (images et fiches, types, lint, tests) et `npm run format`.
- Ne jamais changer la structure des dossiers ni renommer un champ de `character.json` sans augmenter
  `major` dans `format.json` : les jeux suivent « la dernière » version de leur numéro majeur et casseraient.
- Une nouvelle pose s'ajoute au catalogue (`src/catalog/`) avec sa description pour le prompt ; le test
  `tests/catalog.test.ts` vérifie que chaque pose demandée par un jeu y figure.
- Un nouveau personnage s'ajoute à `characters/index.json` ; un nouvel objet de décor à `props/index.json`, avec
  sa fiche `prop.json` (nom, catégorie, largeur relative, images).
- Textes et commentaires en français.
