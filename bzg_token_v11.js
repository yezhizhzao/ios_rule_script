// bzg_token_v11.js —— 煲珠公 token 抓取 + 弹通知
// 设计：请求阶段只抓取并存入 $persistentStore；响应阶段再弹通知（QX 请求阶段通知常被抑制，响应阶段才稳定可见）。
// 用法：QX conf 里同时配 script-request-header 与 script-response-header 指向本文件（见 bzg_qx_v11.conf）。

var KEY = 'bzg_token';
var DIAG = 'bzg_diag';
var NKEY = 'bzg_last_notify';
var STARTED = 'bzg_started';
var LAST_NOTIFIED = 'bzg_last_notified_token';
var CANDIDATE = ['m-access-token', 'm_access_token', 'access-token', 'authorization', 'x-access-token'];

function headerValue(headers, names) {
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

function hostOf(url) {
  try { return (url || '').split('/')[2] || ''; } catch (e) { return ''; }
}

try {
  if (typeof $response !== 'undefined' && $response) {
    // ===== 响应阶段：弹通知（可见） =====
    var t = $persistentStore.read(KEY) || '';

    // 首次运行弹一个“监控已启动”，证明响应阶段通知通道是通的
    if (!$persistentStore.read(STARTED)) {
      $persistentStore.write('1', STARTED);
      $notification.post('BZG·监控已启动', '响应阶段通知正常', '打开煲珠公小程序并进入门店，抓到 token 会在此弹出');
    }

    // 只有“新抓到”的 token 才弹（节流 8s，避免刷屏）
    if (t && t !== $persistentStore.read(LAST_NOTIFIED)) {
      var last = parseInt($persistentStore.read(NKEY) || '0', 10) || 0;
      if (Date.now() - last >= 8000) {
        $persistentStore.write(String(Date.now()), NKEY);
        $persistentStore.write(t, LAST_NOTIFIED);
        $notification.post('BZG·抓到 M-Access-Token', 'len=' + t.length, t);
      }
    }
    $done({});
  } else {
    // ===== 请求阶段：抓取并存储 =====
    var url = ($request && $request.url) || '';
    var headers = ($request && $request.headers) || {};
    var t = headerValue(headers, CANDIDATE);
    var diag = '时间=' + new Date().toISOString() + ' | host=' + hostOf(url) + ' | 有token键=' + (t ? 1 : 0) + ' | len=' + (t ? t.length : 0);
    $persistentStore.write(diag, DIAG);
    if (t) {
      $persistentStore.write(t, KEY);
      $persistentStore.write(String(Date.now()), 'bzg_token_captured_at');
    }
    $done({});
  }
} catch (e) {
  try { $notification.post('BZG·脚本出错', String(e), ''); } catch (_) {}
  $done({});
}
