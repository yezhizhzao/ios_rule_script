// bzg_token_v10.js —— 煲珠公 token 抓取 + 局域网中转
// 设计：QX 从小程序请求头抓到 M-Access-Token 后，
//       1) 存到本地 $persistentStore（备份）；
//       2) POST 到局域网中转服务器，让 Scriptable 能直接 GET 取回。
// 适用场景：QX 的 script-request-header 短路 Scriptable HTTPS 请求失败时使用。

var KEY = 'bzg_token';
var RELAY_PUT = 'http://192.168.1.130:8788/bzg_token_put';
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

function sendToRelay(token) {
  try {
    var body = 'token=' + encodeURIComponent(token);
    $task.fetch({
      url: RELAY_PUT,
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body
    }).then(function(resp){
      notify('BZG·已同步到局域网', 'status=' + (resp && resp.statusCode || 'unknown'));
    }).catch(function(e){
      // 静默，不阻塞小程序请求
    });
  } catch (e) {}
}

try {
  var url = ($request && $request.url) || '';
  var headers = ($request && $request.headers) || {};
  var t = headerValue(headers, CANDIDATE_HEADERS);
  if (t) {
    $persistentStore.write(t, KEY);
    $persistentStore.write(String(Date.now()), 'bzg_token_captured_at');
    sendToRelay(t);
    notify('BZG·抓取并同步成功', 'token长度=' + t.length);
  }
  $done({});
} catch (e) {
  notify('BZG·脚本出错', String(e));
  $done({});
}
