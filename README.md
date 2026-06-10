# Asteria Studio — tokens demo

## Structure
- `index.html` : page principale
- `css/styles.css` : styles de la page
- `tokens/primitives.json` : valeurs brutes exportées depuis Figma
- `tokens/semantic.json` : alias métier, avec BrandA et BrandB
- `tokens/mapped.json` : usages contextuels, avec Light et Dark
- `js/tokens.js` : charge les JSON et génère les variables CSS

## Utilisation
1. Ouvre le dossier dans VS Code.
2. Lance **Live Server** (ou un serveur local équivalent).
3. Ouvre `index.html`.
4. Modifie les fichiers JSON dans `tokens/`.

## Bonus
- `?brand=BrandB` pour basculer la marque.
- `?mode=Dark` pour basculer en dark mode.

Exemple :
`http://127.0.0.1:5500/index.html?brand=BrandB&mode=Dark`

## Notes
- Ouvrir `index.html` en double-cliquant peut bloquer `fetch()`.
- Il faut donc passer par un serveur local.
