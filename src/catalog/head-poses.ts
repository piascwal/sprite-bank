/* Look « grosse tête » : la TÊTE SEULE du personnage, sans corps, une image par expression.
   Lisible de loin (un jeu peut la dessiner en grand, comme un pion rond). Ces poses ne sont propres à
   aucun jeu : un jeu qui veut ce look les demande dans ses besoins. */

interface HeadSpec {
  label: string;
  /** Expression du visage, pour le prompt. */
  desc: string;
  fb: readonly string[];
}

export const HEAD_POSES = {
  head_ready: {
    label: 'Grosse tête : prête',
    fb: [],
    desc: 'regard déterminé et malicieux, petit sourire en coin, prête à foncer',
  },
  head_fly: {
    label: 'Grosse tête : en vol',
    fb: ['head_ready'],
    desc: "en plein vol à toute vitesse : bouche grande ouverte qui crie, yeux écarquillés, cheveux (ou barbe) plaqués vers l'arrière par le vent",
  },
  head_power: {
    label: 'Grosse tête : pouvoir',
    fb: ['head_fly', 'head_ready'],
    desc: "au moment où il déclenche son pouvoir : yeux plissés de concentration, sourire de défi, sourcils froncés, l'air surpuissant",
  },
  head_hit: {
    label: 'Grosse tête : sonnée',
    fb: ['head_ready'],
    desc: 'sonnée après un gros choc : yeux en spirale, langue tirée sur le côté, une bosse sur le front, petites étoiles autour',
  },
  head_win: {
    label: 'Grosse tête : victoire',
    fb: ['head_ready'],
    desc: 'éclat de rire de victoire : yeux plissés de bonheur, grande bouche ouverte, joues rondes',
  },
  head_sad: {
    label: 'Grosse tête : défaite',
    fb: ['head_ready'],
    desc: 'déçue et boudeuse : sourcils relevés au milieu, moue triste, une goutte de sueur sur la tempe',
  },
} satisfies Record<string, HeadSpec>;

export type HeadSpriteKey = keyof typeof HEAD_POSES;
