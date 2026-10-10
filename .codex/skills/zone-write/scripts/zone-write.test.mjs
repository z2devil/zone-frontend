import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  apiRequest,
  authUserFromResponse,
  buildVisibleLoginAppleScript,
  createKeychainCredentialStore,
  isLocalAssetUrl,
  loginInVisibleTerminal,
  loginWithEmail,
  markdownToSlate,
  materializeLocalAssets,
  normalizeCodeLanguage,
  normalizeLoginEmail,
  normalizeMarkdownSource,
  prepareContent,
  redactUnverifiedPrivateNote,
  resolveAuthToken,
  uploadZoneImage,
  validateApiBase,
  validateVerificationCode,
  verifySavedNote,
} from './zone-write.mjs';

test('converts Markdown structure and inline marks to Slate', () => {
  const slate = markdownToSlate(`## 方案

这是一个 **可靠** 的方案，使用 \`pnpm test\` 验证。

- 先写测试
- 再实现

\`\`\`ts
const ok = true;
\`\`\``);

  assert.equal(slate[0].type, 'heading-2');
  assert.equal(slate[1].type, 'paragraph');
  assert.equal(slate[1].children[1].bold, true);
  assert.equal(slate[1].children[3].type, 'code-span');
  assert.equal(slate[2].type, 'ul-list');
  assert.equal(slate[2].children.length, 2);
  assert.equal(slate[3].type, 'code-block');
  assert.equal(slate[3].language, 'typescript');
  assert.equal(slate[3].children[0].type, 'code-line-block');
});

test('normalizes code aliases and preserves Mermaid for future rendering', () => {
  assert.equal(normalizeCodeLanguage('TS'), 'typescript');
  assert.equal(normalizeCodeLanguage('shell'), 'bash');
  assert.equal(normalizeCodeLanguage('mermaid'), 'mermaid');

  const prepared = prepareContent({
    markdown: '```mermaid\ngraph TD; A --> B\n```',
    title: '流程图',
  });
  const slate = JSON.parse(prepared.payload.content);

  assert.equal(slate[0].language, 'mermaid');
  assert.match(prepared.warnings.join('\n'), /mermaid/);
});

test('normalizes frontmatter, duplicate title, and GFM tables', () => {
  const source = `---
title: 测试文章
draft: true
---

# 测试文章

| 项目 | 结论 |
| --- | --- |
| 历史 | 只保存最终文本 |`;
  assert.equal(normalizeMarkdownSource(source).startsWith('# 测试文章'), true);

  const slate = markdownToSlate(source, { title: '测试文章' });
  assert.equal(
    slate.some(block => block.type === 'heading-1'),
    false
  );
  assert.equal(slate.length, 1);
  assert.match(
    slate[0].children.map(child => child.text).join(''),
    /项目：历史/
  );
  assert.match(
    slate[0].children.map(child => child.text).join(''),
    /结论：只保存最终文本/
  );
});

const paragraph = text => ({ type: 'paragraph', children: [{ text }] });

const collapsible = (title, content, collapsed) => ({
  type: 'collapsible-block',
  collapsed,
  children: [
    {
      type: 'collapsible-block-title',
      children: [{ type: 'paragraph', children: title }],
    },
    { type: 'collapsible-block-content', children: content },
  ],
});

test('converts details/summary into a collapsed collapsible block', () => {
  const slate = markdownToSlate(
    '<details><summary>标题</summary>\n\n内容\n\n</details>'
  );

  assert.deepEqual(slate, [
    collapsible([{ text: '标题' }], [paragraph('内容')], true),
  ]);
});

test('maps details open to an expanded block and supports nesting', () => {
  const slate = markdownToSlate(`<details open>
<summary>外层 **重点**</summary>

- 一
- 二

<details><summary>内层</summary>

内层内容

</details>

</details>

后文`);

  assert.equal(slate.length, 2);
  const [outer, after] = slate;
  assert.equal(outer.type, 'collapsible-block');
  assert.equal(outer.collapsed, false);
  assert.deepEqual(outer.children[0].children[0].children, [
    { text: '外层 ' },
    { text: '重点', bold: true },
  ]);
  const [list, inner] = outer.children[1].children;
  assert.equal(list.type, 'ul-list');
  assert.deepEqual(
    inner,
    collapsible([{ text: '内层' }], [paragraph('内层内容')], true)
  );
  assert.deepEqual(after, paragraph('后文'));
});

test('converts single-line details and details inside quotes', () => {
  assert.deepEqual(
    markdownToSlate('<details><summary>T</summary>行内内容</details>'),
    [collapsible([{ text: 'T' }], [paragraph('行内内容')], true)]
  );

  const [quote] = markdownToSlate(
    '> <details><summary>T</summary>\n>\n> 引用内容\n>\n> </details>'
  );
  assert.equal(quote.type, 'block-quote');
  assert.deepEqual(quote.children, [
    collapsible([{ text: 'T' }], [paragraph('引用内容')], true),
  ]);
});

test('keeps an empty paragraph for details without summary or content', () => {
  assert.deepEqual(markdownToSlate('<details>\n</details>'), [
    collapsible([{ text: '' }], [paragraph('')], true),
  ]);
});

test('defaults prepared ideas to private and preserves API limits', () => {
  const prepared = prepareContent({
    markdown: '一个值得继续验证的想法。',
    title: '新的想法',
  });

  assert.equal(prepared.kind, 'note');
  assert.equal(prepared.visibility, 'private');
  assert.equal(prepared.payload.visibility, 'private');
  assert.deepEqual(prepared.payload.tags, []);
});

test('detects local images and materializes them before publishing', async () => {
  const prepared = prepareContent({
    markdown: '![封面](./assets/cover.png)',
    title: '带图片的文章',
  });
  assert.equal(prepared.preview.localAssets, 1);
  assert.equal(isLocalAssetUrl('./assets/cover.png'), true);
  assert.equal(isLocalAssetUrl('https://example.com/cover.png'), false);
  assert.equal(isLocalAssetUrl('zone/image/cover.png'), false);

  const uploads = [];
  const result = await materializeLocalAssets({
    prepared,
    input: '/tmp/article/post.md',
    bannerFile: '/tmp/article/banner.png',
    token: 'token',
    upload: async ({ filePath }) => {
      uploads.push(filePath);
      return `zone/image/${filePath.includes('banner') ? 'banner' : 'cover'}.png`;
    },
  });
  const slate = JSON.parse(result.prepared.payload.content);
  assert.equal(slate[0].url, 'zone/image/cover.png');
  assert.equal(result.prepared.payload.bannerPath, 'zone/image/banner.png');
  assert.deepEqual(uploads, [
    '/tmp/article/assets/cover.png',
    '/tmp/article/banner.png',
  ]);
  assert.equal(result.uploaded, 2);
});

test('uploads images with a short-lived policy and returns a Zone path', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'zone-write-'));
  const filePath = path.join(directory, 'cover.png');
  await fs.writeFile(filePath, Buffer.from('fake-png'));
  let form;
  try {
    const storagePath = await uploadZoneImage({
      filePath,
      token: 'token',
      ossConfig: {
        uploadUrl: 'https://bucket.oss.example.com',
        root: 'zone',
      },
      request: async (requestPath, options) => {
        assert.equal(requestPath, '/oss/policy');
        assert.equal(options.token, 'token');
        return {
          policy: 'policy',
          signature: 'signature',
          accessKeyId: 'access-key',
        };
      },
      fetcher: async (url, options) => {
        assert.equal(url, 'https://bucket.oss.example.com');
        form = options.body;
        return { ok: true, status: 200 };
      },
    });
    assert.match(storagePath, /^zone\/image\/[a-f0-9]{20}\.png$/);
    assert.equal(form.get('key'), storagePath);
    assert.equal(form.get('policy'), 'policy');
    assert.equal(form.get('success_action_status'), '200');
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});

test('warns before publishing suspicious public content', () => {
  const prepared = prepareContent({
    markdown: '不要把 secret 放进公开文章。',
    title: '安全提醒',
    kind: 'article',
    visibility: 'public',
  });

  assert.equal(prepared.warnings.length, 2);
});

test('rejects invalid title and excessive tags', () => {
  assert.throws(
    () => prepareContent({ markdown: '正文', title: '' }),
    /标题不能为空/
  );
  assert.throws(
    () =>
      prepareContent({
        markdown: '正文',
        title: '标题',
        tags: ['1', '2', '3', '4', '5', '6'],
      }),
    /标签最多 5 个/
  );
});

test('preserves omitted visibility and tags during updates', () => {
  const prepared = prepareContent({
    markdown: '更新后的正文。',
    title: '更新标题',
    includeVisibility: false,
    includeTags: false,
  });

  assert.equal(prepared.visibility, 'preserve');
  assert.equal(prepared.tag_labels, 'preserve');
  assert.ok(!('visibility' in prepared.payload));
  assert.ok(!('tags' in prepared.payload));
});

test('allows HTTPS and local HTTP API targets only', () => {
  assert.equal(
    validateApiBase('https://z2devil.cn/api/'),
    'https://z2devil.cn/api'
  );
  assert.equal(
    validateApiBase('http://127.0.0.1:2333/api'),
    'http://127.0.0.1:2333/api'
  );
  assert.throws(
    () => validateApiBase('http://example.com/api'),
    /必须使用 HTTPS/
  );
  assert.throws(
    () => validateApiBase('https://user:secret@example.com/api'),
    /不得包含凭据/
  );
});

test('normalizes login email and validates a four-digit verification code', () => {
  assert.equal(normalizeLoginEmail(' User@Example.COM '), 'user@example.com');
  assert.equal(validateVerificationCode(' 1234 '), '1234');
  assert.throws(() => normalizeLoginEmail('invalid'), /邮箱格式不正确/);
  assert.throws(() => validateVerificationCode('12345'), /4 位数字验证码/);
});

test('accepts nested or direct auth info and normalizes string levels', () => {
  assert.deepEqual(
    authUserFromResponse({
      info: { _id: 'owner-1', nickname: 'owner', lv: '2' },
    }),
    { _id: 'owner-1', nickname: 'owner', lv: 2 }
  );
  assert.deepEqual(
    authUserFromResponse({ _id: 'owner-2', nickname: 'owner', lv: 2 }),
    { _id: 'owner-2', nickname: 'owner', lv: 2 }
  );
  assert.deepEqual(
    authUserFromResponse({
      user: { id: 'owner-3', name: 'owner', level: '2' },
    }),
    { _id: 'owner-3', nickname: 'owner', lv: 2 }
  );
  assert.deepEqual(
    authUserFromResponse({ authenticated: true }, { requireId: false }),
    { _id: undefined, nickname: undefined, lv: undefined }
  );
});

test('builds a visible Terminal login flow without embedding secrets', () => {
  const script = buildVisibleLoginAppleScript({
    email: 'owner@example.com',
    scriptPath: "/tmp/Zone Writer's/zone-write.mjs",
    nodePath: '/usr/local/bin/node',
    workdir: "/tmp/Zone Writer's",
  });
  assert.match(script, /tell application "Terminal"/);
  assert.match(script, /delay 1\nrepeat while busy/);
  assert.match(script, /repeat while busy of loginTab/);
  assert.match(script, /owner@example\.com/);
  assert.match(script, /Zone Writer/);
  assert.match(script, /\\"'\\"/);
  assert.doesNotMatch(script, /token|验证码/);
});

test('completes background login through a visible Terminal and verifies it', async () => {
  const calls = [];
  const result = await loginInVisibleTerminal({
    email: 'owner@example.com',
    platform: 'darwin',
    execute: async (command, args) => {
      calls.push({ command, args });
      return { status: 0, stdout: '', stderr: '' };
    },
    credentialStore: { get: async () => 'stored-token' },
    request: async (requestPath, options) => {
      assert.equal(requestPath, '/auth/info');
      assert.equal(options.token, 'stored-token');
      return { info: { _id: 'owner-1', nickname: 'owner', lv: 2 } };
    },
  });
  assert.equal(calls[0].command, 'osascript');
  assert.equal(result.authenticated, true);
  assert.equal(result.canPublish, true);
});

test('resolves the environment token before the credential store', async () => {
  let storeReads = 0;
  const token = await resolveAuthToken({
    required: true,
    env: { ZONE_AUTH_TOKEN: ' env-token ' },
    baseUrl: 'https://z2devil.cn/api',
    credentialStore: {
      get: async () => {
        storeReads++;
        return 'stored-token';
      },
    },
  });

  assert.equal(token, 'env-token');
  assert.equal(storeReads, 0);
});

test('falls back to the stored token and gives an actionable login error', async () => {
  const credentialStore = {
    get: async () => ' stored-token ',
  };
  assert.equal(
    await resolveAuthToken({
      required: true,
      env: {},
      baseUrl: 'https://z2devil.cn/api',
      credentialStore,
    }),
    'stored-token'
  );
  await assert.rejects(
    resolveAuthToken({
      required: true,
      env: {},
      baseUrl: 'https://z2devil.cn/api',
      credentialStore: { get: async () => undefined },
    }),
    /zone-write\.mjs login --email/
  );
});

test('stores Keychain secrets through stdin instead of process arguments', async () => {
  const calls = [];
  const credentialStore = createKeychainCredentialStore({
    platform: 'darwin',
    run: async (command, args, options) => {
      calls.push({ command, args, options });
      return { status: 0, stdout: '', stderr: '' };
    },
  });

  await credentialStore.set('https://z2devil.cn/api', 'secret-token');

  assert.equal(calls[0].command, 'xcrun');
  assert.equal(calls[0].args[0], 'swift');
  assert.equal(calls[0].args[2], 'set');
  assert.ok(!calls[0].args.includes('secret-token'));
  assert.equal(calls[0].options.input, 'secret-token');
});

test('login verifies the issued token before storing it', async () => {
  const requests = [];
  const saved = [];
  const result = await loginWithEmail({
    email: ' Owner@Example.com ',
    baseUrl: 'https://z2devil.cn/api',
    request: async (path, options) => {
      requests.push({ path, options });
      if (path.startsWith('/auth/code?')) return null;
      if (path === '/auth/sign') {
        return {
          token: 'issued-token',
          info: { _id: 'user-1', nickname: 'owner', lv: 2 },
        };
      }
      if (path === '/auth/info') {
        return { info: { _id: 'user-1', nickname: 'owner', lv: 2 } };
      }
      throw new Error(`unexpected path: ${path}`);
    },
    readCode: async () => '1234',
    credentialStore: {
      set: async (baseUrl, token) => saved.push({ baseUrl, token }),
    },
    notify: () => {},
  });

  assert.match(requests[0].path, /email=owner%40example\.com/);
  assert.deepEqual(requests[1].options.body, {
    email: 'owner@example.com',
    code: '1234',
  });
  assert.equal(requests[2].options.token, 'issued-token');
  assert.deepEqual(saved, [
    { baseUrl: 'https://z2devil.cn/api', token: 'issued-token' },
  ]);
  assert.deepEqual(result, {
    authenticated: true,
    credentialSource: 'keychain',
    user: { _id: 'user-1', nickname: 'owner', lv: 2 },
    canPublish: true,
  });
});

test('does not store a token when server-side verification fails', async () => {
  let saved = false;
  await assert.rejects(
    loginWithEmail({
      email: 'owner@example.com',
      baseUrl: 'https://z2devil.cn/api',
      request: async path => {
        if (path.startsWith('/auth/code?')) return null;
        if (path === '/auth/sign') return { token: 'invalid-token' };
        throw new Error('登录凭证验证失败');
      },
      readCode: async () => '1234',
      credentialStore: {
        set: async () => {
          saved = true;
        },
      },
      notify: () => {},
    }),
    /登录凭证验证失败/
  );
  assert.equal(saved, false);
});

test('verifies title and visibility after a write', () => {
  const content = JSON.stringify([
    { type: 'paragraph', children: [{ text: '正文' }] },
  ]);
  const note = {
    _id: 'note-1',
    title: '安全历史设计',
    visibility: 'private',
    content,
  };
  assert.equal(
    verifySavedNote(note, {
      title: '安全历史设计',
      visibility: 'private',
      content,
    }),
    note
  );
  assert.throws(
    () => verifySavedNote(note, { visibility: 'public' }),
    /可见性/
  );
  assert.throws(
    () =>
      verifySavedNote(
        {
          ...note,
          content: JSON.stringify([
            {
              type: 'code-block',
              language: 'plantuml',
              children: [
                { type: 'code-line-block', children: [{ text: 'graph TD' }] },
              ],
            },
          ]),
        },
        { content }
      ),
    /代码语言|正文/
  );
});

test('redacts content when a private creation cannot be verified', async () => {
  let captured;
  await redactUnverifiedPrivateNote({
    noteId: 'note-1',
    token: 'token',
    request: async (requestPath, options) => {
      captured = { requestPath, options };
    },
  });
  assert.equal(captured.requestPath, '/note');
  assert.equal(captured.options.method, 'PUT');
  assert.equal(captured.options.body._id, 'note-1');
  assert.equal(captured.options.body.bannerPath, '');
  assert.deepEqual(captured.options.body.tags, []);
  assert.doesNotMatch(captured.options.body.content, /原始正文/);
});

const mockFetchResponse = (t, response) =>
  t.mock.method(globalThis, 'fetch', async () => response);

test('apiRequest returns envelope data on success', async t => {
  mockFetchResponse(
    t,
    new Response(JSON.stringify({ code: 200, data: { ok: 1 }, message: '' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  );
  assert.deepEqual(await apiRequest('/tag'), { ok: 1 });
});

test('apiRequest reads the envelope message on non-2xx status', async t => {
  mockFetchResponse(
    t,
    new Response(
      JSON.stringify({
        code: 403,
        data: null,
        message: [{ message: '没有权限修改该笔记' }],
      }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    )
  );
  await assert.rejects(apiRequest('/note'), /没有权限修改该笔记/);
});

test('apiRequest reports HTTP status when the body is not an envelope', async t => {
  mockFetchResponse(
    t,
    new Response('<html>502 Bad Gateway</html>', {
      status: 502,
      headers: { 'Content-Type': 'text/html' },
    })
  );
  await assert.rejects(apiRequest('/note'), /HTTP 502/);
});
