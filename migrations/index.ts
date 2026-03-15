import * as migration_20260315_141721 from './20260315_141721';

export const migrations = [
  {
    up: migration_20260315_141721.up,
    down: migration_20260315_141721.down,
    name: '20260315_141721'
  },
];
