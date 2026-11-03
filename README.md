# MémoChant — V0.1.4

Prompteur mobile de mémorisation de paroles, sans framework ni dépendances.

## V0.1.4 — corrections prioritaires

- Écran d’accueil clair : importer ses propres paroles avant toute séance ; plus de fausse chanson présentée comme exercice.
- Bibliothèque avec sélection, modification et sauvegarde localStorage.
- Défilement piloté par la durée du passage actif (et non la hauteur scrollable) ; progression automatique et boutons précédent/suivant.
- Numéros de version synchronisés dans interface, cache PWA, HTML et README.
- La reconnaissance vocale n’est pas encore implémentée.

## Fonctionnalités

- Interface minimaliste, défilement vertical ajustable, maintien du doigt pour suspendre.
- Bibliothèque de chansons : ajout, sélection, suppression (stockage local dans le navigateur).
- Patterns d'apprentissage nommés, modifiables et sauvegardés : `A, A, B, A+, B, B, A+, B, AB, AB, AB` ou `ABC, ABCD, ABCDE…`.
- Unités de ½, 1, 2 ou 3 lignes ; répétition du pattern sur la suite du texte.
- Démonstration **simulée** de badges pastel : vert correct, rouge incorrect, bleu manquant.
- PWA avec cache hors connexion des fichiers de l'application.

## Installation sur GitHub Pages

1. Téléchargez et décompressez l'archive ZIP.
2. Dans le dépôt GitHub `Mushyn/memochant`, cliquez sur **Add file → Upload files**.
3. Téléversez **le contenu** du dossier décompressé `memochant-v0.1.4` à la racine du dépôt (pas le dossier lui-même), puis validez le commit.
4. Allez dans **Settings → Pages → Build and deployment** et choisissez **Deploy from a branch**, branche `main`, dossier `/(root)`, puis **Save**.
5. Après le déploiement, ouvrez `https://mushyn.github.io/memochant/` sur mobile.

Pour développer en local : `python3 -m http.server 8000` depuis ce dossier, puis ouvrez `http://localhost:8000` (ne pas ouvrir `index.html` en `file://` : les modules ES et la PWA nécessitent un serveur).

## Limites connues

- **Aucune reconnaissance vocale** dans cette version. Les badges sont une **simulation visuelle**, pas une analyse de récitation.
- Pas encore de geste d'inclinaison ou de retournement du téléphone.
- Le stockage `localStorage` reste lié au navigateur et peut disparaître si ses données sont effacées. Pas encore de synchronisation entre appareils ni d'export.
- L'unité « ½ ligne » est coupée approximativement au milieu des mots ; une segmentation manuelle viendra plus tard.
- Le mode « A+ » ajoute l'unité suivante en entier dans cette V0.1.4 ; la notation reste éditable.
- Le cache hors ligne couvre les fichiers de l'application, pas les contenus externes.
- Les paroles d'une chanson protégée ne sont pas incluses : importez vos propres textes, dans le respect des droits applicables.

## Architecture

`index.html` (structure), `style.css` (design), `app.js` (interface), `patterns.js` (moteur), `storage.js` (sauvegarde), `sw.js` (cache), `manifest.webmanifest` (PWA).


## Nouveautés de la V0.1.4

- Zone des paroles confinée au centre : commandes et progression restent toujours visibles sur iPhone.
- Bouton « Ajouter mes paroles » sur l’exemple initial.
- Bibliothèque : sélection, édition, suppression et sauvegarde locale des chansons.
- Après publication, recharger la page (ou fermer/réouvrir la PWA) pour mettre à jour le cache.
- Les paroles restent dans le navigateur de cet appareil ; aucune synchronisation entre appareils.

## Correctif V0.1.4

- Correction de la mise en page iPhone : le lecteur est contraint à la hauteur réellement disponible, avec une zone de paroles indépendante et un pied fixe dans le flux.
- Cache PWA désormais **network-first** : les fichiers à jour sont privilégiés quand le réseau est disponible ; mode hors connexion conservé.
- Identifiant de version visible en haut de l’application : `V0.1.4 · Prêt`, pour vérifier la mise à jour.
- CSS et JS versionnés dans la page pour éviter les anciennes ressources en cache.

**Mise à jour :** remplacer les fichiers à la racine de GitHub, attendre la fin du déploiement Pages, puis ouvrir `https://mushyn.github.io/memochant/?v=012` dans Safari. Vérifier la mention `V0.1.4 · Prêt`. Si l’ancienne interface persiste, supprimer uniquement les données du site concerné en dernier recours (attention : cela efface les chansons et patterns locaux).

## Mise à jour V0.1.4 — cache-first + contrôle de version

- Retour à **cache-first** pour les fichiers de l'application, avec fonctionnement hors connexion.
- Vérification explicite du `sw.js` publié au démarrage, au retour dans l'application, au retour du réseau et toutes les heures (si l'application est ouverte).
- Nouvelle version préchargée dans un cache séparé ; **pas d'activation automatique**.
- Bandeau discret « Nouvelle version disponible » : **Plus tard** ou **Mettre à jour**.
- Activation après consentement via `SKIP_WAITING`, puis rechargement sur `controllerchange`.
- Conservation des chansons, patterns et progressions en `localStorage` (ne pas effacer les données du site).

**À chaque livraison :** changer le numéro dans `sw.js` (CACHE), `index.html` (titre, version, CSS/JS) et `README.md`. Déployer tous les fichiers ensemble.

**Migration depuis V0.1.2 :** l'ancien Service Worker était en network-first et s'activait immédiatement. La V0.1.4 peut donc s'activer une première fois sans le nouveau bandeau. À partir de la V0.1.4, les mises à jour suivantes utilisent le bandeau de confirmation.
