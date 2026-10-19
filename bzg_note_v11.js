// bzg_note_v11.js —— 响应阶段：从持久存储读 token 并弹通知（只负责弹通知）
// 兼容 Quantumult X ($prefs/$notify) 和 Surge ($persistentStore/$notification.post)

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
var NKEY = 'bzg_last_notify';
var STARTED = 'bzg_started';
var LAST_NOTIFIED = 'bzg_last_notified_token';

try {
  var t = storeRead(KEY) || '';

  // 首次运行弹“监控已启动”，证明响应阶段通知通道是通的
  if (!storeRead(STARTED)) {
    storeWrite(STARTED, '1');
    notify('BZG·监控已启动', '响应阶段通知正常', '进入门店后会弹出抓到的 token');
  }

  // 只有“新抓到”的 token 才弹（8 秒节流防刷屏）
  if (t && t !== storeRead(LAST_NOTIFIED)) {
    var last = parseInt(storeRead(NKEY) || '0', 10) || 0;
    if (Date.now() - last >= 8000) {
      storeWrite(NKEY, String(Date.now()));
      storeWrite(LAST_NOTIFIED, t);
      notify('BZG·抓到 M-Access-Token', 'len=' + t.length, t);
    }
  }
  $done({});
} catch (e) {
  try { notify('BZG·通知脚本出错', String(e), ''); } catch (_) {}
  $done({});
}
