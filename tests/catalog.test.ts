/* Le catalogue couvre les besoins des jeux : chaque pose demandée par un jeu (games/*.json) a sa fiche,
   avec une description pour le prompt. Sinon l'atelier afficherait une pose impossible à générer. */
import { describe, expect, it } from 'vitest';
import { GAMES, STYLE_IDS, gamePoses } from '../src/catalog/needs';
import { buildPrompt } from '../src/catalog/prompts';
import { makeCharacter } from '../src/catalog/roster';
import { SPRITE_BY_KEY } from '../src/catalog/sprite-poses';

describe('catalogue des poses', () => {
  it('au moins un jeu utilise la banque', () => {
    expect(GAMES.length).toBeGreaterThan(0);
  });

  for (const game of GAMES) {
    it(`${game.label} : chaque pose demandée existe dans le catalogue et a un prompt`, () => {
      for (const style of [undefined, ...Object.keys(game.styles ?? {})]) {
        for (const key of gamePoses(game, style ?? '')) {
          expect(SPRITE_BY_KEY[key], `${style ?? 'commune'} : ${key}`).toBeDefined();
          const char = makeCharacter({ id: 't', name: 'TEST', style: style ?? STYLE_IDS[0]!, color: '#fff' });
          if (!SPRITE_BY_KEY[key].stage) expect(buildPrompt(char, key).length, key).toBeGreaterThan(100);
        }
      }
    });
  }
});
