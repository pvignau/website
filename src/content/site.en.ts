import { GITHUB, LINKEDIN } from './profiles.ts';
import type { SiteContent } from './types.ts';

/*
 * Portfolio copy, in English: a translation of ./site.ts, fact for fact.
 * ./SOURCES.md sources the French copy, and so this one.
 *
 * Typography: straight apostrophes (pixel fonts rarely ship U+2019), and no
 * space before ? ! : ; as English has it.
 */

export const content: SiteContent = {
  name: 'Pyve',
  role: 'Software architect',
  description:
    'The portfolio of Pierre-Yves Vignau, aka Pyve, software architect: a pixel-art archipelago to explore like a mini-RPG, or to read as text.',
  pitch:
    'Pierre-Yves Vignau, aka Pyve, is a software architect: his portfolio is a small pixel-art archipelago, to explore like a mini-RPG. Each place tells part of his work, from the house to the jetty, and a text version has it all.',

  places: {
    home: {
      id: 'home',
      label: 'House',
      zone: "Pyve's house",
      title: "Pyve's place",
      quest: 'Enter the house',
      description:
        "Pyve's place: a web developer turned software architect at France Télévisions, his path, his tools and how he works.",
      body: [
        {
          kind: 'paragraph',
          text: "The door creaks. Hi, I'm Pyve. Pierre-Yves Vignau, for the record.",
        },
        {
          kind: 'paragraph',
          text: 'A web developer by training, based south of Paris. My playground: front-end architecture, design systems and design tokens.',
        },
        {
          kind: 'paragraph',
          text: "Since April 2026, I've been a software architect at France Télévisions, on a permanent contract. Before that, I was the design system's tech lead there, as a freelancer.",
        },
        { kind: 'paragraph', text: 'My inventory:' },
        {
          kind: 'list',
          items: [
            'Design tokens: Style Dictionary, Tokens Studio, Terrazzo, the DTCG format.',
            'Front end: TypeScript, React, Vue, Next.js, Storybook.',
            'Figma: plugins and bridges to the code.',
            'Home automation: Home Assistant, in Python.',
            'AI: I pair-program with an agent.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'My method: start from what exists, move in small steps, and write the docs, limits included.',
        },
        { kind: 'paragraph', text: 'The road so far:' },
        {
          kind: 'list',
          items: [
            'Since 2026: software architect, France Télévisions (permanent).',
            '2023-2026: design system tech lead, France Télévisions (freelance).',
            '2014-2023: Infopro Digital, from web developer to head of frontend, by way of lead dev and front-end architect.',
            '2012-2014: web developer at agencies, PHP, Zend and Magento.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'Off the clock: dad of two, into video games and two-wheelers.',
        },
      ],
      links: [{ label: 'My path on LinkedIn', href: LINKEDIN }],
      views: {
        office: {
          label: 'Office',
          zone: "Pyve's office",
          title: 'At the desk',
          lead: "Two screens, code everywhere: this is where we talk shop. Hi, I'm Pyve. Pierre-Yves Vignau, for the record.",
        },
      },
    },

    work: {
      id: 'work',
      label: 'Projects',
      zone: 'Project board',
      title: 'A few projects',
      quest: 'Read the project board',
      description:
        "Pyve's public projects: design token contributions (Terrazzo, Tokens Studio), a Home Assistant integration, Daily Drive and design system sandboxes.",
      body: [
        {
          kind: 'paragraph',
          text: "The board is covered in posters. I've kept a few, all of them public.",
        },
        {
          kind: 'projects',
          items: [
            {
              name: 'Design token contributions',
              summary:
                'A bug in the Terrazzo CLI, reported then fixed, and a proposal for deprecated tokens in Tokens Studio, awaiting review.',
              tags: ['Design tokens', 'DTCG', 'TypeScript'],
              links: [
                {
                  label: 'Terrazzo fix',
                  href: 'https://github.com/terrazzoapp/terrazzo/pull/533',
                },
                {
                  label: 'Tokens Studio PR',
                  href: 'https://github.com/tokens-studio/figma-plugin/pull/3834',
                },
              ],
            },
            {
              name: 'Samsung Frame Artwork',
              summary:
                "A Home Assistant integration that rotates paintings and photos on a The Frame TV, without cutting off what you're watching.",
              tags: ['Python', 'Home Assistant', 'HACS'],
              links: [{ label: 'The code', href: `${GITHUB}/ha-samsung-frame-artwork` }],
            },
            {
              name: 'Daily Drive',
              summary:
                'Spotify stopped its Daily Drive, so I rebuilt it: a playlist of music and podcasts, made anew every morning.',
              tags: ['TypeScript', 'Next.js', 'Spotify API'],
              links: [
                { label: 'The code', href: `${GITHUB}/daily-drive` },
                { label: 'Demo (alpha)', href: 'https://my-daily-drive.vercel.app' },
              ],
            },
            {
              name: 'Design system sandboxes',
              summary:
                'Two public mock-ups: tokens from Tokens Studio, compiled to SCSS and Kotlin, and a Vue design system laid out in Storybook.',
              tags: ['Style Dictionary', 'Storybook', 'Vue'],
              links: [
                { label: 'SCSS and Kotlin tokens', href: `${GITHUB}/ts-ds-boilerplate` },
                { label: 'Vue design system', href: `${GITHUB}/vue-storybook-design-system` },
              ],
            },
            {
              name: 'This mini-RPG',
              summary:
                "The site you're walking around, written in TypeScript, with its text version.",
              tags: ['TypeScript', 'Pixel art', 'Web game'],
              links: [{ label: 'The code', href: `${GITHUB}/website` }],
            },
          ],
        },
      ],
      links: [{ label: 'All my repositories', href: `${GITHUB}?tab=repositories` }],
    },

    lab: {
      id: 'lab',
      label: 'AI lab',
      zone: 'AI lab',
      title: 'AI lab and home automation',
      quest: 'Visit the AI lab',
      body: [
        {
          kind: 'paragraph',
          text: 'LEDs blink everywhere. This is where I try out what AI changes in the way I code.',
        },
        {
          kind: 'paragraph',
          text: 'On my recent projects, I pair-program with Claude, an AI agent.',
        },
        {
          kind: 'paragraph',
          text: 'It writes fast; I set the frame, then review and test what it suggests.',
        },
        {
          kind: 'paragraph',
          text: 'At home, Home Assistant runs the smart home. I plug my own tools into it:',
        },
        {
          kind: 'list',
          items: [
            'A The Frame TV that changes paintings on its own.',
            'A numeric keypad that launches scripts, a homemade Stream Deck.',
          ],
        },
        { kind: 'paragraph', text: 'In the back room:' },
        {
          kind: 'list',
          items: ['A homelab that hosts my services.', 'An AI assistant hooked up to my notes.'],
        },
        {
          kind: 'paragraph',
          text: 'No network map here: the rest of the lab is closed to the public.',
        },
      ],
      links: [
        { label: 'The Frame integration', href: `${GITHUB}/ha-samsung-frame-artwork` },
        { label: 'Script keypad', href: `${GITHUB}/homeassistant-keypad-script-launcher` },
      ],
    },

    contact: {
      id: 'contact',
      label: 'Contact',
      zone: 'Jetty',
      title: 'Set sail',
      quest: 'Reach the jetty',
      body: [
        { kind: 'paragraph', text: 'The boat waits at the quay. Where do you want to go?' },
        {
          kind: 'paragraph',
          text: 'A question or a project? Write to me on LinkedIn. The code lives on GitHub.',
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
      label: 'TV',
      text: 'A The Frame TV: switched off, it shows a painting, and Home Assistant swaps it on its own.',
    },
    console: {
      label: 'Console',
      text: "The living room console: I'm into video games, and I don't hide it.",
    },
    helmet: {
      label: 'Helmet',
      text: 'A motorcycle helmet by the door: my other passion is two-wheelers.',
    },
  },

  help: {
    title: 'How to play',
    steps: [
      'Arrow keys or WASD: walk.',
      'Space or Enter: interact with a place.',
      'On a touch screen: the pad to walk, the A button to interact.',
      '+ and - keys or the wheel: zoom in and out.',
      '? key: show this help again.',
      'Visit the four places to finish the quest.',
      'No time? The text version says it all, no playing needed.',
    ],
    textVersionLabel: 'Text version',
  },

  notFound: {
    title: 'Splash!',
    body: "You've landed in the water: this page doesn't exist. No harm done, the island is right next door.",
    backLabel: 'Climb back onto the island',
  },
};
