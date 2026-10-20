// 煲珠公 Token 抓取（Quantumult X，响应阶段）v14 — GitHub 文件中转（用户方案：txt 覆盖写入）
// 流程：抓到 M-Access-Token → 与上次比对，仅变化时：
//   1) 弹一条通知，正文就是 token 本身（点击可直达 Scriptable 查询）
//   2) 覆盖写入 GitHub 仓库的 bzg_token.txt（Scriptable 从那里读取，等价"手机上的 txt 文件"）
//
// ── 使用前必填 ──────────────────────────────────────────────
// 1. GitHub 创建一个仓库（建议 Private），记下 owner/repo 名，填到下面 GH_OWNER/GH_REPO
// 2. GitHub → Settings → Developer settings → Personal access tokens (classic)
//    → Generate new token (classic)，勾选 repo 权限，把生成的 token 填到 GH_TOKEN
// ───────────────────────────────────────────────────────────

const GH_OWNER = 'REPLACE_OWNER';
const GH_REPO  = 'REPLACE_REPO';
const GH_PATH  = 'bzg_token.txt';
const GH_TOKEN = 'REPLACE_GITHUB_PAT';

const KEY_TOKEN  = 'bzg_token';
const KEY_PUSHED = 'bzg_pushed_token';
const KEY_FAILTS = 'bzg_pushfail_ts';
const BRIDGE_PATH = '/__bzg_token__';
const SCRIPTABLE_NAME = 'BZGQuery';

function getStore(k){
  if (typeof $prefs !== 'undefined') return $prefs.valueForKey(k);
  if (typeof $persistentStore !== 'undefined') return $persistentStore.read(k);
  return null;
}
function setStore(k, v){
  if (typeof $prefs !== 'undefined') $prefs.setValueForKey(v, k);
  else if (typeof $persistentStore !== 'undefined') $persistentStore.write(v, k);
}
function notify(title, subtitle, message, opts){
  if (typeof $notify !== 'undefined') $notify(title, subtitle, message, opts || {});
  else if (typeof $notification !== 'undefined') $notification.post(title, subtitle, message);
}

// 纯 JS base64（token 是 ASCII，够用）
function b64(str){
  const C = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let out = '';
  for (let i = 0; i < str.length; i += 3){
    const b1 = str.charCodeAt(i), b2 = str.charCodeAt(i+1), b3 = str.charCodeAt(i+2);
    out += C.charAt(b1 >> 2);
    out += C.charAt(((b1 & 3) << 4) | (isNaN(b2) ? 0 : (b2 >> 4)));
    out += isNaN(b2) ? '=' : C.charAt(((b2 & 15) << 2) | (isNaN(b3) ? 0 : (b3 >> 6)));
    out += isNaN(b3) ? '=' : C.charAt(b3 & 63);
  }
  return out;
}

function ghGetSha(cb){
  const url = 'https://api.github.com/repos/' + GH_OWNER + '/' + GH_REPO + '/contents/' + GH_PATH + '?ts=' + Date.now();
  $task.fetch({ url: url, method: 'GET',
    headers: { 'Authorization': 'token ' + GH_TOKEN, 'User-Agent': 'qx-bzg' }
  }).then(r => {
    if (r.status === 200) { try { cb(JSON.parse(r.body).sha || null); return; } catch(e){} }
    cb(null); // 404 = 文件还不存在，直接创建
  }).catch(() => cb(null));
}

function ghPut(sha, content, cb){
  const payload = { message: 'bzg token update', content: b64(content) };
  if (sha) payload.sha = sha;
  $task.fetch({ url: 'https://api.github.com/repos/' + GH_OWNER + '/' + GH_REPO + '/contents/' + GH_PATH,
    method: 'PUT',
    headers: { 'Authorization': 'token ' + GH_TOKEN, 'User-Agent': 'qx-bzg', 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(r => cb(r.status)).catch(() => cb(-1));
}

const reqUrl = ($request && $request.url) || '';

// ── 分支 A：桥接路径（保留，Scriptable 也可直接取）────────────
if (reqUrl.indexOf(BRIDGE_PATH) !== -1) {
  const tok = getStore(KEY_TOKEN) || 'NO_TOKEN';
  $done({
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    body: tok
  });
} else {
  // ── 分支 B：抓取小程序 token ─────────────────────────────
  const reqHeaders = ($request && $request.headers) ? $request.headers : {};
  let token = '';
  for (const k in reqHeaders) {
    if (k.toLowerCase() === 'm-access-token') { token = (reqHeaders[k] || '').trim(); break; }
  }

  if (token && token.length > 20 && token !== getStore(KEY_TOKEN)) {
    setStore(KEY_TOKEN, token);

    // 通知：正文就是 token 本身；点通知直达 Scriptable（QX 用 open-url 键）
    notify('BZG·Token', '', token, { 'open-url': 'scriptable:///run?scriptName=' + SCRIPTABLE_NAME });

    // 覆盖写入 GitHub（节流：10 分钟内失败过就先跳过，避免刷 API）
    const failTs = parseInt(getStore(KEY_FAILTS) || '0', 10);
    if (!GH_TOKEN || GH_TOKEN.indexOf('REPLACE') === 0) {
      setStore('bzg_diag', 'ts=' + Date.now() + '|push=skipped_no_pat');
      $done({});
    } else if (failTs && Date.now() - failTs < 600000) {
      setStore('bzg_diag', 'ts=' + Date.now() + '|push=throttled');
      $done({});
    } else {
      ghGetSha(sha => ghPut(sha, token, st => {
        if (st >= 200 && st < 300) {
          setStore(KEY_PUSHED, token);
          setStore('bzg_diag', 'ts=' + Date.now() + '|push=ok|status=' + st);
        } else {
          setStore(KEY_FAILTS, String(Date.now()));
          setStore('bzg_diag', 'ts=' + Date.now() + '|push=fail|status=' + st);
        }
        $done({});
      }));
    }
  } else {
    setStore('bzg_diag', 'ts=' + Date.now() + '|captured=' + (token ? 1 : 0) + '|changed=0');
    $done({});
  }
}
