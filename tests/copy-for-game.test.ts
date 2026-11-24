/* Un jeu ne reçoit que les images qu'il demande : les autres restent dans la banque. */
import { existsSync, mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { copyForGame, copyForNeeds } from '../scripts/copy-for-game.mjs';

const tmp = () => mkdtempSync(join(tmpdir(), 'copie-'));
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'));

describe('copie pour un jeu', () => {
  it('un jeu qui ne demande que les portraits ne reçoit que les portraits', () => {
    const dest = tmp();
    const result = copyForNeeds({ game: 'quiz', label: 'Quiz', common: ['portrait'] }, dest);
    expect(result.characters).toBeGreaterThan(0);
    for (const id of read(join(dest, 'index.json')) as string[]) {
      const images = readdirSync(join(dest, id)).filter((n) => n !== 'character.json');
      expect(
        images.every((n) => n.startsWith('portrait')),
        id,
      ).toBe(true);
      expect(Object.keys(read(join(dest, id, 'character.json')).files)).toEqual(
        images.length ? ['portrait'] : [],
      );
    }
  });

  it('les images propres à un style ne vont qu’aux personnages de ce style', () => {
    const dest = tmp();
    copyForNeeds(
      { game: 't', label: 'T', common: ['idle'], styles: { hockey: { label: 'H', poses: ['sp_slapshot'] } } },
      dest,
    );
    const mar1 = read(join(dest, 'mar-1', 'character.json'));
    expect(Object.keys(mar1.files).sort()).toEqual(['idle', 'sp_slapshot']);
    expect(existsSync(join(dest, 'lolo', mar1.files.sp_slapshot))).toBe(false);
  });

  it('Fighting Friends reçoit toutes les images de ses personnages', () => {
    const dest = tmp();
    const { copied } = copyForGame('fighting-friends', dest);
    expect(copied).toBeGreaterThan(300);
  });
});
