import { cpSync } from 'node:fs';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

/** Le site de l'atelier embarque les images de la banque (characters/, props/, npcs/) : il les affiche telles quelles. */
const copyCharacters = (): Plugin => ({
  name: 'sb-characters',
  apply: 'build',
  closeBundle() {
    cpSync('characters', 'dist/characters', { recursive: true });
    cpSync('props', 'dist/props', { recursive: true });
    cpSync('npcs', 'dist/npcs', { recursive: true });
  },
});

export default defineConfig({
  // site publié sur https://piascwal.github.io/sprite-bank/
  base: './',
  plugins: [copyCharacters()],
  test: { environment: 'node' },
});
