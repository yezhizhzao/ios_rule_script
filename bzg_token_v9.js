// bzg_token_v9.js —— 煲珠公 M-Access-Token 抓取 + 取回（单域名 + 自诊断）
// 抓包已确认：M-Access-Token 在请求头里（大写），方向正确。
// 本版诊断细化：无 token 时返回"是否见过 token 请求键 + 是否抓到"，便于定位。

var KEY = 'bzg_token';
var RETRIEVE_PATH = '/bzg_token_retrieve';
var CANDIDATE_HEADERS = ['m-access-token', 'm_access_token', 'access-token', 'authorization', 'x-access-token'];

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

function headerKeyExists(headers, names) {
  if (!headers) return false;
  for (var i = 0; i < names.length; i++) {
    var low = String(names[i]).toLowerCase();
    for (var k in headers) {
      if (k && String(k).toLowerCase() === low) return true;
    }
  }
  return false;
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

function setSeen(host, found, hasKey) {
  try {
    // 格式：时间戳|host|是否抓到token(0/1)|是否有m-access-token键(0/1)
    $persistentStore.write(Date.now() + '|' + (host || '') + '|' + (found ? '1' : '0') + '|' + (hasKey ? '1' : '0'), 'bzg_last_seen');
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
      var seen = ($persistentStore.read('bzg_last_seen') || 'never').toString();
      var diag = 'NO_TOKEN|seen=' + seen + '|v=9';
      $done({ response: { statusCode: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' }, body: diag } });
    }
    return;
  }

  // 抓取模式
  var host = '';
  try { host = (url || '').replace(/^https?:\/\//, '').split('/')[0]; } catch (e) {}
  var headers = ($request && $request.headers) || {};
  var t = headerValue(headers, CANDIDATE_HEADERS);
  var hasKey = headerKeyExists(headers, CANDIDATE_HEADERS);
  var found = !!t;
  setSeen(host, found, hasKey);
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
