/* Onglet « Objets de décor » de l'atelier : les objets de la banque (props/), par catégorie, avec leurs
   variantes, leur largeur relative et leur origine. Consultation seulement pour l'instant. */
import { escapeHtml } from '../core/text';
import { $, on } from './dom';

/** Fiche d'un objet de décor (props/<id>/prop.json). */
interface Prop {
  id: string;
  name: string;
  category: string;
  /** Largeur relative (pixels de jeu de DKK : un héros y mesure environ 21 px de haut). */
  width: number;
  files: string[];
  source?: string;
  /** Précision : ce que montre chaque variante, ou une taille estimée. */
  note?: string;
}

const PROPS_DIR = 'props/';

export const PROPS_HTML = `
  <div class="screen panel" id="s-props">
    <div class="bar"><h2>OBJETS DE DÉCOR</h2></div>
    <div class="scroll">
      <p class="note">Objets de décor partagés entre les jeux (venus de DKK). Un jeu les demande dans ses besoins
        (<code>props</code> : identifiants, catégories ou « * »). La largeur est relative : un personnage
        mesure environ 21 unités de haut.</p>
      <div id="propDetail" class="hidden"></div>
      <div id="propList">Chargement des objets…</div>
    </div>
  </div>`;

let props: Prop[] = [];

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, { cache: 'no-cache' });
    return response.ok ? ((await response.json()) as T) : null;
  } catch {
    return null;
  }
}

async function loadProps(): Promise<Prop[]> {
  const ids = (await fetchJson<string[]>(`${PROPS_DIR}index.json`)) ?? [];
  const all = await Promise.all(ids.map((id) => fetchJson<Prop>(`${PROPS_DIR}${id}/prop.json`)));
  return all.filter((p): p is Prop => !!p);
}

const imageUrl = (prop: Prop, file: string) => `${PROPS_DIR}${prop.id}/${file}`;

function card(prop: Prop): string {
  const variants = prop.files.length > 1 ? ` · ${prop.files.length} variantes` : '';
  return `<button class="nav card ok propCard" data-prop="${escapeHtml(prop.id)}">
      <img src="${imageUrl(prop, prop.files[0]!)}" alt="" loading="lazy" />
      <span class="cl">${escapeHtml(prop.name)}</span>
      <span class="badge">largeur ${prop.width}${variants}</span>
    </button>`;
}

function renderList(): void {
  const categories = [...new Set(props.map((p) => p.category))];
  $('#propList').innerHTML = props.length
    ? categories
        .map((c) => {
          const items = props.filter((p) => p.category === c);
          return `<h3 class="gridTitle">${escapeHtml(c.toUpperCase())} (${items.length})</h3><div class="propGrid">${items.map(card).join('')}</div>`;
        })
        .join('')
    : 'Aucun objet de décor dans la banque.';
}

/** Détail d'un objet : toutes ses variantes en grand, sa largeur, son origine. */
function showDetail(prop: Prop): void {
  const images = prop.files
    .map(
      (f) =>
        `<figure><img src="${imageUrl(prop, f)}" alt="" /><figcaption>${escapeHtml(f)}</figcaption></figure>`,
    )
    .join('');
  $('#propDetail').innerHTML =
    `<h3>${escapeHtml(prop.name)} <small>(${escapeHtml(prop.id)})</small></h3>` +
    `<div class="propVariants">${images}</div>` +
    `<p>Catégorie : <b>${escapeHtml(prop.category)}</b> · largeur relative : <b>${prop.width}</b>` +
    (prop.source ? ` · origine : <code>${escapeHtml(prop.source)}</code>` : '') +
    (prop.note ? `<br>${escapeHtml(prop.note)}` : '') +
    `</p><button class="nav sm alt" id="propClose">FERMER</button>`;
  $('#propDetail').classList.remove('hidden');
  $('#propDetail').scrollIntoView({ behavior: 'smooth' });
}

export function initProps(): void {
  on('#propList', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLElement>('[data-prop]');
    const prop = props.find((p) => p.id === button?.dataset.prop);
    if (prop) showDetail(prop);
  });
  on('#propDetail', (event) => {
    if ((event.target as HTMLElement).id === 'propClose') $('#propDetail').classList.add('hidden');
  });
}

/** Ouvre l'onglet (les fiches ne sont lues qu'à la première ouverture). */
export async function openProps(): Promise<void> {
  if (!props.length) {
    props = await loadProps();
    renderList();
  }
}
