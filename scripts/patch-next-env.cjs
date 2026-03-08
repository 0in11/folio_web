// Patch @next/env default export for CJS compatibility with Payload CLI
const nextEnv = require('@next/env');
const Module = require('module');
const originalResolveFilename = Module._resolveFilename;

// Ensure @next/env has a default export when loaded via ESM default import in CJS context
if (!nextEnv.default) {
  nextEnv.default = nextEnv;
}
