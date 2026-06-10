const loadJson = async (path) => {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Impossible de charger ${path}`);
  return response.json();
};

const resolveToken = (value, tokens, seen = new Set()) => {
  if (typeof value !== 'string') return value;
  const match = value.match(/^\{(.+)\}$/);
  if (!match) return value;

  const ref = match[1];
  if (seen.has(ref)) throw new Error(`Référence circulaire détectée: ${ref}`);
  seen.add(ref);

  let next;
  if (ref.startsWith('color.')) {
    next = ref.split('.').slice(1).reduce((acc, key) => acc?.[key], tokens.primitives.color);
  } else if (ref.startsWith('semantic.')) {
    next = ref.split('.').slice(1).reduce((acc, key) => acc?.[key], tokens.semantic[tokens.activeBrand]);
  } else if (ref.startsWith('mapped.')) {
    next = ref.split('.').slice(1).reduce((acc, key) => acc?.[key], tokens.mapped[tokens.activeMode]);
  } else {
    next = value;
  }

  return typeof next === 'string' && /^\{.+\}$/.test(next)
    ? resolveToken(next, tokens, seen)
    : (next ?? value);
};

const buildCssVars = (tokens) => {
  const vars = [];

  const add = (name, value) => vars.push([name, value]);

  for (const [group, value] of Object.entries(tokens.primitives.color || {})) {
    if (value && typeof value === 'object') {
      for (const [shade, hex] of Object.entries(value)) add(`--primitive-color-${group}-${shade}`, hex);
    } else {
      add(`--primitive-color-${group}`, value);
    }
  }

  for (const [k, v] of Object.entries(tokens.primitives.spacing || {})) add(`--space-${k}`, `${v}px`);
  for (const [k, v] of Object.entries(tokens.primitives.radius || {})) add(`--radius-${k}`, `${v}px`);

  const sem = tokens.semantic[tokens.activeBrand] || tokens.semantic.BrandA || {};
  for (const [k, v] of Object.entries(sem)) add(`--semantic-color-${k}`, resolveToken(v, tokens));

  const map = tokens.mapped[tokens.activeMode] || tokens.mapped.Light || {};
  for (const [k, v] of Object.entries(map)) add(`--mapped-${k}`, resolveToken(v, tokens));

  return vars;
};

(async () => {
  try {
    const [primitives, semantic, mapped] = await Promise.all([
      loadJson('tokens/primitives.json'),
      loadJson('tokens/semantic.json'),
      loadJson('tokens/mapped.json')
    ]);

    const activeBrand = new URLSearchParams(window.location.search).get('brand') === 'BrandB' ? 'BrandB' : 'BrandA';
    const activeMode = new URLSearchParams(window.location.search).get('mode') === 'Dark' ? 'Dark' : 'Light';

    const tokens = { primitives, semantic, mapped, activeBrand, activeMode };
    const vars = buildCssVars(tokens);

    const style = document.createElement('style');
    style.id = 'token-runtime';
    style.textContent = `:root{${vars.map(([k, v]) => `${k}:${v};`).join('')}}`;
    document.head.appendChild(style);

    const label = document.getElementById('brand-mode-label');
    if (label) label.textContent = `${activeBrand === 'BrandA' ? 'Brand A' : 'Brand B'} / ${activeMode}`;

  } catch (error) {
    console.error(error);
    document.body.insertAdjacentHTML(
      'afterbegin',
      `<div style="padding:16px;background:#fee2e2;color:#991b1b;font-family:system-ui">
        Erreur de chargement des tokens. Lance le projet via un serveur local (Live Server dans VS Code).
      </div>`
    );
  }
})();
