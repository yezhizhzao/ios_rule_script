// bzg_cap_v11.js —— 请求阶段：抓取 M-Access-Token 存入持久存储（不弹通知）
// 兼容 Quantumult X ($prefs) 和 Surge ($persistentStore)

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
  var headers = ($request && $request.headers) || {};
  var t = headerValue(headers, CANDIDATE);
  var diag = '时间=' + new Date().toISOString() + ' | host=' + hostOf(url) + ' | 有token键=' + (t ? 1 : 0) + ' | len=' + (t ? t.length : 0);
  storeWrite(DIAG, diag);
  if (t) {
    storeWrite(KEY, t);
    storeWrite('bzg_token_captured_at', String(Date.now()));
  }
  $done({});
} catch (e) {
  try { storeWrite(DIAG, 'cap_err=' + String(e)); } catch (_) {}
  $done({});
}
