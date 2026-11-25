/* Onglet « Ennemis & PNJ » de l'atelier : les ennemis, personnages non joueurs et boss de la banque (npcs/),
   par catégorie. Le détail d'une famille montre chaque variante et fait jouer ses animations (repos, marche,
   attaque…) d'après la description de sa planche. Consultation seulement pour l'instant. */
import { escapeHtml } from '../core/text';
import { $, on } from './dom';

interface Animation {
  name: string;
  row: number;
  frames: number;
  fps: number;
}
interface Variant {
  image?: string;
  animation?: { sheet: string; frameWidth: number; frameHeight: number; animations: Animation[] };
}
/** Fiche d'un ennemi ou PNJ (npcs/<id>/npc.json). */
interface Npc {
  id: string;
  name: string;
  category: string;
  /** Taille relative (un héros mesure 20 de haut) : hauteur, ou largeur pour les boss. */
  height?: number;
  width?: number;
  variants: Variant[];
  source?: string;
}

const NPCS_DIR = 'npcs/';
const PREVIEW = 120;

export const NPCS_HTML = `
  <div class="screen panel" id="s-npcs">
    <div class="bar"><h2>ENNEMIS &amp; PNJ</h2></div>
    <div class="scroll">
      <p class="note">Ennemis, personnages non joueurs et boss partagés entre les jeux (venus de DKK). Un jeu les
        demande dans ses besoins (<code>npcs</code> : identifiants, catégories ou « * »). La taille est relative :
        un héros mesure 20 de haut.</p>
      <div id="npcDetail" class="hidden"></div>
      <div id="npcList">Chargement…</div>
    </div>
  </div>`;

let npcs: Npc[] = [];
/** Aperçus animés du détail ouvert : arrêtés à la fermeture. */
let stopAnimations: (() => void) | null = null;

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, { cache: 'no-cache' });
    return response.ok ? ((await response.json()) as T) : null;
  } catch {
    return null;
  }
}

const url = (npc: Npc, file: string) => `${NPCS_DIR}${npc.id}/${file}`;
const sizeLabel = (npc: Npc) => (npc.height ? `hauteur ${npc.height}` : `largeur ${npc.width}`);

/** Image d'une variante : sa source, sinon la première image de sa planche (affichée recadrée par le CSS). */
function thumbnail(npc: Npc, v: Variant): string {
  if (v.image) return `<img src="${url(npc, v.image)}" alt="" loading="lazy" />`;
  const a = v.animation!;
  // la planche compte autant de colonnes que la plus longue animation, et une ligne par animation
  const cols = Math.max(...a.animations.map((anim) => anim.frames));
  const rows = Math.max(...a.animations.map((anim) => anim.row)) + 1;
  const style = `background-image:url('${url(npc, a.sheet)}');background-size:${cols * 100}% ${rows * 100}%;aspect-ratio:${a.frameWidth}/${a.frameHeight}`;
  return `<span class="npcFrame" style="${style}"></span>`;
}

function card(npc: Npc): string {
  const variants = npc.variants.length > 1 ? ` · ${npc.variants.length} variantes` : '';
  const animated = npc.variants.some((v) => v.animation) ? ' · animé' : '';
  return `<button class="nav card ok propCard" data-npc="${escapeHtml(npc.id)}">
      ${thumbnail(npc, npc.variants[0]!)}
      <span class="cl">${escapeHtml(npc.name)}</span>
      <span class="badge">${sizeLabel(npc)}${variants}${animated}</span>
    </button>`;
}

function renderList(): void {
  const categories = [...new Set(npcs.map((n) => n.category))];
  $('#npcList').innerHTML = npcs.length
    ? categories
        .map((c) => {
          const items = npcs.filter((n) => n.category === c);
          return `<h3 class="gridTitle">${escapeHtml(c.toUpperCase())} (${items.length})</h3><div class="propGrid">${items.map(card).join('')}</div>`;
        })
        .join('')
    : 'Aucun ennemi ni PNJ dans la banque.';
}

/** Fait jouer en boucle chaque animation d'une planche dans son canvas. */
function animate(canvases: HTMLCanvasElement[], sheet: HTMLImageElement, v: Variant): () => void {
  const a = v.animation!;
  let frame = 0;
  const start = performance.now();
  const tick = (now: number) => {
    canvases.forEach((canvas, i) => {
      const anim = a.animations[i]!;
      const index = Math.floor(((now - start) / 1000) * anim.fps) % anim.frames;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const k = Math.min(canvas.width / a.frameWidth, canvas.height / a.frameHeight);
      const w = a.frameWidth * k;
      const h = a.frameHeight * k;
      ctx.drawImage(
        sheet,
        index * a.frameWidth,
        anim.row * a.frameHeight,
        a.frameWidth,
        a.frameHeight,
        (canvas.width - w) / 2,
        canvas.height - h,
        w,
        h,
      );
    });
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}

function showDetail(npc: Npc): void {
  stopAnimations?.();
  const stops: (() => void)[] = [];
  const blocks = npc.variants.map((v, i) => {
    const anims = v.animation?.animations ?? [];
    const canvases = anims
      .map(
        (a) =>
          `<figure><canvas width="${PREVIEW}" height="${PREVIEW}"></canvas><figcaption>${escapeHtml(a.name)}</figcaption></figure>`,
      )
      .join('');
    const source = v.image
      ? `<figure><img src="${url(npc, v.image)}" alt="" /><figcaption>source</figcaption></figure>`
      : '';
    return `<h4>Variante ${i + 1}</h4><div class="propVariants" data-variant="${i}">${source}${canvases}</div>`;
  });
  $('#npcDetail').innerHTML =
    `<h3>${escapeHtml(npc.name)} <small>(${escapeHtml(npc.id)})</small></h3>${blocks.join('')}` +
    `<p>Catégorie : <b>${escapeHtml(npc.category)}</b> · ${sizeLabel(npc)}` +
    (npc.source ? ` · origine : <code>${escapeHtml(npc.source)}</code>` : '') +
    `</p><button class="nav sm alt" id="npcClose">FERMER</button>`;
  npc.variants.forEach((v, i) => {
    if (!v.animation) return;
    const canvases = [...$(`#npcDetail [data-variant="${i}"]`).querySelectorAll('canvas')];
    const sheet = new Image();
    sheet.onload = () => stops.push(animate(canvases, sheet, v));
    sheet.src = url(npc, v.animation.sheet);
  });
  stopAnimations = () => stops.forEach((stop) => stop());
  $('#npcDetail').classList.remove('hidden');
  $('#npcDetail').scrollIntoView({ behavior: 'smooth' });
}

export function initNpcs(): void {
  on('#npcList', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLElement>('[data-npc]');
    const npc = npcs.find((n) => n.id === button?.dataset.npc);
    if (npc) showDetail(npc);
  });
  on('#npcDetail', (event) => {
    if ((event.target as HTMLElement).id !== 'npcClose') return;
    stopAnimations?.();
    $('#npcDetail').classList.add('hidden');
  });
}

/** Ouvre l'onglet (les fiches ne sont lues qu'à la première ouverture). */
export async function openNpcs(): Promise<void> {
  if (npcs.length) return;
  const ids = (await fetchJson<string[]>(`${NPCS_DIR}index.json`)) ?? [];
  const all = await Promise.all(ids.map((id) => fetchJson<Npc>(`${NPCS_DIR}${id}/npc.json`)));
  npcs = all.filter((n): n is Npc => !!n);
  renderList();
}
