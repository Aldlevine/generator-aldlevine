#!/usr/bin/env node

const shell = require('./shell');

function cleanup ()
{
  shell('git stash pop -q');
}

if (shell('git checkout HEAD -- docs && git stash save --keep-index -q \"precommit stash\"')) process.exit(1);

if (shell('npm run build -s')) {
  cleanup();
  process.exit(1);
}

if (shell('git add package.json')) {
  cleanup();
  process.exit(1);
}

cleanup();
