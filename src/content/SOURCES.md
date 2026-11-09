# Contenu du portfolio : sources et choix éditoriaux

Ce fichier documente `src/content/site.ts` au 9 novembre 2026. Chaque fait vient d'une source publique, du profil LinkedIn de Pierre-Yves (lu avec son accord) ou de Pierre-Yves lui-même. Le test `ships no draft marker` refuse tout texte qui porte encore `[À VALIDER]`, `TODO` ou `FIXME`.

## Formulations sans source publique

Ces textes restent volontairement génériques. Pierre-Yves peut les corriger librement.

| Où                          | Texte retenu                                                                       | Base                                                                                                                                    |
| --------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `places.home`, méthode      | Partir de l'existant, avancer par petits pas, et écrire la doc, limites comprises. | Historique et README de `ha-samsung-frame-artwork` (commit de référence, 24 commits ciblés, limites documentées).                       |
| `places.lab`, agent         | Il écrit vite ; je fixe le cadre, puis je relis et teste ce qu'il propose.         | Sa façon de travailler avec Claude Code : brief, revue de code, recette, PR relues avant fusion.                                        |
| `places.lab`, arrière-salle | Un homelab qui héberge mes services. Un assistant IA branché sur mes notes.        | Son homelab et son assistant de notes, sans nom de machine, d'adresse, de service ni de détail d'infrastructure.                        |
| `places.contact`            | LinkedIn et GitHub seulement, pas d'e-mail.                                        | Aucune adresse publique. `contact@pyve.is-a.dev` n'existe pas (is-a.dev ne fournit pas de mail). Ajouter un `mailto:` pour en avoir un. |
| `pitch`                     | « un petit archipel en pixel art »                                                 | La carte compte deux îles reliées par un pont.                                                                                          |

## Faits vérifiés

Poste et parcours (`role`, `places.home`) :

- Software Architect, France Télévisions, en CDI depuis avril 2026. Pierre-Yves l'a donné le 9 novembre 2026 ; LinkedIn ne l'affiche pas encore.
- Tech Lead Design System, France Télévisions, freelance, de mars 2023 à avril 2026.
- Infopro Digital, de juillet 2014 à mai 2023 : Web Developer, Lead Web Developer (2016), Architecte front-end (2019), Head of Frontend (2021). Avant, une mission Clevermind pour Infopro Digital (2014).
- De 2012 à 2014 : John Paul, puis megalo & company (Zend et Magento).

Le reste du parcours vient du profil LinkedIn, lu le 7 novembre 2026.

Vie perso (`places.home`) : « papa de deux enfants, amateur de jeux vidéo et de deux-roues » reprend le README de profil (« dad of 2, biker, gamer »).

Objets de la maison (`notes`) : la télé reprend `ha-samsung-frame-artwork` (une TV The Frame dont Home Assistant change le tableau) ; la console et le casque reprennent la vie perso. Ils ne disent rien du lieu ni de l'installation.

Localisation : « basé au sud de Paris ». LinkedIn indique « Paris et périphérie ».

Correctif Terrazzo : ticket #531 ouvert par pvignau, corrigé par sa PR #533, fusionnée le 10 septembre 2025.

PR Tokens Studio #3834 : ouverte le 7 avril 2026, toujours en attente de relecture le 7 novembre 2026. Aucun commit de pvignau n'est fusionné dans `tokens-studio/figma-plugin`. Le résumé du projet est à mettre à jour si ce statut change.

Démo Daily Drive : `https://my-daily-drive.vercel.app`, en alpha. En mode développement, Spotify n'ouvre l'accès qu'aux comptes ajoutés à la main.

Claude : les commits publics de `ha-samsung-frame-artwork` portent `Co-Authored-By: Claude`.

LinkedIn : l'URL a été vérifiée dans le navigateur.

## Écarté

- Les dépôts privés.
- Les forks (Terrazzo, Tokens Studio, ha-linky, docker-airconnect…) : seules les contributions upstream vérifiées sont citées.
- `design-tokens-manager` : un seul commit, signé avec une adresse de mission. À montrer seulement si ce travail appartient à Pierre-Yves.
- `thug-generator` (2019) : son site ne répond plus correctement en HTTPS.
- Les petits essais sans README utile.
- L'e-mail perso, bien qu'il figure dans des `package.json` publics.

## Typographie

- Apostrophe droite partout.
- Espace insécable (U+00A0) avant `? ! : ;`. Sur Mac, Option + Espace la tape.
- La police est Pixelify Sans (OFL), qui couvre le Latin-1.

## Sources publiques

- GitHub : https://github.com/pvignau, le README de profil https://github.com/pvignau/pvignau, et les README des dépôts cités.
- Terrazzo #531 et #533, Tokens Studio #3834.
- LinkedIn : https://www.linkedin.com/in/pierre-yves-vignau-a99a9424/
