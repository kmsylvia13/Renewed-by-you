const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');
const workspaceRequire = name => createRequire(path.join(root, name, 'package.json'));
const dependencyRequire = (parent, name) => createRequire(parent.resolve(name));
const mobile = workspaceRequire('artifacts/renewed-by-you');
const expo = createRequire(mobile.resolve('expo/package.json'));
const cli = dependencyRequire(expo, '@expo/cli');
const canvas = workspaceRequire('artifacts/mockup-sandbox');
const micromatch = dependencyRequire(dependencyRequire(canvas, 'fast-glob'), 'micromatch');
const braces = micromatch('braces');
const forge = cli('node-forge');

test('lockfile removes vulnerable releases and applies every local patch', () => {
  const lock = readFileSync(path.join(root, 'pnpm-lock.yaml'), 'utf8');
  for (const spec of [
    'proxy-addr@2.0.7', 'source-map-js@1.2.1', 'brace-expansion@5.0.9',
    'uuid@7.0.3', 'fast-uri@3.1.7', 'decode-uri-component@0.2.2',
  ]) {
    assert.ok(!lock.includes(spec), `Vulnerable release remains: ${spec}`);
  }
  for (const spec of ['braces@3.0.3', 'node-forge@1.4.0', 'decode-uri-component@0.5.0']) {
    assert.ok(lock.includes(`${spec}(patch_hash=`), `Missing applied patch: ${spec}`);
  }
  assert.match(micromatch.resolve('braces'), /patch_hash=/);
  assert.match(cli.resolve('node-forge'), /patch_hash=/);
});

test('proxy-addr rejects unintended IPv4 trust from IPv6 subnets', () => {
  const api = workspaceRequire('artifacts/api-server');
  const proxyaddr = dependencyRequire(api, 'express')('proxy-addr');
  for (const subnet of ['::ffff:10.0.0.0/8', '::/1']) {
    assert.equal(proxyaddr.compile(subnet)('203.0.113.1'), false);
  }
  assert.equal(proxyaddr.compile('10.0.0.0/8')('10.1.2.3'), true);
  assert.equal(proxyaddr.compile('::ffff:10.0.0.0/104')('10.1.2.3'), true);
});

test('brace-expansion handles all three reported denial-of-service patterns', { timeout: 5000 }, () => {
  const plugins = dependencyRequire(cli, '@expo/config-plugins');
  const glob = dependencyRequire(plugins, 'glob');
  const { expand } = dependencyRequire(glob, 'minimatch')('brace-expansion');
  assert.deepEqual(expand('file-{a,b}.js'), ['file-a.js', 'file-b.js']);
  assert.doesNotThrow(() => expand('{' + '{a},'.repeat(7000) + 'b}'));
  assert.doesNotThrow(() => expand('{{x},' + 'a,'.repeat(125000) + 'b}'));
  assert.doesNotThrow(() => expand('{a,'.repeat(4000) + 'z' + '}'.repeat(4000)));
  assert.doesNotThrow(() => expand('{'.repeat(3200) + 'a,b' + '}'.repeat(3200)));
  assert.doesNotThrow(() => expand('{a}' + '}'.repeat(64000) + ',z}'));
});

test('braces preserves ordinary brace, range, parenthesis and escaped patterns', () => {
  assert.deepEqual(braces.expand('file-{a,b}.js'), ['file-a.js', 'file-b.js']);
  assert.deepEqual(braces.expand('{1..3}'), ['1', '2', '3']);
  assert.equal(braces.compile('a/{b,c}/d'), 'a/(b|c)/d');
  assert.equal(braces.stringify(braces.parse('({a,b})')), '({a,b})');
  assert.doesNotThrow(() => braces.compile('\\{'.repeat(4000)));
  assert.doesNotThrow(() => braces.compile('"{'.repeat(100) + '"'));
});

test('braces bounds nesting before any recursive walker runs', () => {
  for (const input of [
    '{'.repeat(4000) + 'a,b' + '}'.repeat(4000),
    '{'.repeat(4000),
    '('.repeat(4000) + 'x' + ')'.repeat(4000),
    '{('.repeat(2000) + 'x' + ')}'.repeat(2000),
  ]) {
    for (const method of ['parse', 'compile', 'expand', 'stringify']) {
      assert.throws(() => braces[method](input), {
        name: 'SyntaxError',
        message: /maximum nesting depth/,
      });
    }
  }
  let ast = { type: 'text', value: 'x' };
  for (let i = 0; i < 1000; i++) ast = { type: 'root', nodes: [ast] };
  for (const method of ['compile', 'expand', 'stringify']) {
    assert.throws(() => braces[method](ast), { name: 'SyntaxError' });
  }
  const cyclic = { type: 'root', nodes: [] };
  cyclic.nodes.push(cyclic);
  assert.throws(() => braces.compile(cyclic), { name: 'SyntaxError' });
});

test('node-forge rejects extra nested DigestAlgorithm elements, but verifies valid signatures', () => {
  const keys = forge.pki.rsa.generateKeyPair({ bits: 1024, e: 3 });
  const md = forge.md.sha256.create().update('dependency-security-regression');
  const digest = md.digest().getBytes();
  assert.equal(keys.publicKey.verify(digest, keys.privateKey.sign(md)), true);

  const asn1 = forge.asn1;
  const universal = (type, constructed, value) =>
    asn1.create(asn1.Class.UNIVERSAL, type, constructed, value);
  const oid = () => universal(asn1.Type.OID, false, asn1.oidToDer(forge.pki.oids.sha256).getBytes());
  const nullParameter = () => universal(asn1.Type.NULL, false, '');
  const garbage = () => universal(asn1.Type.OCTETSTRING, false, 'garbage');
  const signature = elements => {
    const info = universal(asn1.Type.SEQUENCE, true, [
      universal(asn1.Type.SEQUENCE, true, elements),
      universal(asn1.Type.OCTETSTRING, false, digest),
    ]);
    return forge.pki.rsa.encrypt(asn1.toDer(info).getBytes(), keys.privateKey, 1);
  };
  assert.equal(keys.publicKey.verify(digest, signature([oid()])), true);
  assert.equal(keys.publicKey.verify(digest, signature([oid(), nullParameter()])), true);
  for (const elements of [
    [oid(), nullParameter(), garbage()],
    [oid(), garbage()],
    [oid(), nullParameter(), nullParameter()],
  ]) {
    assert.throws(() => keys.publicKey.verify(digest, signature(elements)), /valid RSASSA-PKCS1-v1_5 DigestInfo/);
  }
});

test('xcode retains working UUID generation and uuid enforces output buffer bounds', () => {
  const xcode = dependencyRequire(dependencyRequire(cli, '@expo/config-plugins'), 'xcode');
  const uuid = xcode('uuid');
  assert.match(uuid.v4(), /^[a-f0-9-]{36}$/);
  assert.throws(() => uuid.v5('x', uuid.v5.DNS, new Uint8Array(8), 4), RangeError);
  const project = dependencyRequire(cli, '@expo/config-plugins')('xcode').project('unused.pbxproj');
  project.hash = { project: { objects: {} } };
  assert.match(project.generateUuid(), /^[A-F0-9]{24}$/);
});

test('patched decoder works through Expo Router query-string and handles malformed input', { timeout: 5000 }, () => {
  const router = createRequire(mobile.resolve('expo-router/package.json'));
  const queryRequire = dependencyRequire(router, 'query-string');
  const decode = queryRequire('decode-uri-component');
  assert.equal(typeof decode, 'function');
  assert.equal(decode('%E2%82%AC'), '€');
  assert.equal(decode('%ZZ'), '%ZZ');
  assert.equal(decode('hello%20world'), 'hello world');
  assert.doesNotThrow(() => decode('%FE%FF'.repeat(10000)));
  assert.equal(router('query-string').parse('q=%E2%82%AC').q, '€');
  assert.doesNotThrow(() => router('query-string').parse('q=' + '%FF'.repeat(10000)));
});

test('source-map-js still reads ordinary source maps', () => {
  const postcss = dependencyRequire(dependencyRequire(canvas, 'vite'), 'postcss');
  const { SourceMapConsumer } = postcss('source-map-js');
  const consumer = new SourceMapConsumer({
    version: 3, sources: ['input.js'], names: [], mappings: 'AAAA',
  });
  assert.equal(consumer.originalPositionFor({ line: 1, column: 0 }).source, 'input.js');
});

test('fast-uri canonicalizes percent-encoded hosts consistently', () => {
  const spec = workspaceRequire('lib/api-spec');
  const orval = dependencyRequire(spec, 'orval');
  const parser = dependencyRequire(orval, '@scalar/openapi-parser');
  const uri = dependencyRequire(parser, 'ajv')('fast-uri');
  assert.equal(uri.parse('//%41.com').host, 'a.com');
  assert.equal(uri.equal('//%41.com', '//a.com'), true);
});
