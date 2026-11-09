import type { SiteContent } from './types';

/*
 * Neutral stand-in copy, used while the real text is validated (see
 * src/content/index.ts). Same shape as the final content; keep it short.
 */
export const content: SiteContent = {
  name: 'Pyve',
  role: 'Développeur web',
  description:
    'Texte provisoire : le portfolio de Pyve, à explorer comme un petit jeu en pixel art.',
  pitch:
    "Texte provisoire : ce portfolio s'explore comme un petit jeu en pixel art. Le vrai contenu arrive bientôt.",

  places: {
    home: {
      id: 'home',
      label: 'Maison',
      zone: 'La maison',
      title: 'Bio',
      quest: 'Entrer dans la maison',
      body: [
        { kind: 'paragraph', text: 'Texte provisoire de la bio.' },
        { kind: 'list', items: ['Premier point.', 'Deuxième point.'] },
      ],
      links: [{ label: 'Profil', href: 'https://example.com/profil' }],
    },
    work: {
      id: 'work',
      label: 'Projets',
      zone: "L'atelier",
      title: 'Projets',
      quest: 'Lire le panneau des projets',
      body: [
        { kind: 'paragraph', text: 'Texte provisoire des projets.' },
        {
          kind: 'projects',
          items: [
            {
              name: 'Projet A',
              summary: 'Résumé provisoire du projet A.',
              tags: ['TypeScript'],
              links: [{ label: 'Code', href: 'https://example.com/projet-a' }],
            },
            {
              name: 'Projet B',
              summary: 'Résumé provisoire du projet B.',
              tags: ['React', 'Pixel art'],
              links: [{ label: 'Démo', href: 'https://example.com/projet-b' }],
            },
          ],
        },
      ],
      links: [{ label: 'Tous les projets', href: 'https://example.com/projets' }],
    },
    lab: {
      id: 'lab',
      label: 'Lab IA',
      zone: 'Le lab',
      title: 'Lab IA',
      quest: 'Visiter le lab IA',
      body: [{ kind: 'paragraph', text: 'Texte provisoire du lab.' }],
      links: [],
    },
    contact: {
      id: 'contact',
      label: 'Contact',
      zone: 'Le ponton',
      title: 'Contact',
      quest: 'Rejoindre le ponton',
      body: [{ kind: 'paragraph', text: 'Texte provisoire du contact.' }],
      links: [{ label: 'E-mail', href: 'mailto:contact@example.com' }],
    },
  },

  notes: {
    tv: { label: 'Télé', text: 'Texte provisoire de la télé.' },
    console: { label: 'Console', text: 'Texte provisoire de la console.' },
    helmet: { label: 'Casque', text: 'Texte provisoire du casque.' },
  },

  help: {
    title: 'Comment jouer',
    steps: [
      'Flèches ou ZQSD : marcher.',
      'Espace ou Entrée : interagir.',
      'Touche ? : revoir cette aide.',
    ],
    textVersionLabel: 'Version texte',
  },

  notFound: {
    title: 'Page introuvable',
    body: "Cette page n'existe pas.",
    backLabel: 'Retour au jeu',
  },
};
