# Consignes pour les agents

- Lire `README.md` avant toute modification.
- La banque ne contient que des images et leurs fiches : aucun réglage de gameplay propre à un jeu.
- Toute modification se termine par `node scripts/validate.mjs`, qui doit passer.
- Ne jamais changer la structure des dossiers ni renommer un champ de `character.json` sans augmenter
  `major` dans `format.json` : les jeux suivent « la dernière » version de leur numéro majeur et casseraient.
- Un nouveau personnage s’ajoute à `characters/index.json`.
- Textes et commentaires en français.
