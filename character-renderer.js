/* Compatibility shim for the Production Kit loader in js/main.js.
 * main.js is a classic script, so import('./character-renderer.js') resolves
 * relative to the document URL (repo root), not to /js/main.js.
 */
await import('./js/character-renderer.js');
