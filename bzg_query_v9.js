// 煲珠公·东莞门店查商品（Scriptable 版 v9）
// 改动：取回端点 po.bzgteam.cn/bzg_token_retrieve；无 token 时显示 QX 自诊断。
//       取回异常时直接弹出原始返回/错误信息，避免直接掉进手动粘贴。

const TOKEN_URL = "https://po.bzgteam.cn/bzg_token_retrieve";
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

function parseSeen(seen){
  if (seen === 'never' || !seen) return {kind:'never'};
  let p = String(seen).split('|');
  if (p.length >= 3){
    return {
      kind:'seen',
      ts: p[0],
      host: p[1]||'',
      found: p[2]==='1',
      hasKey: p.length>=4 ? p[3]==='1' : null
    };
  }
  return {kind:'unknown', raw: seen};
}

async function showErrorThenManual(title, message){
  let a = new Alert();
  a.title = title;
  a.message = message;
  a.addAction("手动粘贴");
  a.addCancelAction("取消");
  if (await a.present() === -1) return null;
  return await manualToken();
}

async function getToken(){
  // 1) 本地记忆
  try { let t = Keychain.read("bzg_token"); if (looksLikeToken(t)) return {token:t, src:"本地记忆"}; } catch(e){}

  // 2) QX 自动取回
  let raw = '';
  let err = null;
  try {
    let url = TOKEN_URL + "?ts=" + Date.now();
    let req = new Request(url);
    req.timeoutInterval = 8;
    req.headers = { "Cache-Control":"no-cache", "Pragma":"no-cache" };
    raw = (await req.loadString()).trim();

    if (raw.indexOf("NO_TOKEN") === 0) {
      let diag = raw.replace(/^NO_TOKEN\|?/, '');
      let info = parseSeen((diag.match(/seen=([^|]+)/)||[])[1]);
      let explain = '';
      if (info.kind === 'never'){
        explain = '脚本完全没见过 po.bzgteam.cn 请求。\n可能：规则未加载 / 小程序没发请求 / QX 未运行。';
      } else if (info.kind === 'seen'){
        let base = '最近脚本运行时间=' + new Date(parseInt(info.ts)||0).toLocaleString() + '\nhost=' + info.host + '\n';
        if (info.found){
          explain = base + '已抓到 token，但仍返回 NO_TOKEN（取回分支异常，请检查 MitM/规则）';
        } else if (info.hasKey === false){
          explain = base + '请求里**没有** m-access-token 键。\n你访问的接口不带 token，请换别的门店入口再试。';
        } else if (info.hasKey === true){
          explain = base + '有 m-access-token 键，但值为空/不是预期格式。';
        } else {
          explain = base + '未抓到 token。请换别的门店入口再试。';
        }
      }
      let a = new Alert();
      a.title = "QX 已就绪，但还没抓到 Token";
      a.message = "诊断：" + diag.replace(/\|/g, '\n') + "\n\n解读：\n" + explain + "\n\n是否改为手动粘贴一次？";
      a.addAction("手动粘贴");
      a.addCancelAction("稍后再试");
      if (await a.present() === -1) return null;
      return await manualToken();
    }

    if (looksLikeToken(raw)) {
      try{ Keychain.write("bzg_token", raw); }catch(e){}
      return {token:raw, src:"QX自动"};
    }

    // 走到这里说明 QX 返回了既不是 NO_TOKEN 也不是 token 的内容（大概率穿透到真实服务器 404）
    return await showErrorThenManual("QX 返回异常", "QX 没有短路返回 token。\n\n原始返回（前 300 字）：\n" + raw.slice(0,300) + "\n\n这通常意味着：\n1) QX 没拦截这条取回请求；\n2) 或 QX 脚本在取回分支出错/被缓存。\n\n请检查：QX 是否开启、MitM 是否包含 po.bzgteam.cn、conf 是否已加载。");
  } catch(e){
    err = String(e);
    return await showErrorThenManual("取回请求失败", "请求 QX 取回端点时报错：\n" + err + "\n\n常见原因：QX 未运行 / Scriptable 不信任 QX 证书 / 网络超时。");
  }
}

async function manualToken(){
  let a = new Alert();
  a.title = "需要 M-Access-Token";
  a.message = "打开 QX → 设置 → HTTP 请求（或 Charles/抓包），找一条 po.bzgteam.cn 记录，复制其请求头的 M-Access-Token 粘贴（只需一次，之后自动记住）";
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
