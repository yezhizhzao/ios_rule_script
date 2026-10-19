// 煲珠公·东莞门店查商品（Scriptable 版 v12）
// 新增：优先从 QX 经 URL Scheme 传入的 token（args.queryParameters.token）。
//       其余回退：本地 Keychain 记忆 → 局域网中转 → 手动粘贴。

const TOKEN_URL = "http://192.168.1.130:8788/bzg_token_get";
const API_HOST = "po.bzgteam.cn";

const STORES = [
  { name: "东莞东城万达店", shopId: "870454331", apisign: "", apitime: "" },
  { name: "东莞民盈国贸中心店", shopId: "900000030", apisign: "", apitime: "" },
  { name: "东莞汇一城店", shopId: "900000102", apisign: "", apitime: "" },
  { name: "东莞记忆店", shopId: "900000673", apisign: "", apitime: "" },
  { name: "东莞印象汇店", shopId: "900000224", apisign: "", apitime: "" },
  { name: "东莞西平时代城广场店", shopId: "900000284", apisign: "", apitime: "" },
  { name: "东莞合信嘉荣购物广场店", shopId: "900000193", apisign: "", apitime: "" },
  { name: "东莞华南MALL店", shopId: "900000067", apisign: "", apitime: "" },
  { name: "东莞石龙旗云城市广场店", shopId: "900000537", apisign: "", apitime: "" },
  { name: "东莞茶山乐融荟店", shopId: "900000877", apisign: "", apitime: "" },
  { name: "东莞寮步万润广场店", shopId: "900000287", apisign: "", apitime: "" },
  { name: "东莞龙湾奥特莱斯店", shopId: "900000271", apisign: "", apitime: "" },
  { name: "东莞高埗万和百货店", shopId: "900000452", apisign: "", apitime: "" },
  { name: "东莞蜂汇广场店", shopId: "900000794", apisign: "", apitime: "" },
  { name: "东莞汇星商业中心店", shopId: "900000124", apisign: "", apitime: "" },
  { name: "东莞松山湖万象汇店", shopId: "900000114", apisign: "", apitime: "" },
  { name: "东莞道滘深悦汇店", shopId: "900000755", apisign: "", apitime: "" },
  { name: "东莞东坑喜悦里店", shopId: "900000704", apisign: "", apitime: "" },
  { name: "东莞松山湖万科生活广场店", shopId: "900000416", apisign: "", apitime: "" },
  { name: "东莞大朗环球贸易广场店", shopId: "900000635", apisign: "", apitime: "" },
  { name: "东莞石排利丰城市广场店", shopId: "900000251", apisign: "", apitime: "" },
  { name: "东莞大岭山凯东店", shopId: "900000250", apisign: "", apitime: "" },
  { name: "东莞厚街汀山广场店", shopId: "900000798", apisign: "", apitime: "" },
  { name: "东莞松山湖佳纷天地店", shopId: "900000378", apisign: "", apitime: "" },
  { name: "东莞横沥森扬汇店", shopId: "900000576", apisign: "", apitime: "" },
  { name: "东莞大朗里悦里店", shopId: "900000051", apisign: "", apitime: "" },
  { name: "东莞厚街万达店", shopId: "900000122", apisign: "", apitime: "" },
  { name: "东莞中堂万众广场店", shopId: "900000860", apisign: "", apitime: "" },
  { name: "东莞厚街明丰广场店", shopId: "900000369", apisign: "", apitime: "" },
  { name: "东莞滨湖万科里店", shopId: "900000687", apisign: "", apitime: "" },
  { name: "东莞常平天虹购物中心店", shopId: "900000027", apisign: "9d05a65d25e80b0c82c7edf18c33e6e90b75458f919ca1e469c31227c8d7bdab", apitime: "1792148502735" },
  { name: "东莞厚街米乐城店", shopId: "900000840", apisign: "", apitime: "" },
  { name: "东莞翔龙天地店", shopId: "900000288", apisign: "", apitime: "" },
  { name: "东莞华阳湖创客坊店", shopId: "900000365", apisign: "", apitime: "" },
  { name: "东莞沙田万隆购物广场店", shopId: "900000464", apisign: "", apitime: "" },
  { name: "东莞长安万达店", shopId: "900000117", apisign: "", apitime: "" },
  { name: "东莞黄江天虹店", shopId: "900000109", apisign: "", apitime: "" },
  { name: "东莞虎门万达店", shopId: "900000099", apisign: "", apitime: "" },
  { name: "东莞长安万科广场店", shopId: "900000055", apisign: "", apitime: "" },
  { name: "东莞虎门万科里店", shopId: "900000316", apisign: "", apitime: "" },
  { name: "东莞长安华大购物广场店", shopId: "900000855", apisign: "", apitime: "" },
  { name: "东莞虎门天虹店", shopId: "900000813", apisign: "", apitime: "" },
  { name: "东莞虎门君乐汇店", shopId: "900000126", apisign: "", apitime: "" },
  { name: "东莞天一城店", shopId: "900000194", apisign: "", apitime: "" },
  { name: "东莞桥头上悦汇店", shopId: "900000254", apisign: "", apitime: "" },
  { name: "东莞塘厦万科生活广场店", shopId: "900000337", apisign: "", apitime: "" },
  { name: "东莞塘厦天虹店", shopId: "900000112", apisign: "", apitime: "" },
  { name: "东莞清溪天和百货店", shopId: "900000332", apisign: "", apitime: "" },
  { name: "东莞清溪中心店", shopId: "900000819", apisign: "", apitime: "" },
  { name: "东莞塘厦石鼓店", shopId: "900000848", apisign: "", apitime: "" },
  { name: "东莞凤岗沃尔玛店", shopId: "900000233", apisign: "", apitime: "" },
  { name: "东莞嘉乐汇购物广场店", shopId: "900000487", apisign: "", apitime: "" },
  { name: "东莞凤岗雁田步行街店", shopId: "900000353", apisign: "", apitime: "" },
];

function escapeHtml(s){ return (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function looksLikeToken(t){
  return typeof t==="string" && t.length>50 && /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(t);
}

async function getToken(){
  // 0) 最优路径：QX 抓取后经 URL Scheme 直接传入（点击通知即触发）
  try {
    const params = (typeof args !== 'undefined' && args.queryParameters) ? args.queryParameters : {};
    if (params && params.token && looksLikeToken(params.token)) {
      try { Keychain.write("bzg_token", params.token); } catch(e){}
      return { token: params.token, src: "QX 直传(点通知)" };
    }
  } catch(e){}

  // 1) 本地记忆（Scriptable 自己的 Keychain）
  try { let t = Keychain.read("bzg_token"); if (looksLikeToken(t)) return {token:t, src:"本地记忆"}; } catch(e){}

  // 2) 局域网中转取回（可选，需先运行 bzg_relay_server.py）
  let raw = '';
  let err = null;
  try {
    let req = new Request(TOKEN_URL + "?ts=" + Date.now());
    req.timeoutInterval = 8;
    req.headers = { "Cache-Control":"no-cache", "Pragma":"no-cache" };
    raw = (await req.loadString()).trim();

    if (raw === "NO_TOKEN") {
      let a = new Alert();
      a.title = "中转服务器暂无 Token";
      a.message = "中转服务器 reachable，但里面还没有 token。\n请先在微信打开「煲珠公」小程序并点进一家店，让 QX 抓取 token 并同步到局域网中转。\n\n是否改为手动粘贴一次？";
      a.addAction("手动粘贴");
      a.addCancelAction("稍后再试");
      if (await a.present() === -1) return null;
      return await manualToken();
    }

    if (looksLikeToken(raw)) {
      try{ Keychain.write("bzg_token", raw); }catch(e){}
      return {token:raw, src:"局域网中转"};
    }

    return await showThenManual("中转返回异常", "中转服务器 reachable，但返回内容既不是 token 也不是 NO_TOKEN：\n\n" + raw.slice(0,300) + "\n\n请检查 bzg_relay_server.py 是否正常运行。");
  } catch(e){
    err = String(e);
    return await showThenManual("取回请求失败", "访问中转服务器失败：\n" + err + "\n\n请检查：\n1) 192.168.1.130:8788 是否已运行 bzg_relay_server.py\n2) 手机是否与 192.168.1.130 在同一局域网\n3) QX 是否拦截了到 192.168.1.130 的流量（可在 QX 规则里加 192.168.1.130 的 DIRECT/绕过）");
  }
}

async function showThenManual(title, message){
  let a = new Alert();
  a.title = title;
  a.message = message;
  a.addAction("手动粘贴");
  a.addCancelAction("取消");
  if (await a.present() === -1) return null;
  return await manualToken();
}

async function manualToken(){
  let a = new Alert();
  a.title = "需要 M-Access-Token";
  a.message = "打开 QX → 设置 → HTTP 请求，找一条 po.bzgteam.cn 记录，复制其请求头的 M-Access-Token 粘贴（只需一次，之后自动记住）";
  a.addTextField("粘贴 M-Access-Token");
  a.addAction("提交");
  a.addCancelAction("取消");
  let idx = await a.present();
  if (idx === -1) return null;
  let t = (a.textFieldValue(0)||"").trim();
  if (looksLikeToken(t)) { try{ Keychain.write("bzg_token", t); }catch(e){} return {token:t, src:"手动粘贴"}; }
  return null;
}

async function queryStore(store, token, product){
  let url = "https://"+API_HOST+"/mall-boot/miniApp/getCategoryProductListNew?shopId="+store.shopId+"&showNewStoreCategory=true&cpGroupId=null&hasTeamBuy=false";
  let req = new Request(url);
  req.method = "GET";
  req.headers = {
    "Host": API_HOST,
    "api-sign": store.apisign,
    "content-type": "application/json",
    "api-vid": "a2",
    "api-time": store.apitime,
    "api-platform": "WECHAT_MINI",
    "M-Access-Token": token,
    "User-Agent": "Mozilla/5.0"
  };
  req.timeoutInterval = 15;
  try {
    let txt = await req.loadString();
    let data = JSON.parse(txt);
    if (data.code === 40001) return {status:"expired"};
    let menus = (data.result && data.result.menuList) || [];
    let found=false, hitName="";
    for (let m of menus){ for (let p of (m.productList||[])){ let nm=p.name||""; if(nm.indexOf(product)>=0){found=true;hitName=nm;break;} } if(found) break; }
    return {status: found?"yes":"no", hitName};
  } catch(e){ return {status:"err", err:String(e)}; }
}

async function main(){
  let alert = new Alert();
  alert.title = "煲珠公·查商品";
  alert.message = "输入要查询的商品名";
  alert.addTextField("如：老红糖珍珠奶茶");
  alert.addAction("查询");
  alert.addCancelAction("取消");
  let idx = await alert.present();
  if (idx === -1) return;
  let product = (alert.textFieldValue(0)||"").trim();
  if (!product){ let a=new Alert(); a.title="提示"; a.message="商品名不能为空"; await a.present(); return; }

  let tinfo = await getToken();
  if (!tinfo){ let a=new Alert(); a.title="已取消"; a.message="未获取到 Token"; await a.present(); return; }
  let token = tinfo.token;

  let results = [];
  let filled = 0;
  for (let i=0;i<STORES.length;i++){
    let s = STORES[i];
    if (!s.apisign){ results.push({store:s,status:"none"}); continue; }
    filled++;
    let r = await queryStore(s, token, product);
    if (r.status==="expired"){
      try{ Keychain.remove("bzg_token"); }catch(e){}
      let a=new Alert(); a.title="Token 已过期"; a.message="请在微信打开煲珠公小程序刷新后，重新运行本脚本"; await a.present();
      return;
    }
    results.push({store:s,status:r.status,hitName:r.hitName});
  }

  let rows = results.map(r=>{
    let icon = r.status==="yes"?"✅":(r.status==="no"?"❌":(r.status==="none"?"⚪":(r.status==="err"?"⚠️":"❓")));
    let extra = (r.status==="yes"&&r.hitName)?(" · "+escapeHtml(r.hitName)):"";
    return "<div class='row'><span class='icon'>"+icon+"</span><span class='name'>"+escapeHtml(r.store.name)+extra+"</span></div>";
  }).join("");
  let yesCnt = results.filter(r=>r.status==="yes").length;
  let html = "<!DOCTYPE html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>"
    + "<style>body{font-family:-apple-system,Helvetica,sans-serif;background:#f5f5f7;margin:0;padding:18px;color:#1d1d1f}"
    + ".card{background:#fff;border-radius:16px;padding:18px;box-shadow:0 2px 10px rgba(0,0,0,.08)}"
    + "h2{margin:0 0 4px;font-size:19px}.meta{color:#888;font-size:13px;margin-bottom:6px}"
    + ".tok{margin:8px 0;font-size:12px;color:#555}.t{display:block;word-break:break-all;background:#f0f0f3;border-radius:8px;padding:8px;margin-top:4px;font-family:monospace;font-size:11px}"
    + ".row{display:flex;align-items:center;padding:7px 0;border-bottom:1px solid #f0f0f0}"
    + ".icon{font-size:17px;width:26px}.name{font-size:15px}h3{font-size:16px;margin:14px 0 4px}</style></head><body><div class='card'>"
    + "<h2>煲珠公·查商品结果</h2>"
    + "<div class='meta'>商品："+escapeHtml(product)+" ｜ 有货："+yesCnt+" 家 ｜ 已抓取签名门店："+filled+" 家 ｜ Token："+escapeHtml(tinfo.src)+"</div>"
    + "<div class='tok'>当前 Token（可长按复制）：<span class='t'>"+escapeHtml(token)+"</span></div>"
    + "<h3>东莞门店</h3>"+rows
    + "</div></body></html>";
  let wv = new WebView();
  await wv.loadHTML(html);
  await wv.present();
}

await main();
