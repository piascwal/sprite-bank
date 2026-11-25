/* Atelier de la banque de sprites : voir les personnages et leurs images, copier les prompts, importer,
   régler et exporter. Les images importées restent sur l'appareil jusqu'à l'export (voir README). */
import './style.css';
import { applyOverrides, loadCustomCharacters } from './assets/character-files';
import { loadRepoCharacters } from './assets/repo-characters';
import { loadLocalSprites } from './assets/sprite-store';
import { addCharacter, roster } from './catalog/roster';
import { STYLE_IDS } from './catalog/needs';
import { CHARACTERS_HTML, initCharacters, openCharacters } from './ui/characters';
import { tickPoseModal } from './ui/pose-modal';
import { PROPS_HTML, initProps, openProps } from './ui/props';
import { $ } from './ui/dom';

/** Onglets de l'atelier : les personnages, ou les objets de décor. */
const TABS_HTML = `
  <nav id="tabs">
    <button class="nav sm on" data-tab="chars">PERSONNAGES</button>
    <button class="nav sm alt" data-tab="props">OBJETS DE DÉCOR</button>
  </nav>`;

function initTabs(): void {
  for (const tab of document.querySelectorAll<HTMLButtonElement>('#tabs [data-tab]')) {
    tab.addEventListener('click', () => {
      const name = tab.dataset.tab!;
      for (const other of document.querySelectorAll<HTMLButtonElement>('#tabs [data-tab]')) {
        other.classList.toggle('on', other === tab);
        other.classList.toggle('alt', other !== tab);
      }
      $('#s-chars').classList.toggle('on', name === 'chars');
      $('#s-props').classList.toggle('on', name === 'props');
      if (name === 'props') void openProps();
    });
  }
}

async function boot(): Promise<void> {
  loadCustomCharacters();
  await loadLocalSprites(() => null).catch(() => {});
  await loadRepoCharacters().catch(() => {});
  applyOverrides();
  // banque injoignable (hors ligne) : un personnage vide pour que l'atelier reste utilisable
  if (!roster.length)
    addCharacter({ id: 'recrue', name: 'RECRUE', style: STYLE_IDS[0] ?? '', color: '#ff6a2b', custom: true });
  $('#ui').innerHTML = TABS_HTML + CHARACTERS_HTML + PROPS_HTML;
  $('#s-chars').classList.add('on');
  initTabs();
  initProps();
  // l'atelier n'a qu'un écran : le bouton Retour ne sert pas
  $('#chBack').classList.add('hidden');
  initCharacters(() => {});
  openCharacters();
  document.documentElement.dataset.started = '1';
  // l'aperçu de la pose ouverte suit les curseurs de réglage en direct
  const frame = () => {
    tickPoseModal();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

void boot();
