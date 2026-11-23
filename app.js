(function(){
'use strict';
var $=function(id){return document.getElementById(id)};
var byId={};ENTRIES.forEach(function(e){byId[e.id]=e});
var spotById={};SPOTS.forEach(function(s){spotById[s.id]=s});
var ORDER=['topL','topR','apL1','apL2','apL3','apL4','apL5','apL6','trinity','apR1','apR2','apR3','apR4','apR5','apR6','wallL','michael','nicholas','theotokos','doors','christ','baptist','bishops','wallR','standL','standR'];
var MKLABEL={apL1:'Св. Филип',apL2:'Св. Тома',apL3:'Св. Марко',apL4:'Св. Матеј',apL5:'Св. Андреј',apL6:'Св. Петар',apR1:'Св. Павле',apR2:'Св. Симон',apR3:'Св. Лука',apR4:'Св. Јован',apR5:'Св. Вартоломеј',apR6:'Св. Јаков',trinity:'Света Троица',topL:'Пресвета Богородица',topR:'Свети Јован Богослов',michael:'Архангел Михаил',nicholas:'Св. Николај',theotokos:'Пресвета Богородица',doors:'Царски двери',christ:'Господ Исус Христос',baptist:'Св. Јован Крстител',standL:'Богородица (на столче)',standR:'Христос (на столче)',wallL:'Светец воин (лев ѕид)',wallR:'Светец воин (десен ѕид)',bishops:'Двајца свети архиереи (страничен ѕид)'};
var lang=localStorage.getItem('ico-lang')||'both';
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function bk(e){return 'img/booklet/p'+String(e.page).padStart(2,'0')+'.jpg'}
function ch(s){return 'img/church/'+s.id.toLowerCase()+'.jpg'}
function T(en,mk){return lang==='mk'?mk:(lang==='en'?en:en)}

function applyStatic(){
  document.documentElement.lang=lang==='mk'?'mk':'en';
  document.querySelectorAll('[data-en]').forEach(function(el){el.textContent=lang==='mk'?el.dataset.mk:el.dataset.en});
  document.querySelectorAll('#langSeg button').forEach(function(b){b.classList.toggle('on',b.dataset.lang===lang)});
}

// Hotspots: the photo is shown as three stacked sections (left, middle, right);
// each hotspot's position in the full photo (%) is converted to % of its section.
var SECTIONS=[{"id": "left", "x0": 0.0, "y0": 22.0068, "x1": 44.6, "y1": 81.984}, {"id": "middle", "x0": 42.2, "y0": 0.0, "x1": 59.2, "y1": 85.9749}, {"id": "right", "x0": 57.8, "y0": 22.0068, "x1": 100.0, "y1": 81.984}];
function secFor(s){
  var e=0.05,fit=SECTIONS.filter(function(c){return s.x>=c.x0-e&&s.y>=c.y0-e&&s.x+s.w<=c.x1+e&&s.y+s.h<=c.y1+e});
  if(fit.length)return fit[0];
  var cx=s.x+s.w/2;return SECTIONS.filter(function(c){return cx>=c.x0&&cx<=c.x1})[0]||SECTIONS[0];
}
var FULL={id:'full',x0:0,y0:0,x1:100,y1:100};
function addSpot(s,c){
  var W=c.x1-c.x0,H=c.y1-c.y0;
  var x0=Math.max(s.x,c.x0),y0=Math.max(s.y,c.y0),x1=Math.min(s.x+s.w,c.x1),y1=Math.min(s.y+s.h,c.y1);
  var b=document.createElement('button');
  b.className='hs';b.type='button';b.dataset.id=s.id;b.dataset.sec=c.id;
  b.style.left=((x0-c.x0)/W*100)+'%';b.style.top=((y0-c.y0)/H*100)+'%';b.style.width=((x1-x0)/W*100)+'%';b.style.height=((y1-y0)/H*100)+'%';
  b.setAttribute('aria-label',s.label);b.title=s.label;
  b.addEventListener('click',function(){b.classList.add('flash');setTimeout(function(){b.classList.remove('flash')},250);go('s/'+s.id)});
  var st=$('stage-'+c.id);if(st)st.appendChild(b);
}
SPOTS.forEach(function(s){addSpot(s,FULL)});
SPOTS.forEach(function(s){addSpot(s,secFor(s))});
$('showOutlines').addEventListener('change',function(e){document.querySelectorAll('.stage').forEach(function(st){st.classList.toggle('noline',!e.target.checked)})});

function renderList(){
  if(!$('list'))return;
  $('list').innerHTML=ENTRIES.map(function(e){
    var fd=e.feastEn?(lang==='mk'?e.feastMk:e.feastEn).replace(/^(Feast Day|Празник) \| /,''):'';
    var main=lang==='mk'?e.mk:e.en, sub=lang==='both'?e.mk:'';
    return '<li><button type="button" data-id="'+e.id+'"><span class="num">'+e.page+'</span><img loading="lazy" src="'+bk(e)+'" alt=""><span class="t"><span class="en">'+esc(main)+'</span>'+(sub?'<span class="mk">'+esc(sub)+'</span>':'')+(fd?'<span class="fd">'+esc(fd)+'</span>':'')+'</span></button></li>';
  }).join('');
}
if($('list'))$('list').addEventListener('click',function(ev){var b=ev.target.closest('button[data-id]');if(b)go('p/'+b.dataset.id)});

function renderDedication(){$('dedication').innerHTML=esc(DEDICATION)+'<span class="d">'+esc(DEDICATION_DATE)+'</span>'}

function langBlock(e,which){
  var en=which==='en';
  var title=en?e.en:e.mk, feast=en?e.feastEn:e.feastMk, txt=en?e.textEn:e.textMk;
  return '<section class="lang" lang="'+(en?'en':'mk')+'"><h1>'+esc(title)+'</h1>'+(feast?'<p class="feast">'+esc(feast)+'</p>':'')+'<p class="txt">'+esc(txt)+'</p></section>';
}

var cur=null; // {kind:'s'|'p', id}
function openView(kind,id){
  var s=kind==='s'?spotById[id]:null;
  var e=kind==='s'?(s&&s.entry?byId[s.entry]:null):byId[id];
  if(!s&&!e){closeView();return}
  cur={kind:kind,id:id};
  var title=s?(lang==='mk'?MKLABEL[s.id]||s.label:s.label):(lang==='mk'?e.mk:e.en);
  $('vTitle').textContent=title;
  var src=(s&&s.img)?s.img:(e?bk(e):ch(s)), alt=(s&&s.img)?s.label+' – icon':(e?e.en+' – icon':s.label);
  var h='<figure class="pic one"><button type="button" data-zoom="'+src+'" aria-label="'+T('Zoom','Зумирај')+'"><img src="'+src+'" alt="'+esc(alt)+'"></button></figure>';
  if(s&&s.note)h+='<p class="note">'+esc(s.note)+'</p>';
  if(e){
    if(lang!=='mk')h+=langBlock(e,'en');
    if(lang!=='en')h+=langBlock(e,'mk');
    if(!s&&e.where)h+='<p class="meta">'+T('On the iconostasis: ','На иконостасот: ')+esc(e.where)+'</p>';
    var v=(typeof VIDEOS!=='undefined')&&VIDEOS[e.id];
    if(v){
      var ven='Watch: '+v.en+' (video)', vmk='Видео (на англиски): '+v.mk;
      h+='<a class="vlink" href="https://www.youtube.com/watch?v='+v.id+'" target="_blank" rel="noopener"><span class="vplay" aria-hidden="true">▶</span><span class="vtxt">'+
        (lang==='mk'?'<span lang="mk">'+esc(vmk)+'</span>':'<span>'+esc(ven)+'</span>'+(lang==='en'?'':'<small lang="mk">'+esc(vmk)+'</small>'))+'</span></a>';
    }
  } else {
    h+='<div class="noentry">'+T('No booklet entry for this icon.','Нема запис во книшката за оваа икона.')+'</div>';
  }
  $('vBody').innerHTML=h;$('vBody').scrollTop=0;
  var seq=kind==='s'?ORDER:ENTRIES.map(function(x){return x.id});
  var i=seq.indexOf(id);
  $('vPrev').disabled=i<=0;$('vNext').disabled=i>=seq.length-1;
  $('vPrev').onclick=function(){if(i>0)go(kind+'/'+seq[i-1],true)};
  $('vNext').onclick=function(){if(i<seq.length-1)go(kind+'/'+seq[i+1],true)};
  $('viewer').hidden=false;document.body.classList.add('locked');
}
function closeView(){cur=null;$('viewer').hidden=true;document.body.classList.remove('locked')}
$('vBody').addEventListener('click',function(ev){var b=ev.target.closest('[data-zoom]');if(b)openZoom(b.dataset.zoom)});

// Routing via hash so the phone's back button closes views
function go(route,replace){if(replace)location.replace('#'+route);else location.hash=route}
function route(){
  var h=location.hash.replace(/^#/,'');
  closeZoom(true);
  var m=h.match(/^(s|p)\/(\w+)$/);
  if(m)openView(m[1],m[2]);else closeView();
}
window.addEventListener('hashchange',route);
$('vClose').addEventListener('click',function(){if(history.length>1&&location.hash)history.back();else go('',true)});

// Zoom viewer with pinch / pan / double-tap
var z={s:1,x:0,y:0},pts={},start=null,lastTap=0,zimg=$('zImg'),zwrap=$('zWrap');
function zApply(){zimg.style.transform='translate('+z.x+'px,'+z.y+'px) scale('+z.s+')'}
function zReset(){z={s:1,x:0,y:0};zApply()}
function openZoom(src){zimg.src=src;zReset();$('zoom').hidden=false}
function closeZoom(){$('zoom').hidden=true}
$('zClose').addEventListener('click',closeZoom);
function base(){var r=zimg.getBoundingClientRect();return{l:r.left-z.x,t:r.top-z.y}}
function zoomAt(cx,cy,ns){ns=Math.max(1,Math.min(6,ns));var b=base();var px=(cx-b.l-z.x)/z.s,py=(cy-b.t-z.y)/z.s;z.x=cx-b.l-px*ns;z.y=cy-b.t-py*ns;z.s=ns;if(ns===1){z.x=0;z.y=0}zApply()}
zwrap.addEventListener('pointerdown',function(e){zwrap.setPointerCapture(e.pointerId);pts[e.pointerId]={x:e.clientX,y:e.clientY};var k=Object.keys(pts);
  if(k.length===2){var a=pts[k[0]],c=pts[k[1]];start={d:Math.hypot(a.x-c.x,a.y-c.y),s:z.s}}
  else if(k.length===1){var now=Date.now();if(now-lastTap<300){zoomAt(e.clientX,e.clientY,z.s>1?1:2.5);lastTap=0}else lastTap=now;start={px:e.clientX,py:e.clientY,x:z.x,y:z.y}}});
zwrap.addEventListener('pointermove',function(e){if(!pts[e.pointerId])return;pts[e.pointerId]={x:e.clientX,y:e.clientY};var k=Object.keys(pts);
  if(k.length===2&&start&&start.d){var a=pts[k[0]],c=pts[k[1]];zoomAt((a.x+c.x)/2,(a.y+c.y)/2,start.s*Math.hypot(a.x-c.x,a.y-c.y)/start.d)}
  else if(k.length===1&&start&&start.px!==undefined&&z.s>1){z.x=start.x+e.clientX-start.px;z.y=start.y+e.clientY-start.py;zApply()}});
function up(e){delete pts[e.pointerId];var k=Object.keys(pts);if(k.length===1){var p=pts[k[0]];start={px:p.x,py:p.y,x:z.x,y:z.y}}else if(!k.length)start=null}
zwrap.addEventListener('pointerup',up);zwrap.addEventListener('pointercancel',up);
zwrap.addEventListener('wheel',function(e){e.preventDefault();zoomAt(e.clientX,e.clientY,z.s*(e.deltaY<0?1.2:1/1.2))},{passive:false});
document.addEventListener('keydown',function(e){if(e.key==='Escape'){if(!$('zoom').hidden)closeZoom();else if(cur)$('vClose').click()}});

// Language
$('langSeg').addEventListener('click',function(ev){var b=ev.target.closest('button[data-lang]');if(!b)return;lang=b.dataset.lang;localStorage.setItem('ico-lang',lang);renderAll()});
function renderAll(){applyStatic();renderList();renderDedication();if(cur)openView(cur.kind,cur.id)}
renderAll();route();

if('serviceWorker' in navigator&&location.protocol!=='file:'){
  var hadController=!!navigator.serviceWorker.controller, reloaded=false;
  navigator.serviceWorker.addEventListener('controllerchange',function(){
    // a new version took over: reload once (not on the very first install, and never twice)
    if(!hadController||reloaded)return;
    if(sessionStorage.getItem('ico-reloaded')===String(Date.now()).slice(0,-4))return;
    reloaded=true;sessionStorage.setItem('ico-reloaded',String(Date.now()).slice(0,-4));location.reload();
  });
  window.addEventListener('load',function(){
    navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(function(reg){
      reg.update().catch(function(){});
      document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')reg.update().catch(function(){})});
    }).catch(function(){});
  });
}
})();
