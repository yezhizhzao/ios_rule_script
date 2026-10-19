// 煲珠公 Token 抓取（Quantumult X / Surge 兼容，响应阶段）v12
// 作用：从小程序响应请求头抓 M-Access-Token，存进 QX 持久存储，
//       并弹一条"可点击"的通知，点击后通过 URL Scheme 把 token 直接交给 Scriptable 运行查询。
//
// 部署：QX 重写 → 新建 script-response-header 规则，匹配 ^https?://po\.bzgteam\.cn/ ，脚本指向本文件。
//       需 MitM 开启 hostname=po.bzgteam.cn。

const IS_QX    = (typeof $notify !== 'undefined');
const IS_SURGE = (typeof $persistentStore !== 'undefined');

function setStore(k, v){
  if (IS_QX)    return $prefs.setValueForKey(v, k);
  if (IS_SURGE) return $persistentStore.write(v, k);
}
function getStore(k){
  if (IS_QX)    return $prefs.valueForKey(k);
  if (IS_SURGE) return $persistentStore.read(k);
}
function notify(title, subtitle, message, opts){
  if (IS_QX)    return $notify(title, subtitle, message, opts || {});
  if (IS_SURGE) return $notification.post(title, subtitle, message);
}

// 你手机上 Scriptable 查询脚本的名字（必须和 bzg_query_v12.js 在 Scriptable 里的"脚本名"一致）
const SCRIPTABLE_NAME = 'BZGQuery';

// 请求头在 $request.headers（响应阶段脚本仍可访问请求信息）
const reqHeaders = ($request && $request.headers) ? $request.headers : {};
const token = (reqHeaders['M-Access-Token'] || reqHeaders['m-access-token'] || '').trim();

if (token && token.length > 20) {
  setStore('bzg_token', token);

  // 构造 Scriptable 的 URL Scheme：把 token 作为参数传过去，Scriptable 端用 args.queryParameters.token 接收
  const encToken = encodeURIComponent(token);
  const encName  = encodeURIComponent(SCRIPTABLE_NAME);
  const schemeURL = 'scriptable:///run?scriptName=' + encName + '&token=' + encToken;

  notify(
    'BZG·抓到 Token',
    '点击此通知 → 自动查询',
    'Token 长度 ' + token.length + '。点这条通知即可在 Scriptable 中带 token 直接查门店商品（无需手动复制）。',
    { 'url': schemeURL }
  );

  setStore('bzg_diag', 'ts=' + Date.now() + '|host=po.bzgteam.cn|hasTokenKey=1|tokenLen=' + token.length);
} else {
  setStore('bzg_diag', 'ts=' + Date.now() + '|host=po.bzgteam.cn|hasTokenKey=0');
}

$done({});
