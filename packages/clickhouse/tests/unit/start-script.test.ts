import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

describe('start.sh script', () => {
  const tmpDir = path.join(__dirname, 'tmp_start_sh_test');
  const startShPath = path.join(__dirname, '../../start.sh');
  const testStartShPath = path.join(tmpDir, 'start.sh');

  beforeEach(() => {
    fs.mkdirSync(tmpDir, { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'users.d'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'config.d'), { recursive: true });

    // Mock config files
    fs.writeFileSync(
      path.join(tmpDir, 'users.d', 'littlescope.xml'),
      '<user>__CLICKHOUSE_USERNAME__</user>\n<password>__CLICKHOUSE_PASSWORD__</password>\n<db>__CLICKHOUSE_DB__</db>'
    );
    fs.writeFileSync(
      path.join(tmpDir, 'config.d', 'startup_script.xml'),
      '<db>__CLICKHOUSE_DB__</db>'
    );

    // Copy and modify start.sh for testing
    let script = fs.readFileSync(startShPath, 'utf-8');
    script = script.replace(
      'CONFIG_USER="/etc/clickhouse-server/users.d/littlescope.xml"',
      `CONFIG_USER="${path.join(tmpDir, 'users.d', 'littlescope.xml')}"`
    );
    script = script.replace(
      'STARTUP_SCRIPT="/etc/clickhouse-server/config.d/startup_script.xml"',
      `STARTUP_SCRIPT="${path.join(tmpDir, 'config.d', 'startup_script.xml')}"`
    );
    // Remove exec /entrypoint.sh
    script = script.replace('exec /entrypoint.sh "$@"', 'echo "Success"');

    fs.writeFileSync(testStartShPath, script);
    fs.chmodSync(testStartShPath, '755');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should replace variables with default values when env vars are missing', () => {
    execSync(testStartShPath, {
      env: { ...process.env, CLICKHOUSE_USERNAME: '', CLICKHOUSE_PASSWORD: '', CLICKHOUSE_DB: '' },
    });

    const usersContent = fs.readFileSync(path.join(tmpDir, 'users.d', 'littlescope.xml'), 'utf-8');
    expect(usersContent).toContain('<user>lightscope</user>');
    expect(usersContent).toContain('<password>lightscope</password>');
    expect(usersContent).toContain('<db>lightscope</db>');

    const startupContent = fs.readFileSync(
      path.join(tmpDir, 'config.d', 'startup_script.xml'),
      'utf-8'
    );
    expect(startupContent).toContain('<db>lightscope</db>');
  });

  it('should replace variables with provided environment variables', () => {
    execSync(testStartShPath, {
      env: {
        ...process.env,
        CLICKHOUSE_USERNAME: 'test_user',
        CLICKHOUSE_PASSWORD: 'test_password',
        CLICKHOUSE_DB: 'test_db',
      },
    });

    const usersContent = fs.readFileSync(path.join(tmpDir, 'users.d', 'littlescope.xml'), 'utf-8');
    expect(usersContent).toContain('<user>test_user</user>');
    expect(usersContent).toContain('<password>test_password</password>');
    expect(usersContent).toContain('<db>test_db</db>');

    const startupContent = fs.readFileSync(
      path.join(tmpDir, 'config.d', 'startup_script.xml'),
      'utf-8'
    );
    expect(startupContent).toContain('<db>test_db</db>');
  });
});
