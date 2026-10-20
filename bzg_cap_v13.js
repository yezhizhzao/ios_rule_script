// 煲珠公 Token 抓取（Quantumult X，响应阶段）v13
// 双职责，一个脚本搞定，无中转服务器：
//   1) 小程序流量：从请求头抓 M-Access-Token，存 QX 持久存储。
//      只在 token 发生变化时弹一条通知（不再刷屏）。
//   2) 桥接路径 /__bzg_token__（由本机 Scriptable 发起）：
//      把该响应整体改写为「存储的 token」返回 —— QX 即中转，Scriptable 直接取回。
//
// 部署：QX 重写 → script-response-header 规则，匹配 ^https?://po\.bzgteam\.cn/ ，脚本指向本文件。
//       MitM 需开启 hostname=po.bzgteam.cn。

const KEY = 'bzg_token';
const BRIDGE_PATH = '/__bzg_token__';

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

const reqUrl = ($request && $request.url) || '';

// ── 分支 A：桥接请求（Scriptable 发起的取回请求）──────────────
if (reqUrl.indexOf(BRIDGE_PATH) !== -1) {
  const tok = getStore(KEY) || 'NO_TOKEN';
  $done({
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    body: tok
  });
} else {
  // ── 分支 B：小程序正常流量，静默抓 token ─────────────────────
  const reqHeaders = ($request && $request.headers) ? $request.headers : {};
  let token = '';
  for (const k in reqHeaders) {
    if (k.toLowerCase() === 'm-access-token') { token = (reqHeaders[k] || '').trim(); break; }
  }

  if (token && token.length > 20) {
    const prev = getStore(KEY);
    if (token !== prev) {
      setStore(KEY, token);
      // 仅在 token 变化时通知一次（通常 24h 才换一次）
      const encToken = encodeURIComponent(token);
      notify(
        'BZG·新 Token 已就绪',
        '可运行 Scriptable 查询了',
        'Token 已更新（长度 ' + token.length + '）。打开 Scriptable 运行 BZGQuery 即自动取回，无需复制。',
        { 'url': 'scriptable:///run?scriptName=BZGQuery' }
      );
      setStore('bzg_diag', 'ts=' + Date.now() + '|captured=1|tokenLen=' + token.length + '|changed=1');
    } else {
      setStore('bzg_diag', 'ts=' + Date.now() + '|captured=1|tokenLen=' + token.length + '|changed=0');
    }
  } else {
    setStore('bzg_diag', 'ts=' + Date.now() + '|captured=0');
  }
  $done({});
}
