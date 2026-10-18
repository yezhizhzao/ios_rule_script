
var KEY = 'bzg_token';

function hostOf(u) {
  try { return (u || '').replace(/^https?:\/\//, '').split('/')[0]; } catch (e) { return ''; }
}
function notify(title, sub) {
  try {
    var now = Date.now();
    var last = 0;
    try { last = parseInt($persistentStore.read('bzg_last_notify') || '0', 10) || 0; } catch (e) {}
    if (now - last > 5000) {            // 5 秒节流，避免开小程序时刷屏
      $notification.post(title, sub || '', '');
      try { $persistentStore.write(String(now), 'bzg_last_notify'); } catch (e) {}
    }
  } catch (e) {}
}

try {
  var url = ($request && $request.url) || '';
  var isServe = /bzg-token\.example\.com/i.test(url);
  notify('⚡BZG脚本被调用', 'host=' + hostOf(url));   // 诊断：被调用即证明链路通

  if (isServe) {
    // —— 取回模式：请求阶段直接短路返回已存 token，绝不连真实上游 ——
    var v = '';
    try { v = ($persistentStore.read(KEY) || '').toString(); } catch (e) {}
    notify('BZG·取回', 'token长度=' + (v ? v.length : 0));
    $done({
      response: {
        statusCode: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        body: v || ''
      }
    });
  } else {
    // —— 抓取模式：从请求头取 M-Access-Token，存盘后原样放行 ——
    var headers = ($request && $request.headers) || {};
    var t = '';
    for (var k in headers) {
      if (k && String(k).toLowerCase() === 'm-access-token') { t = (headers[k] || '').toString().trim(); break; }
    }
    if (t) {
      try { $persistentStore.write(t, KEY); } catch (e) {}
      notify('BZG·抓取成功', '长度=' + t.length);
    } else {
      notify('BZG·已调用但无token头', 'host=' + hostOf(url));
    }
    $done({});
  }
} catch (e) {
  notify('BZG·脚本出错', String(e));
  $done({});
}
