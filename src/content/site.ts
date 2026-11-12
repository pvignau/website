import type { SiteContent } from './types.ts';

/*
 * Portfolio copy, in French.
 *
 * Every fact comes from a public source or from Pierre-Yves himself;
 * ./SOURCES.md says which, and lists the editorial calls worth a re-read.
 *
 * Typography: straight apostrophes (pixel fonts rarely ship U+2019) and
 * no-break spaces (U+00A0) before ? ! : ; so that a dialog line never starts
 * with a lone punctuation mark.
 */

const GITHUB = 'https://github.com/pvignau';
const LINKEDIN = 'https://www.linkedin.com/in/pierre-yves-vignau-a99a9424/';

export const content: SiteContent = {
  name: 'Pyve',
  role: 'Software architect',
  description:
    'Le portfolio de Pierre-Yves Vignau, alias Pyve, software architect : un archipel en pixel art à explorer comme un mini-RPG, ou à lire en version texte.',
  pitch:
    'Pierre-Yves Vignau, alias Pyve, est software architect : son portfolio est un petit archipel en pixel art, à explorer comme un mini-RPG. Chaque lieu raconte une partie de son travail, de la maison au ponton, et une version texte reprend tout.',

  places: {
    home: {
      id: 'home',
      label: 'Maison',
      zone: 'Maison de Pyve',
      title: 'Chez Pyve',
      quest: 'Entrer dans la maison',
      description:
        'Chez Pyve : développeur web devenu software architect à France Télévisions, son parcours, ses outils et sa façon de travailler.',
      body: [
        {
          kind: 'paragraph',
          text: "La porte grince. Salut, moi c'est Pyve. Pierre-Yves Vignau, pour l'état civil.",
        },
        {
          kind: 'paragraph',
          text: "Développeur web de formation, basé au sud de Paris. Mon terrain de jeu : l'architecture front-end, les design systems et les design tokens.",
        },
        {
          kind: 'paragraph',
          text: "Depuis avril 2026, je suis software architect à France Télévisions, en CDI. J'y étais auparavant tech lead du design system, en freelance.",
        },
        { kind: 'paragraph', text: 'Mon inventaire :' },
        {
          kind: 'list',
          items: [
            'Design tokens : Style Dictionary, Tokens Studio, Terrazzo, format DTCG.',
            'Front : TypeScript, React, Vue, Next.js, Storybook.',
            'Figma : plugins et passerelles vers le code.',
            'Domotique : Home Assistant, en Python.',
            'IA : je code en binôme avec un agent.',
          ],
        },
        {
          kind: 'paragraph',
          text: "Ma méthode : partir de l'existant, avancer par petits pas, et écrire la doc, limites comprises.",
        },
        { kind: 'paragraph', text: 'Le chemin parcouru :' },
        {
          kind: 'list',
          items: [
            'Depuis 2026 : software architect, France Télévisions (CDI).',
            '2023-2026 : tech lead design system, France Télévisions (freelance).',
            '2014-2023 : Infopro Digital, de développeur web à head of frontend, en passant par lead dev et architecte front-end.',
            '2012-2014 : développeur web en agence, PHP, Zend et Magento.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'Côté perso : papa de deux enfants, amateur de jeux vidéo et de deux-roues.',
        },
      ],
      links: [{ label: 'Mon parcours sur LinkedIn', href: LINKEDIN }],
      views: {
        office: {
          label: 'Bureau',
          zone: 'Bureau de Pyve',
          title: 'Au bureau',
          lead: "Deux écrans, du code partout : ici, on parle boulot. Salut, moi c'est Pyve. Pierre-Yves Vignau, pour l'état civil.",
        },
      },
    },

    work: {
      id: 'work',
      label: 'Projets',
      zone: 'Panneau des projets',
      title: 'Quelques projets',
      quest: 'Lire le panneau des projets',
      description:
        'Les projets publics de Pyve : contributions design tokens (Terrazzo, Tokens Studio), intégration Home Assistant, Daily Drive et bacs à sable design system.',
      body: [
        {
          kind: 'paragraph',
          text: "Le panneau est couvert d'affiches. J'en ai gardé quelques-unes, toutes publiques.",
        },
        {
          kind: 'projects',
          items: [
            {
              name: 'Contributions design tokens',
              summary:
                'Un bug de la CLI de Terrazzo signalé puis corrigé, et une proposition de tokens dépréciés pour Tokens Studio, en attente de relecture.',
              tags: ['Design tokens', 'DTCG', 'TypeScript'],
              links: [
                {
                  label: 'Correctif Terrazzo',
                  href: 'https://github.com/terrazzoapp/terrazzo/pull/533',
                },
                {
                  label: 'PR Tokens Studio',
                  href: 'https://github.com/tokens-studio/figma-plugin/pull/3834',
                },
              ],
            },
            {
              name: 'Samsung Frame Artwork',
              summary:
                'Une intégration Home Assistant qui fait tourner tableaux et photos sur une TV The Frame, sans couper ce que tu regardes.',
              tags: ['Python', 'Home Assistant', 'HACS'],
              links: [{ label: 'Le code', href: `${GITHUB}/ha-samsung-frame-artwork` }],
            },
            {
              name: 'Daily Drive',
              summary:
                "Spotify a arrêté son Daily Drive, alors je l'ai refait : une playlist de musique et de podcasts, reconstruite chaque matin.",
              tags: ['TypeScript', 'Next.js', 'API Spotify'],
              links: [
                { label: 'Le code', href: `${GITHUB}/daily-drive` },
                { label: 'Démo (alpha)', href: 'https://my-daily-drive.vercel.app' },
              ],
            },
            {
              name: 'Bacs à sable design system',
              summary:
                'Deux maquettes publiques : des tokens venus de Tokens Studio, compilés en SCSS et en Kotlin, et un design system Vue rangé dans Storybook.',
              tags: ['Style Dictionary', 'Storybook', 'Vue'],
              links: [
                { label: 'Tokens SCSS et Kotlin', href: `${GITHUB}/ts-ds-boilerplate` },
                { label: 'Design system Vue', href: `${GITHUB}/vue-storybook-design-system` },
              ],
            },
            {
              name: 'Ce mini-RPG',
              summary: 'Le site où tu te promènes, codé en TypeScript, avec sa version texte.',
              tags: ['TypeScript', 'Pixel art', 'Jeu web'],
              links: [{ label: 'Le code', href: `${GITHUB}/website` }],
            },
          ],
        },
      ],
      links: [{ label: 'Tous mes dépôts', href: `${GITHUB}?tab=repositories` }],
    },

    lab: {
      id: 'lab',
      label: 'Lab IA',
      zone: 'Lab IA',
      title: 'Lab IA et domotique',
      quest: 'Visiter le lab IA',
      body: [
        {
          kind: 'paragraph',
          text: "Des diodes clignotent partout. Ici, je teste ce que l'IA change à ma façon de coder.",
        },
        {
          kind: 'paragraph',
          text: 'Sur mes projets récents, je code en binôme avec Claude, un agent IA.',
        },
        {
          kind: 'paragraph',
          text: "Il écrit vite ; je fixe le cadre, puis je relis et teste ce qu'il propose.",
        },
        {
          kind: 'paragraph',
          text: "À la maison, Home Assistant pilote la domotique. J'y branche mes propres outils :",
        },
        {
          kind: 'list',
          items: [
            'Une TV The Frame qui change de tableau toute seule.',
            'Un pavé numérique qui lance des scripts, façon Stream Deck maison.',
          ],
        },
        { kind: 'paragraph', text: "Dans l'arrière-salle :" },
        {
          kind: 'list',
          items: ['Un homelab qui héberge mes services.', 'Un assistant IA branché sur mes notes.'],
        },
        {
          kind: 'paragraph',
          text: 'Pas de plan du réseau ici : le reste du lab est fermé au public.',
        },
      ],
      links: [
        { label: 'Intégration The Frame', href: `${GITHUB}/ha-samsung-frame-artwork` },
        { label: 'Pavé de scripts', href: `${GITHUB}/homeassistant-keypad-script-launcher` },
      ],
    },

    contact: {
      id: 'contact',
      label: 'Contact',
      zone: 'Ponton',
      title: 'Prendre le large',
      quest: 'Rejoindre le ponton',
      body: [
        { kind: 'paragraph', text: 'Le bateau attend à quai. Où veux-tu aller ?' },
        {
          kind: 'paragraph',
          text: 'Une question ou un projet ? Écris-moi sur LinkedIn. Le code, lui, vit sur GitHub.',
        },
      ],
      links: [
        { label: 'LinkedIn', href: LINKEDIN },
        { label: 'GitHub', href: GITHUB },
      ],
    },
  },

  notes: {
    tv: {
      label: 'Télé',
      text: 'Une TV The Frame : éteinte, elle affiche un tableau, et Home Assistant en change tout seul.',
    },
    console: {
      label: 'Console',
      text: "La console du salon : amateur de jeux vidéo, je ne m'en cache pas.",
    },
    helmet: {
      label: 'Casque',
      text: "Un casque de moto, près de la porte : l'autre passion, ce sont les deux-roues.",
    },
  },

  help: {
    title: 'Comment jouer',
    steps: [
      'Flèches ou ZQSD : marcher.',
      'Espace ou Entrée : interagir avec un lieu.',
      'Sur écran tactile : la croix pour marcher, le bouton A pour interagir.',
      'Touches + et - ou molette : zoomer et dézoomer.',
      'Touche ? : revoir cette aide.',
      'Visite les quatre lieux pour finir la quête.',
      'Pas le temps ? La version texte dit tout, sans jouer.',
    ],
    textVersionLabel: 'Version texte',
  },

  notFound: {
    title: 'Plouf !',
    body: "Te voilà dans l'eau : cette page n'existe pas. Rien de grave, l'île est juste à côté.",
    backLabel: "Remonter sur l'île",
  },
};
