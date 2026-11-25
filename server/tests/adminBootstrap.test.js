const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');

test('admin bootstrap uses configured credentials, preserves records, and avoids duplicates', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'hirespot-admin-'));
  const dataPath = path.join(directory, 'data.json');
  const fixtureUser = { _id: 'kept-user', name: 'Existing Candidate', email: 'candidate@example.test', role: 'candidate', passwordHash: await bcrypt.hash('candidate-password', 10), active: true };
  fs.writeFileSync(dataPath, JSON.stringify({ users: [fixtureUser], profiles: [], jobs: [], applications: [] }));
  const scriptPath = path.join(__dirname, '..', 'scripts', 'bootstrapAdmin.js');
  const env = { ...process.env, DATA_PATH: dataPath, ADMIN_EMAIL: 'Owner@Example.test', ADMIN_PASSWORD: 'a-strong-bootstrap-password' };
  delete env.ADMIN_NAME;

  try {
    execFileSync(process.execPath, [scriptPath], { env, stdio: 'pipe' });
    const firstRun = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    assert.equal(firstRun.users.length, 2);
    assert.equal(firstRun.users[0]._id, fixtureUser._id, 'existing user data must remain intact');
    const admin = firstRun.users.find(user => user.role === 'admin');
    assert.equal(admin.email, 'owner@example.test');
    assert.equal(admin.name, 'HireSpot Admin');
    assert.equal(await bcrypt.compare(env.ADMIN_PASSWORD, admin.passwordHash), true);
    assert.equal(admin.password, undefined);

    execFileSync(process.execPath, [scriptPath], { env, stdio: 'pipe' });
    const secondRun = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    assert.equal(secondRun.users.filter(user => user.role === 'admin').length, 1, 'running bootstrap again must not duplicate admin');
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
