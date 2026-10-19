/* 日程台 · 渲染（改数据结构看 data.js，改样式看 style.css） */
(function(){
'use strict';

var D = window.DATA;
var KEY = 'dsh-schedule-v1';
var OLDL = 'dsh-plan-v1';
var CATS = [['course','上课'],['study','自习'],['jam','Jam'],['art','美术'],['sport','运动'],['life','生活'],['fixed','固定']];
var CK = [['sleep','睡眠 23:30 上床'],['phone','手机 起床 30 分钟不碰'],['study','学业 作业清零'],['sport','运动 20 分钟'],['art','美术 动笔'],['jam','Jam 有推进']];
var WD = ['一','二','三','四','五','六','日'];
var REG = {};
var state = { view:'today', date:todayISO(), gantt:'month', hidden:{}, jamForce:null, q:'' };

function pad(n){return n<10?'0'+n:''+n;}
function toISO(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
function fromISO(s){var p=String(s).split('-');return new Date(+p[0],+p[1]-1,+p[2]);}
function addDays(s,n){var d=fromISO(s);d.setDate(d.getDate()+n);return toISO(d);}
function wdOf(s){return (fromISO(s).getDay()+6)%7+1;}
function weekOf(s){return Math.floor((fromISO(s)-fromISO(D.term.week1))/86400000/7)+1;}
function mondayOf(s){return addDays(s,-(wdOf(s)-1));}
function toMin(t){var p=String(t).split(':');return (+p[0])*60+(+p[1]);}
function hhmm(m){return pad(Math.floor(m/60))+':'+pad(m%60);}
function todayISO(){return toISO(new Date());}
function md(s){var d=fromISO(s);return (d.getMonth()+1)+'/'+d.getDate();}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c];});}
function tint(hex){return hex+'22';}

/* ── 美术计划 ── */
var ART = D.artPlan || [];
function artGet(date){ var a=ART; for(var i=0;i<a.length;i++){ if(a[i][0]===date) return a[i]; } return null; }
function ckFor(day, key){ var s=migrate(); return !!(s.ck && s.ck[day] && s.ck[day][key]); }

function inWeeks(weeks, w){
  if(!weeks || !weeks.length) return false;
  if(weeks.length===2 && typeof weeks[0]==='number' && weeks[0]<weeks[1]) return w>=weeks[0] && w<=weeks[1];
  for(var i=0;i<weeks.length;i++){
    var x = weeks[i];
    if(x && x.length===2 && typeof x[0]==='number'){ if(w>=x[0] && w<=x[1]) return true; }
    else if(x===w) return true;
  }
  return false;
}
function isJam(date){
  if(state.jamForce!==null) return state.jamForce;
  return date>='2026-10-28' && date<='2026-11-11';
}
function overlap(a,b){return toMin(a.start)<toMin(b.end) && toMin(b.start)<toMin(a.end);}

function blocksFor(date){
  var wd = wdOf(date), wk = weekOf(date), jam = isJam(date), out = [];
  D.courses.forEach(function(c){
    if(c.weekday!==wd) return;
    if(!inWeeks(c.weeks, wk)) return;
    out.push({id:c.id,name:c.name,start:c.start,end:c.end,color:'course',place:c.place,note:c.note,src:'课'});
  });
  D.routines.forEach(function(r){
    if(r.days && r.days.indexOf(wd)<0) return;
    if(jam && r.noJam) return;
    if(r.jamOnly && !jam) return;
    var b = r;
    if(jam && r.jam) b = {id:r.id+'-jam',name:r.jam.name||r.name,start:r.jam.start||r.start,end:r.jam.end||r.end,color:r.jam.color||r.color,place:r.place,note:r.note,src:'日常'};
    else b = {id:r.id,name:r.name,start:r.start,end:r.end,color:r.color,place:r.place,note:r.note,src:r.jamOnly?'Jam':'日常'};
    for(var i=0;i<out.length;i++){ if(out[i].color!=='course' && overlap(out[i],b)) return; if(out[i].color==='course' && overlap(out[i],b)) return; }
    out.push(b);
  });
  out.sort(function(a,b){return toMin(a.start)-toMin(b.start);});
  return out;
}
function visible(b){return !state.hidden[b.color];}

/* ── 存储 ── */
function store(){try{return JSON.parse(localStorage.getItem(KEY)||'{}');}catch(e){return {};}}
function save(o){try{localStorage.setItem(KEY,JSON.stringify(o));}catch(e){}}
function migrate(){
  var s = store();
  if(s.migrated) return s;
  try{
    var old = JSON.parse(localStorage.getItem(OLDL)||'{}');
    if(old.cells){
      s.ck = s.ck || {};
      Object.keys(old.cells).forEach(function(k){
        var p = k.split('|');
        s.ck[p[0]] = s.ck[p[0]] || {};
        s.ck[p[0]][p[1]] = 1;
      });
    }
    if(old.screen){
      s.screen = s.screen || {};
      Object.keys(old.screen).forEach(function(d){ s.screen[d] = parseFloat(old.screen[d])||0; });
    }
  }catch(e){}
  s.migrated = 1;
  save(s);
  return s;
}

/* ── 共用头 ── */
function head(){
  var wk = weekOf(state.date);
  document.getElementById('weekLabel').textContent = D.term.name + ' · 第 ' + wk + ' 周';
  document.getElementById('dateLabel').textContent = md(state.date) + ' 周' + WD[wdOf(state.date)-1];
}
function legend(){
  var h = '';
  CATS.forEach(function(c){
    h += '<span class="lg'+(state.hidden[c[0]]?' off':'')+'" data-cat="'+c[0]+'"><i style="background:var(--'+c[0]+')"></i>'+c[1]+'</span>';
  });
  document.getElementById('legend').innerHTML = h;
  var sw = document.getElementById('jamSw');
  sw.textContent = 'Jam 模式：' + (state.jamForce===null ? (isJam(todayISO())?'自动（开）':'自动（关）') : (state.jamForce?'强制开':'强制关'));
  sw.className = 'jamsw' + (isJam(state.date)?' on':'');
}

/* ── 今日 ── */
function vToday(){
  var date = state.date, blks = blocksFor(date).filter(visible);
  var isT = date === todayISO();
  var nm = new Date().getHours()*60 + new Date().getMinutes();
  var h = [];
  h.push('<div class="dayhead"><b>'+md(date)+'</b><span>周'+WD[wdOf(date)-1]+'</span><span>第 '+weekOf(date)+' 周</span>'
    + (isJam(date)?'<span class="tag t-jam">Jam 期间</span>':'') + '</div>');

  if(isT){
    var cur=null, nx=null;
    blks.forEach(function(b){
      if(toMin(b.start)<=nm && nm<toMin(b.end)) cur=b;
      if(!nx && toMin(b.start)>nm) nx=b;
    });
    var msg = '现在 '+hhmm(nm)+'　';
    if(cur) msg += '正在 <b>'+esc(cur.name)+'</b>（到 '+cur.end+'）';
    else if(nx) msg += '下一样 <b>'+esc(nx.name)+'</b>，'+nx.start+' 开始（还有 '+(toMin(nx.start)-nm)+' 分钟）';
    else msg += '今天的安排走完了，去睡。';
    h.push('<div class="now">'+msg+'</div>');
  }else{
    h.push('<div class="now">你在看 '+date+'，不是今天。点右上「今天」回来。</div>');
  }

  h.push('<div class="tl">');
  blks.forEach(function(b){
    var on = isT && toMin(b.start)<=nm && nm<toMin(b.end);
    var past = isT && toMin(b.end)<=nm;
    REG[date+'|'+b.id] = b;
    h.push('<div class="b k-'+b.color+(on?' on':'')+(past?' past':'')+'" data-k="'+date+'|'+b.id+'">'
      + '<div class="t">'+b.start+'–'+b.end+'</div>'
      + '<div class="m"><b>'+esc(b.name)+'</b>'
      + '<span class="tag t-'+b.color+'">'+b.src+'</span>'
      + (b.place?'<span class="n">'+esc(b.place)+(b.note?'　·　'+esc(b.note):'')+'</span>':(b.note?'<span class="n">'+esc(b.note)+'</span>':''))
      + '</div></div>');
  });
  h.push('</div>');

  if(!blks.length) h.push('<div class="card muted">这一天没有安排。空档当自习用。</div>');

  var ae = artGet(date);
  if(ae){
    var da = ckFor(date,'art');
    h.push('<div class="artcard'+(da?' done':'')+'">'
      + '<div class="ah"><b>今天画什么</b><span class="d">'+ae[1]+' · '+ae[3]+' 分钟</span></div>'
      + '<div class="at">'+esc(ae[2])+'</div>'
      + '<ol class="as">'+ae[4].map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ol>'
      + '<div class="ac">检查：'+esc(ae[5])+'</div>'
      + '<label class="adone"><input type="checkbox" data-ck="art" data-day="'+date+'"'+(da?' checked':'')+'>画完了，打勾</label></div>');
  }

  var st = migrate();
  var ck = (st.ck && st.ck[date]) || {};
  h.push('<div class="ck"><h3>今天打卡（六格做三格就算及格）</h3><div class="g">');
  CK.forEach(function(c){
    h.push('<label><input type="checkbox" data-ck="'+c[0]+'"'+(ck[c[0]]?' checked':'')+'>'+c[1]+'</label>');
  });
  h.push('</div><div class="row"><span>屏幕时间</span><input type="number" id="screen" min="0" max="16" step="0.5" value="'
    + (st.screen && st.screen[date]!=null ? st.screen[date] : '') + '"><span>小时（目标 ≤4）</span></div>');
  var n = CK.filter(function(c){return ck[c[0]];}).length;
  h.push('<div class="sum" id="ckSum">已勾 '+n+' / 6</div></div>');
  return h.join('');
}

/* ── 周表 ── */
function colHTML(date){
  var s = '';
  blocksFor(date).filter(visible).forEach(function(b){
    var st = toMin(b.start), en = toMin(b.end);
    if(st<360) st=360; if(en>1440) en=1440;
    if(en<=360) return;
    var top = (st-360)/60*40, hgt = Math.max(15,(en-st)/60*40);
    REG[date+'|'+b.id] = b;
    s += '<div class="blk k-'+b.color+'" data-k="'+date+'|'+b.id+'" style="top:'+top+'px;height:'+hgt+'px;background:'+tint(getVar(b.color))+'">'
      + '<b>'+esc(b.name)+'</b>' + (b.place?'<span>'+esc(b.place)+'</span>':'') + '</div>';
  });
  return s;
}
function getVar(c){
  return ({course:'#205280',study:'#4b8bc0',jam:'#2f7a4c',art:'#b05430',sport:'#4a9a5f',life:'#b9b5aa',fixed:'#8a3b22'})[c] || '#b9b5aa';
}
function vWeek(){
  var mon = mondayOf(state.date), days = [], h = [];
  for(var i=0;i<7;i++) days.push(addDays(mon,i));
  h.push('<div class="wkbox"><div class="wk">');
  h.push('<div class="hd tl2"></div>');
  days.forEach(function(d,i){
    h.push('<div class="hd'+(d===todayISO()?' today':'')+'"><b>周'+WD[i]+'</b>'+md(d)+'</div>');
  });
  h.push('<div class="tl2"><div class="hours">');
  for(var hh=6; hh<=23; hh++) h.push('<div class="h" style="top:'+((hh-6)*40)+'px">'+pad(hh)+'</div>');
  h.push('</div></div>');
  days.forEach(function(d){
    h.push('<div class="daycol'+(d===todayISO()?' today':'')+'">'+colHTML(d)+'</div>');
  });
  h.push('</div></div>');
  h.push('<div class="muted" style="font-size:12px;margin-top:8px">手机上左右滑动看完整一周 · 点色块看详情</div>');
  return h.join('');
}

/* ── 甘特 ── */
function vGantt(){
  var R = state.gantt==='term' ? ['2026-08-31','2027-01-18'] : ['2026-10-19','2026-11-22'];
  var s0 = fromISO(R[0]), e0 = fromISO(R[1]);
  var total = Math.round((e0-s0)/86400000)+1;
  var today = todayISO();
  var inR = today>=R[0] && today<=R[1];
  var tl = inR ? Math.round((fromISO(today)-s0)/86400000/total*10000)/100 : 0;
  var h = ['<div class="gt">'];
  var list = D.tracks.slice().sort(function(a,b){return fromISO(a.startDate)-fromISO(b.startDate);});
  list.forEach(function(t){
    var st = fromISO(t.startDate), en = fromISO(t.endDate);
    var l = Math.round((st-s0)/86400000/total*1000)/10;
    var w = Math.round(((en-st)/86400000+1)/total*1000)/10;
    var clipL = false, clipR = false;
    if(l<0){ l=0; clipL=true; }
    if(w+l>100){ w=100-l; clipR=true; }
    if(w<=0) return;
    REG['g|'+t.id] = {id:t.id,name:t.name,start:t.startDate,end:t.endDate,color:t.color,note:t.note,src:'任务'};
    h.push('<div class="gtrow"><div class="nm">'+esc(t.name)+'</div><div class="tr">'
      + '<div class="bar k-'+t.color+'" data-k="g|'+t.id+'" title="'+esc(t.name+'　'+t.startDate+' → '+t.endDate+'　'+(t.note||''))+'" '
      + 'style="left:'+l+'%;width:'+w+'%;background:'+getVar(t.color)+'">'
      + (clipL?'← ':'') + esc(t.note||'') + (clipR?' →':'') + '</div>'
      + (inR?'<div class="gtline" style="left:'+tl+'%"></div>':'')
      + '</div></div>');
  });
  var ticks = 5, ax = '';
  for(var i=0;i<ticks;i++){
    var d = addDays(R[0], Math.round((total-1)*i/(ticks-1)));
    var p = i/(ticks-1)*100;
    var tf = i===0 ? '0' : (i===ticks-1 ? '-100%' : '-50%');
    ax += '<span style="left:'+p+'%;transform:translateX('+tf+')">'+md(d)+'</span>';
  }
  h.push('<div class="gtaxis">'+ax+'</div></div>');
  h.push('<div class="muted" style="font-size:12px;margin-top:8px">红虚线 = 今天 · 带边框的横条 = 不可挪动（竞赛、期中）'
    + ' · <a href="#" id="gtSwitch" style="color:var(--course)">切到'+(state.gantt==='term'?'这一个月':'整学期')+'</a></div>');
  return h.join('');
}

/* ── 清单 ── */
function vList(){
  var mon = mondayOf(state.date), h = [];
  h.push('<input class="search" id="q" placeholder="搜一下（课名、教室、事项…）" value="'+esc(state.q)+'">');
  h.push('<table class="list"><thead><tr><th style="width:74px">日期</th><th style="width:96px">时间</th><th>事项</th><th style="width:70px">类别</th><th style="width:96px">地点</th></tr></thead><tbody>');
  var any = 0;
  for(var i=0;i<7;i++){
    var d = addDays(mon,i);
    var blks = blocksFor(d).filter(visible);
    if(state.q){
      var q = state.q.toLowerCase();
      blks = blks.filter(function(b){
        return (b.name+' '+(b.place||'')+' '+(b.note||'')).toLowerCase().indexOf(q)>=0;
      });
    }
    if(!blks.length) continue;
    any += blks.length;
    h.push('<tr class="grp"><td colspan="5">'+md(d)+' 周'+WD[wdOf(d)-1]+'　第 '+weekOf(d)+' 周'
      + (isJam(d)?'　<i class="jamdot">Jam</i>':'') + '</td></tr>');
    blks.forEach(function(b, i){
      REG[d+'|'+b.id] = b;
      h.push('<tr data-k="'+d+'|'+b.id+'" style="cursor:pointer"><td>'+(i===0?md(d):'')+'</td><td>'+b.start+'–'+b.end+'</td><td>'+esc(b.name)
        + '</td><td><span class="tag t-'+b.color+'">'+b.src+'</span></td><td>'+esc(b.place||'—')+'</td></tr>');
    });
  }
  h.push('</tbody></table>');
  if(!any) h.push('<div class="card muted" style="margin-top:10px">这一周没有匹配的条目。</div>');
  var pend = (D.events||[]).filter(function(e){return e.pending;});
  if(pend.length){
    h.push('<div class="muted" style="font-size:12px;margin-top:10px">待定：');
    h.push(pend.map(function(e){return esc(e.name)+'（'+esc(e.note||'日期未定')+'）';}).join('　'));
    h.push('</div>');
  }
  return h.join('');
}

/* ── 抽屉 ── */
/* ── 美术 90 天 ── */
function vArt(){
  var h = [], total = ART.length, done = 0;
  ART.forEach(function(e){ if(ckFor(e[0],'art')) done++; });
  var cur = artGet(todayISO());
  h.push('<div class="card"><b>美术 90 天 · 已完成 '+done+' / '+total+' 天</b><br>'
    + '<div class="muted">每天 15–30 分钟。这里的勾和「今日」页是同一份数据，打一次两边都算。'
    + (cur?' 今天 '+cur[1]+'：'+esc(cur[2])+'。':'')+'</div></div>');
  var byW = {}, order = [];
  ART.forEach(function(e){ var w = mondayOf(e[0]); if(!byW[w]){byW[w]=[];order.push(w);} byW[w].push(e); });
  order.forEach(function(w){
    h.push('<div class="agrp">'+md(w)+' 那周<span>第 '+weekOf(w)+' 周</span></div>');
    byW[w].forEach(function(e){
      var d = ckFor(e[0],'art');
      h.push('<div class="arow'+(d?' done':'')+(e[0]===todayISO()?' now':'')+'">'
        + '<label class="adone"><input type="checkbox" data-ck="art" data-day="'+e[0]+'"'+(d?' checked':'')+'></label>'
        + '<span class="dt">'+md(e[0])+'</span>'
        + '<span class="dn">'+e[1]+'</span>'
        + '<span class="tt">'+esc(e[2])+'</span>'
        + '<span class="mm">'+e[3]+'′</span></div>');
    });
  });
  if(D.artLater) h.push('<div class="card muted">'+esc(D.artLater)+'</div>');
  return h.join('');
}

function openDrawer(key){
  var b = REG[key];
  if(!b) return;
  var html = '<h3>'+esc(b.name)+'</h3><dl>';
  if(b.start && b.end){
    html += '<dt>时间</dt><dd>'+(b.startDate? b.startDate+' → '+b.endDate : b.start+' – '+b.end)+'</dd>';
  }
  if(b.place) html += '<dt>地点</dt><dd>'+esc(b.place)+'</dd>';
  html += '<dt>类别</dt><dd><span class="tag t-'+b.color+'">'+b.src+'</span></dd>';
  if(b.note) html += '<dt>备注</dt><dd>'+esc(b.note)+'</dd>';
  if(!b.startDate) html += '<dt>规则</dt><dd>每天重复，改 data.js 里的 routines</dd>';
  else html += '<dt>规则</dt><dd>跨天任务，改 data.js 里的 tracks / events</dd>';
  html += '</dl>';
  document.getElementById('dbody').innerHTML = html;
  document.getElementById('drawer').className = 'drawer open';
}

/* ── 主渲染 ── */
function render(){
  var v = {today:vToday, week:vWeek, gantt:vGantt, list:vList, art:vArt}[state.view];
  document.getElementById('main').innerHTML = v();
  head(); legend();
  var tabs = document.querySelectorAll('.tab');
  for(var i=0;i<tabs.length;i++) tabs[i].className = 'tab' + (tabs[i].dataset.v===state.view?' on':'');
  if(state.view==='list'){
    var q = document.getElementById('q');
    if(q) q.addEventListener('input', function(){ state.q = this.value; var pos = this.selectionStart; render(); var q2=document.getElementById('q'); if(q2){q2.focus(); q2.setSelectionRange(pos,pos);} });
  }
  var sw = document.getElementById('gtSwitch');
  if(sw) sw.addEventListener('click', function(e){ e.preventDefault(); state.gantt = state.gantt==='term'?'month':'term'; render(); });
  if(typeof syncHash==='function') syncHash();
}

/* ── 事件 ── */
document.addEventListener('click', function(e){
  var t = e.target;
  var tab = t.closest ? t.closest('.tab') : null;
  if(tab){ state.view = tab.dataset.v; render(); return; }
  var lg = t.closest ? t.closest('.lg[data-cat]') : null;
  if(lg){ var c = lg.dataset.cat; state.hidden[c] = !state.hidden[c]; render(); return; }
  if(t.closest && t.closest('#jamSw')){
    if(state.jamForce===null) state.jamForce = true;
    else if(state.jamForce===true) state.jamForce = false;
    else state.jamForce = null;
    render(); return;
  }
  var k = t.closest ? t.closest('[data-k]') : null;
  if(k){ openDrawer(k.dataset.k); return; }
  if(t.id==='dx' || (t.closest && t.closest('#drawer') && t.classList.contains('x'))){ }
  if(t.id==='prev'){ state.date = addDays(state.date, state.view==='week'? -7 : -1); render(); return; }
  if(t.id==='next'){ state.date = addDays(state.date, state.view==='week'? 7 : 1); render(); return; }
  if(t.id==='todayBtn'){ state.date = todayISO(); render(); return; }
});

document.getElementById('dx').addEventListener('click', function(){ document.getElementById('drawer').className='drawer'; });

document.addEventListener('change', function(e){
  var t = e.target;
  if(t.dataset && t.dataset.ck){
    var day = t.dataset.day || state.date;
    var s = migrate();
    s.ck = s.ck || {}; s.ck[day] = s.ck[day] || {};
    if(t.checked) s.ck[day][t.dataset.ck] = 1; else delete s.ck[day][t.dataset.ck];
    save(s);
    if(t.dataset.day){ render(); return; }
    var n = CK.filter(function(c){return s.ck[day][c[0]];}).length;
    var el = document.getElementById('ckSum');
    if(el) el.textContent = '已勾 '+n+' / 6';
    return;
  }
  if(t.id==='screen'){
    var st = migrate(); st.screen = st.screen || {};
    st.screen[state.date] = parseFloat(t.value)||0; save(st); return;
  }
});

document.getElementById('printBtn').addEventListener('click', function(){ window.print(); });

document.addEventListener('keydown', function(e){
  if(e.target.tagName==='INPUT') return;
  if(e.key==='1'){ state.view='today'; render(); }
  if(e.key==='2'){ state.view='week'; render(); }
  if(e.key==='3'){ state.view='gantt'; render(); }
  if(e.key==='4'){ state.view='list'; render(); }
  if(e.key==='5'){ state.view='art'; render(); }
  if(e.key==='t'||e.key==='T'){ state.date=todayISO(); render(); }
  if(e.key==='ArrowLeft'){ document.getElementById('prev').click(); }
  if(e.key==='ArrowRight'){ document.getElementById('next').click(); }
});

function initFromHash(){
  var h = (location.hash||'').replace(/^#\/?/,'');
  if(!h) return;
  var p = h.split('/');
  if(['today','week','gantt','list','art'].indexOf(p[0])>=0) state.view = p[0];
  if(p[1] && /^\d{4}-\d{2}-\d{2}$/.test(p[1])) state.date = p[1];
}

function syncHash(){
  var want = '#'+state.view+'/'+state.date;
  if(location.hash !== want){
    try{ history.replaceState(null,'',want); }catch(e){ location.hash = want; }
  }
}

initFromHash();
migrate();
render();
syncHash();
window.addEventListener('hashchange', function(){ initFromHash(); render(); });
})();