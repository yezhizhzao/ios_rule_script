// bzg_test_notify.js (响应阶段版) —— 同时负责：抓取 M-Access-Token + 弹通知
// 必须在 script-response-header 阶段运行；
// 绝不要在请求阶段(script-request-header)弹通知——那会卡住 $done 导致请求悬空、网络异常。
var KEY = 'bzg_token';
var DIAG = 'bzg_diag';
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
  var url = ($request && $request.url) || '';
  var reqHeaders = ($request && $request.headers) || {};
  var t = headerValue(reqHeaders, CANDIDATE);
  var diag = '时间=' + new Date().toISOString() + ' | host=' + hostOf(url) + ' | 有token键=' + (t ? 1 : 0) + ' | len=' + (t ? t.length : 0);
  $persistentStore.write(diag, DIAG);
  if (t) { $persistentStore.write(t, KEY); }

  // 首次运行弹一条，证明响应阶段通知通道是通的（不会刷屏）
  if (!$persistentStore.read('bzg_test_started')) {
    $persistentStore.write('1', 'bzg_test_started');
    $notification.post('BZG·TEST 脚本已执行', '响应阶段通知通道正常', '进入门店后会弹出抓到的 token');
  }

  // 抓到“新”的 token 才弹（避免重复刷屏）
  if (t && t !== $persistentStore.read('bzg_last_token')) {
    $persistentStore.write(t, 'bzg_last_token');
    $notification.post('BZG·抓到 M-Access-Token', 'len=' + t.length, t);
  }

  $done({});
} catch (e) {
  try {
    $persistentStore.write('test_err=' + String(e), DIAG);
    $notification.post('BZG·TEST出错', String(e), '');
  } catch (_) {}
  $done({});
}
