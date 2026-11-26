/* Look « grosse tête » (chibi) : le même personnage, en version compacte et très lisible de loin.
   Une tête énorme, un corps minuscule presque caché dessous, une silhouette ramassée, presque ronde.
   Ces poses ne sont propres à aucun jeu : un jeu qui veut ce look les demande dans ses besoins. */
import type { PoseName } from './poses';

/** Description commune du look, reprise dans chaque prompt chibi. */
export const CHIBI_LOOK =
  "version « GROSSE TÊTE » (chibi) du personnage : la TÊTE est énorme et occupe environ 60 % de la hauteur totale ; le corps est minuscule, ramassé et presque caché sous la tête, bras et jambes très courts et arrondis ; la silhouette entière est compacte, presque ronde, lisible d'un coup d'œil même en tout petit. Le visage reste parfaitement reconnaissable (mêmes traits, même coiffure, même barbe, mêmes lunettes) et la couleur dominante de sa tenue est bien visible";

interface ChibiSpec {
  label: string;
  /** Posture du pantin servant de guide (à adapter aux proportions chibi). */
  rig: PoseName | null;
  desc: string;
  h?: number;
  w?: number;
  ax?: number;
  fb: readonly string[];
  /** Tête seule (sans corps). */
  head?: boolean;
}

export const CHIBI_POSES = {
  chibi_head: {
    label: 'Grosse tête : tête seule',
    rig: null,
    head: true,
    fb: [],
    desc: 'la TÊTE SEULE du personnage, sans cou ni corps, de trois quarts tournée vers la droite, bien ronde et centrée, expression déterminée et joyeuse, prête à être lancée',
  },
  chibi_idle: {
    label: 'Grosse tête : au repos',
    rig: 'idle',
    h: 1,
    ax: 0.5,
    fb: ['chibi_head'],
    desc: 'debout, tout petit corps bien planté, petits poings serrés, regard déterminé et malicieux',
  },
  chibi_fly: {
    label: 'Grosse tête : en vol',
    rig: 'jump',
    h: 1,
    ax: 0.5,
    fb: ['chibi_idle', 'chibi_head'],
    desc: "en plein vol, lancé comme un boulet (aucun sol visible) : corps roulé en boule sous l'énorme tête, petits bras tendus vers l'avant, bouche ouverte qui crie, cheveux au vent",
  },
  chibi_power: {
    label: 'Grosse tête : pouvoir',
    rig: 'cast',
    h: 1,
    ax: 0.5,
    fb: ['chibi_fly', 'chibi_idle'],
    desc: 'au moment où il déclenche son pouvoir en plein vol (aucun sol visible) : yeux grands ouverts, sourire de défi, petits bras écartés, une aura de la couleur de sa tenue autour de lui (sans autre effet)',
  },
  chibi_hit: {
    label: 'Grosse tête : sonné',
    rig: 'hit',
    h: 0.9,
    ax: 0.5,
    fb: ['chibi_idle'],
    desc: 'sonné après un gros choc : la tête un peu écrasée, yeux en spirale ou en croix, langue tirée, petites étoiles au-dessus de la tête, petits bras ballants',
  },
  chibi_win: {
    label: 'Grosse tête : victoire',
    rig: 'win',
    h: 1.1,
    ax: 0.5,
    fb: ['chibi_idle'],
    desc: 'qui saute de joie, un petit poing levé, énorme sourire, yeux plissés de bonheur',
  },
} satisfies Record<string, ChibiSpec>;

export type ChibiSpriteKey = keyof typeof CHIBI_POSES;
