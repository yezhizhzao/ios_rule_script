// bzg_token_v9.js —— 煲珠公 M-Access-Token 抓取 + 取回（单域名方案）
// 设计要点：
//   1) 不再使用任何虚构域名。抓取与取回都走真实域名 po.bzgteam.cn。
//   2) 取回专用路径 /bzg_token_retrieve 在真实服务器上并不存在，
//      但 QX 会在请求阶段 MITM 拦截并直接短路返回已存 token，请求绝不会到达服务器。
//   3) 同一份脚本按 URL 分流：
//        - 含 /bzg_token_retrieve  → 取回模式（短路返回 token 或 404 NO_TOKEN）
//        - 其它 po.bzgteam.cn 请求 → 抓取模式（读 m-access-token 头并存盘，原样放行）
//   4) 全程只用真实域名，避免虚构域名 DNS 失败导致 script-request-header 不触发。

var KEY = 'bzg_token';
var RETRIEVE_PATH = '/bzg_token_retrieve';
var CANDIDATE_HEADERS = ['m-access-token', 'm_access_token', 'access-token', 'authorization'];

function getHeader(headers, names) {
  if (!headers) return '';
  for (var i = 0; i < names.length; i++) {
    var low = String(names[i]).toLowerCase();
    for (var k in headers) {
      if (k && String(k).toLowerCase() === low) {
        var v = (headers[k] || '').toString().trim();
        if (v) return v;
      }
    }
  }
  return '';
}

function notify(title, sub) {
  try {
    var now = Date.now();
    var last = parseInt($persistentStore.read('bzg_last_notify') || '0', 10) || 0;
    if (now - last > 5000) {            // 5 秒节流，避免开小程序时刷屏
      $notification.post(title, sub || '', '');
      $persistentStore.write(String(now), 'bzg_last_notify');
    }
  } catch (e) {}
}

try {
  var url = ($request && $request.url) || '';
  var isRetrieve = url.indexOf(RETRIEVE_PATH) >= 0;

  if (isRetrieve) {
    // —— 取回模式：请求阶段直接短路，绝不连真实上游 ——
    var v = ($persistentStore.read(KEY) || '').toString();
    if (v) {
      $done({
        response: {
          statusCode: 200,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          body: v
        }
      });
    } else {
      $done({
        response: {
          statusCode: 404,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          body: 'NO_TOKEN'
        }
      });
    }
    return;
  }

  // —— 抓取模式：从请求头取 token，存盘后原样放行 ——
  var headers = ($request && $request.headers) || {};
  var t = getHeader(headers, CANDIDATE_HEADERS);
  if (t) {
    $persistentStore.write(t, KEY);
    $persistentStore.write(String(Date.now()), 'bzg_token_captured_at');
    notify('BZG·抓取成功', 'token长度=' + t.length);
  }
  $done({});   // 放行，不短路
} catch (e) {
  notify('BZG·脚本出错', String(e));
  $done({});
}
