// bzg_test_notify.js (QX/Surge 兼容版) —— 响应阶段抓 token + 弹通知
// 修复：Quantumult X 用 $prefs/$notify，Surge 用 $persistentStore/$notification.post。
// 本脚本自动适配两种环境。

function notify(title, subtitle, message) {
  if (typeof $notify === 'function') {
    $notify(title, subtitle, message);
  } else if (typeof $notification !== 'undefined' && typeof $notification.post === 'function') {
    $notification.post(title, subtitle, message);
  }
}

function storeRead(key) {
  if (typeof $prefs !== 'undefined' && typeof $prefs.valueForKey === 'function') {
    return $prefs.valueForKey(key);
  }
  if (typeof $persistentStore !== 'undefined' && typeof $persistentStore.read === 'function') {
    return $persistentStore.read(key);
  }
  return null;
}

function storeWrite(key, value) {
  if (typeof $prefs !== 'undefined' && typeof $prefs.setValueForKey === 'function') {
    return $prefs.setValueForKey(value, key);
  }
  if (typeof $persistentStore !== 'undefined' && typeof $persistentStore.write === 'function') {
    return $persistentStore.write(value, key);
  }
}

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
  storeWrite(DIAG, diag);
  if (t) { storeWrite(KEY, t); }

  // 首次运行弹一条，证明响应阶段通知通道是通的（不会刷屏）
  if (!storeRead('bzg_test_started')) {
    storeWrite('bzg_test_started', '1');
    notify('BZG·TEST 脚本已执行', '响应阶段通知通道正常', '进入门店后会弹出抓到的 token');
  }

  // 抓到“新”的 token 才弹（避免重复刷屏）
  if (t && t !== storeRead('bzg_last_token')) {
    storeWrite('bzg_last_token', t);
    notify('BZG·抓到 M-Access-Token', 'len=' + t.length, t);
  }

  $done({});
} catch (e) {
  try {
    storeWrite(DIAG, 'test_err=' + String(e));
    notify('BZG·TEST出错', String(e), '');
  } catch (_) {}
  $done({});
}
