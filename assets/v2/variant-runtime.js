/*
 * Yangzhou V2: optional, seeded per-tile painted scenery variation.
 * Load AFTER tile-topology.js and tile-art-v2.js.  If no variant-pools.json
 * is installed, the existing base painter continues to draw unmodified.
 *
 * Never rotate artwork. A candidate may be used ONLY when both the tile's
 * archetype and its literal N/E/S/W edge signature match the candidate pool.
 * Fixed Slender West Lake tiles always use their distinct original paintings.
 */
(() => {
  'use strict';
  const artist = window.YangzhouArtV2;
  const topology = window.YangzhouTileTopology;
  if (!artist || !topology) return;
  const fallbackDraw = artist.draw.bind(artist);
  const fallbackInspect = artist.inspect.bind(artist);
  const T = topology.size;
  const pools = new Map();
  const images = new Map();
  const failures = new Set();
  let ready = false;
  let gameSeed = Math.floor(Math.random() * 0x100000000) >>> 0;
  const legalPath = /^variants\/[a-z-]+\/[a-z0-9-]+\.webp$/;
  const keyOf = (id, edges) => String(id) + ':' + edges;

  // FNV-1a on a stable, bounded string; unlike Math.random() inside draw,
  // this doesn't change the image on each frame, zoom, pan or redraw.
  function hash(text) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }
  function choose(tile) {
    if (!ready || !tile || tile.fixed || !Array.isArray(tile.edges)) return null;
    const signature = tile.edges.join('');
    const pool = pools.get(keyOf(tile.id, signature));
    if (!pool || pool.length === 0) return null;
    if (typeof tile.artVariantId === 'string') {
      const exact = pool.find(v => v.id === tile.artVariantId);
      if (exact) return exact;
    }
    const identity = [gameSeed, tile.id, signature,
      Number.isInteger(tile.x) ? tile.x : 0,
      Number.isInteger(tile.y) ? tile.y : 0,
      Number.isInteger(tile.seed) ? tile.seed : 0].join('|');
    const seed = hash(identity);
    const weights = pool.map(v => (Number.isInteger(v.weight) && v.weight > 0) ? v.weight : 1);
    const total = weights.reduce((a, b) => a + b, 0);
    let selection = seed % total;
    for (let i = 0; i < pool.length; i++) {
      if (selection < weights[i]) return pool[i];
      selection -= weights[i];
    }
    return pool[0];
  }
  function repaint() {
    if (window.YangzhouDebug?.state) window.YangzhouDebug.state.dirty = true;
    window.dispatchEvent(new Event('yangzhou-art-v2-updated'));
  }
  function draw(c, tile) {
    if (!tile || tile.fixed) return fallbackDraw(c, tile);
    const selection = choose(tile);
    const im = selection && images.get(selection.file);
    if (!im?.complete || im.naturalWidth !== 1254 || im.naturalHeight !== 1254) {
      return fallbackDraw(c, tile);
    }
    c.save();
    c.translate(tile.x * T, tile.y * T);
    c.beginPath();
    c.rect(0, 0, T, T);
    c.clip();
    c.drawImage(im, 0, 0, T, T);
    c.restore();
    return true;
  }
  function inspect() {
    const original = fallbackInspect();
    let loaded = 0;
    for (const im of images.values()) if (im.complete && im.naturalWidth === 1254) loaded++;
    return {...original, variantPoolReady: ready, variantPools: pools.size,
      variantCandidates: images.size, variantPaintingsLoaded: loaded,
      variantFailures: [...failures]};
  }
  function setGameSeed(seed) {
    if (!Number.isInteger(seed)) throw Error('Game seed must be an integer');
    gameSeed = seed >>> 0;
    repaint();
  }
  function reroll() { setGameSeed(Math.floor(Math.random() * 0x100000000)); }
  function getSelectedVariant(tile) {
    const variant = choose(tile);
    return variant ? {id: variant.id, file: variant.file, edges:tile.edges.join('')} : null;
  }
  window.YangzhouVariantDeck = Object.freeze({inspect, getSelectedVariant, setGameSeed, reroll,
    get gameSeed() { return gameSeed; }});
  artist.draw = draw;
  artist.inspect = inspect;

  fetch('assets/v2/variant-pools.json').then(r => {
    if (!r.ok) throw Error('Optional variant pool manifest is not installed');
    return r.json();
  }).then(m => {
    if (m.schemaVersion !== 1 || !Array.isArray(m.pools)) throw Error('Invalid variant pool version');
    if (m.pools.length > 32) throw Error('Too many variant pools');
    for (const group of m.pools) {
      if (!topology.archetypes.some(a => a.id === group.archetype)) throw Error('Unknown painted tile family');
      const arch = topology.archetypes.find(a => a.id === group.archetype);
      const legal = Array.from({length:4},(_,r) => topology.rotateEdges(arch.edges,r).join(''));
      if (!legal.includes(group.edges)) throw Error('Incompatible connector signature');
      if (!Array.isArray(group.variants) || group.variants.length > 32) throw Error('Invalid painting pool');
      const poolKey = keyOf(group.archetype, group.edges);
      if (pools.has(poolKey)) throw Error('Duplicate painting pool');
      const safe = [];
      for (const v of group.variants) {
        if (!legalPath.test(v.file) || !v.file.startsWith('variants/'+group.archetype+'/')) throw Error('Invalid art path');
        if (v.width !== 1254 || v.height !== 1254 || typeof v.id !== 'string') throw Error('Invalid art dimensions');
        safe.push(v);
        if (!images.has(v.file)) {
          const im = new Image();
          im.onload = () => {
            if (im.naturalWidth !== 1254 || im.naturalHeight !== 1254) failures.add('Wrong-sized image '+v.file);
            repaint();
          };
          im.onerror = () => {failures.add('Failed to load '+v.file);repaint();};
          im.src = 'assets/v2/' + v.file;
          images.set(v.file,im);
        }
      }
      pools.set(poolKey,safe);
    }
    ready = true;
    repaint();
  }).catch(err => {
    // Optional pack. Baseline painter and original starter lake always work.
    if (!/not installed/.test(String(err))) failures.add(String(err));
  });
})();
