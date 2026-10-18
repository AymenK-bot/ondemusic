# Onde public — Cloudflare Pages

Cette version remplace l’ancienne : aucune clé demandée aux visiteurs. `functions/api/search.js` appelle YouTube côté serveur avec le secret YOUTUBE_API_KEY. Le lecteur officiel YouTube reste visible. Aucun son n’est hébergé par le site. Favoris locaux, file manuelle.

## Déploiement avec un dépôt Git (recommandé pour utiliser le tableau de bord)

1. Décompressez l’archive. Créez un dépôt GitHub et ajoutez son contenu en conservant les dossiers. À la racine : index.html et functions/api/search.js. N’ajoutez jamais votre clé au dépôt.
2. Cloudflare : Workers & Pages > Create application > Pages > Connect to Git (les intitulés peuvent varier). Si vous ne voyez pas Pages, cherchez le lien proposant de créer un projet Pages, et non un Worker.
3. Connectez le dépôt. Nom du projet : onde-musique si disponible. Framework : None. Commande de build : vide. Répertoire de sortie : `.` (racine du dépôt). Déployez.
4. Dans les paramètres du projet Pages > Variables and Secrets, ajoutez un secret de production nommé exactement `YOUTUBE_API_KEY`, valeur : votre clé Google. Enregistrez.
5. Relancez le déploiement de production (Retry deployment ou nouveau commit). L’adresse de production finit par .pages.dev.
6. Google Cloud > Identifiants > votre clé : restriction API à YouTube Data API v3 uniquement. Cette clé sert maintenant côté serveur : ne laissez PAS une restriction de type sites Web / référents HTTP, car elle peut bloquer l’appel serveur. Ne configurez pas une IP Cloudflare arbitraire. La clé doit rester un secret. Pour séparer les usages, une nouvelle clé dédiée au serveur est préférable.
7. Testez la recherche sur le domaine Pages. Aucun visiteur ne doit fournir de clé.

IMPORTANT : le simple glisser-déposer des fichiers dans le tableau de bord Pages ne compile pas le dossier functions. Utilisez l’intégration Git ci-dessus ou Wrangler ci-dessous.

## Alternative : terminal avec Node.js

Depuis le dossier contenant index.html et functions :

```
npx wrangler login
npx wrangler pages deploy . --project-name onde-musique
```

Suivez les questions pour créer le projet Pages. Ajoutez ensuite le secret dans les paramètres du projet, puis répétez la commande de déploiement. Vous pouvez également utiliser `npx wrangler pages secret put YOUTUBE_API_KEY --project-name onde-musique`, puis redéployer. N’incluez jamais la valeur du secret dans une commande partagée ou dans un fichier public.

## Coûts, protection et limites

Le quota YouTube est commun à tous les visiteurs. Le cache de résultats dure 15 minutes et n’est pas nécessairement partagé entre tous les points de présence Cloudflare. Il ne garantit pas de quota illimité. Les offres gratuites ont des limites susceptibles d’évoluer.

Cette version est un prototype public : elle n’active pas de limitation par IP par défaut. Un appelant peut épuiser le quota en variant les recherches. Pour une ouverture à grande échelle, ajouter une protection anti-abus (par exemple Turnstile et une limitation de débit adaptée à l’offre), surveiller le quota, et prévoir une désactivation de la recherche. La fonction supporte un binding optionnel SEARCH_RATE_LIMITER, mais celui-ci n’est pas configuré par cette archive. Aucun quota Google ne doit être considéré comme illimité.

Clé exclusivement côté serveur. Pas de restriction navigateur pour la clé serveur ; restriction à la seule API YouTube obligatoire. Pas de connexion Google nécessaire pour les visiteurs pour rechercher des vidéos publiques. YouTube peut cependant demander une connexion pour certains contenus restreints.

Avant lancement public : adapter mentions et confidentialité, gestion du consentement selon les obligations applicables. Les miniatures, recherches et lectures contactent des services Google/YouTube. La disponibilité des vidéos, les annonces et les restrictions restent sous contrôle YouTube. Le site n’est pas affilié à YouTube et ne garantit pas un catalogue intégral.
