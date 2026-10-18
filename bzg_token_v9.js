// bzg_token_v9.js —— 煲珠公 M-Access-Token 抓取 + 取回（单域名 + 自诊断）
// 抓包已确认：M-Access-Token 在请求头里（大写），方向正确。
// 本版增加诊断：取回时若无 token，返回"脚本是否见过请求 / 是否看到 token 头"，便于定位。
//
// 部署（二选一，推荐 A，最少改动且你已验证 raw 可下载）：
//   A) 把本文件上传到 GitHub 仓库，文件名 bzg_token_v9.js（新文件，避开缓存），
//      再用 bzg_qx_v9.conf（里面引用该 raw URL）。
//   B) 通过 QX「引用资源 → 脚本」把本文件加入资源库，conf 用裸文件名 bzg_token_v9.js。

var KEY = 'bzg_token';
var RETRIEVE_PATH = '/bzg_token_retrieve';
var CANDIDATE_HEADERS = ['m-access-token', 'm_access_token', 'access-token', 'authorization', 'x-access-token'];

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
    if (now - last > 5000) {
      $notification.post(title, sub || '', '');
      $persistentStore.write(String(now), 'bzg_last_notify');
    }
  } catch (e) {}
}

function setSeen(host, found) {
  try {
    // 格式：时间戳|host|是否看到token头(0/1)
    $persistentStore.write(Date.now() + '|' + (host || '') + '|' + (found ? '1' : '0'), 'bzg_last_seen');
  } catch (e) {}
}

try {
  var url = ($request && $request.url) || '';
  var isRetrieve = url.indexOf(RETRIEVE_PATH) >= 0;

  if (isRetrieve) {
    var v = ($persistentStore.read(KEY) || '').toString().trim();
    if (v) {
      $done({ response: { statusCode: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' }, body: v } });
    } else {
      // 无 token：返回诊断，帮助定位"到底是哪一步断了"
      var seen = ($persistentStore.read('bzg_last_seen') || 'never').toString();
      var diag = 'NO_TOKEN|seen=' + seen + '|v=9';
      $done({ response: { statusCode: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' }, body: diag } });
    }
    return;
  }

  // 抓取模式：记录"脚本是否见过小程序请求"，再尝试取 token
  var host = '';
  try { host = (url || '').replace(/^https?:\/\//, '').split('/')[0]; } catch (e) {}
  var headers = ($request && $request.headers) || {};
  var t = getHeader(headers, CANDIDATE_HEADERS);
  var found = !!t;
  setSeen(host, found);
  if (t) {
    $persistentStore.write(t, KEY);
    $persistentStore.write(String(Date.now()), 'bzg_token_captured_at');
    notify('BZG·抓取成功', 'token长度=' + t.length);
  }
  $done({});
} catch (e) {
  notify('BZG·脚本出错', String(e));
  $done({});
}
