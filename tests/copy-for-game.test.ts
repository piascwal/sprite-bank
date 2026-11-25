/* Un jeu ne reçoit que les images qu'il demande : les autres restent dans la banque. */
import { existsSync, mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  copyForGame,
  copyForNeeds,
  copyNpcsForNeeds,
  copyPropsForNeeds,
  npcFiles,
} from '../scripts/copy-for-game.mjs';

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

  it('un jeu qui demande une catégorie d’objets de décor ne reçoit que ceux-là', () => {
    const dest = tmp();
    const { props } = copyPropsForNeeds(
      { game: 'g', label: 'G', common: [], props: ['nature', 'vache'] },
      dest,
    );
    const ids = read(join(dest, 'index.json')) as string[];
    expect(props).toBe(ids.length);
    expect(ids).toContain('sapin');
    expect(ids).toContain('vache');
    expect(ids).not.toContain('voiture');
    for (const id of ids) {
      const prop = read(join(dest, id, 'prop.json'));
      for (const name of prop.files) expect(existsSync(join(dest, id, name)), `${id}/${name}`).toBe(true);
    }
  });

  it('sans objets demandés, aucun objet de décor', () => {
    const dest = tmp();
    expect(copyPropsForNeeds({ game: 'g', label: 'G', common: [] }, dest).props).toBe(0);
  });

  it('un jeu qui demande les boss reçoit leurs images et planches d’animation, et rien d’autre', () => {
    const dest = tmp();
    const { npcs } = copyNpcsForNeeds({ game: 'g', label: 'G', common: [], npcs: ['boss', 'fetard'] }, dest);
    const ids = read(join(dest, 'index.json')) as string[];
    expect(npcs).toBe(ids.length);
    expect(ids).toContain('dj');
    expect(ids).toContain('fetard');
    expect(ids).not.toContain('pigeon');
    for (const id of ids) {
      for (const name of npcFiles(read(join(dest, id, 'npc.json')))) {
        expect(existsSync(join(dest, id, name)), `${id}/${name}`).toBe(true);
      }
    }
  });
});
