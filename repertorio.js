// ===== PANTALLA: REPERTORIO (misa y evento, vista previa y PDF) =====
import {$,esc,guardar,crear,escuchar,eliminar,vistas,ic,modal} from "./base.js";

const st=document.createElement('style');
st.textContent=`[data-vista=repertorio] .rcols{display:grid;grid-template-columns:400px minmax(0,1fr);gap:24px;align-items:start}
.hojap{background:#fff;max-width:794px;padding:44px 52px;box-shadow:var(--sombra-2);border-radius:6px;min-height:520px;font-size:18px;line-height:1.35;margin:0 auto;overflow-x:auto}
.rt{margin:0 0 4px;font-size:30px}.rf{color:var(--gris);margin-bottom:22px}.rf::first-letter{text-transform:uppercase}.blk{margin:0 0 18px}
.lab{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--oro-texto);border-bottom:1px solid var(--linea);margin-bottom:6px;padding-bottom:3px}
.st{font-family:var(--fuente-titulo);font-weight:600;font-size:20px;color:var(--azul);margin:8px 0 4px}.st small{font:600 12.5px var(--fuente);color:var(--gris);margin-left:10px}
.sg{font-family:ui-monospace,SFMono-Regular,Menlo,Arial,"Courier New",monospace}.rl,.rc{font-family:inherit;white-space:pre-wrap;line-height:var(--lh,1.35)}.rc{white-space:pre;font-weight:700;color:#b3261e}
.falta{color:var(--rojo);font-weight:600;font-size:13px;font-style:normal}.sg{margin-bottom:14px}
.hojap .falta{font-size:15px;color:var(--gris);text-align:center;padding:60px 20px;border:1px dashed var(--linea-2);border-radius:var(--r-m)}
[data-vista=repertorio] .mrow{display:flex;align-items:center;gap:6px;padding:9px 0;border-bottom:1px solid var(--linea)}
[data-vista=repertorio] .mrow:last-child{border-bottom:0}
.mn{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}.mn b{font-size:14.5px}.mn span{color:var(--azul);font-weight:600;font-size:14.5px}.mn small,.fila small{color:var(--gris);font-weight:500;font-size:12.5px}
[data-vista=repertorio] .mrow .ic{width:34px;height:34px}
.sec2{background:var(--capa);border-radius:var(--r-m);padding:12px;margin-top:12px;display:grid;gap:8px}[data-vista=repertorio] .dh{display:flex;align-items:center;gap:6px}
.seg{display:flex;background:var(--suave);border-radius:var(--r-m);padding:3px;gap:2px}.seg button{background:transparent;color:var(--azul);flex:1;min-height:34px;border-radius:9px}.seg button.on{background:var(--azul);color:#fff}
.rhead{display:grid;gap:12px;margin-bottom:6px}.rhead .dos{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.momentos{margin-top:8px}
.rcard{text-align:left;padding:16px 50px 16px 16px;display:flex;gap:14px;align-items:center}
.rcard .cf{flex:none;min-width:54px;padding:6px 6px!important;border-radius:var(--r-m);background:var(--capa);text-align:center;padding:6px 0;line-height:1.1}
.rcard .cf b{margin:0;font-size:20px;font-family:var(--fuente-titulo);color:var(--azul)}.rcard .cf span{font-size:11.5px;font-weight:700;color:var(--gris);text-transform:capitalize}
.rcard .ri{min-width:0}.rcard .ri b{margin:0;font-size:15px}
.rcard small{display:block;color:var(--gris);margin-top:2px;font-weight:500}.rcard .ic{position:absolute;top:50%;right:10px;transform:translateY(-50%)}
.rcard .tipo{display:inline-block;background:var(--suave);color:var(--azul);border-radius:999px;padding:1px 9px;font-size:12px;font-weight:700;margin-top:4px}
.fila{display:flex;flex-direction:column;align-items:flex-start;width:100%;background:var(--capa);color:var(--tx);margin-bottom:6px;text-align:left;font-weight:600}.fila:hover{background:var(--suave);filter:none}
.lista2{max-height:50vh;overflow:auto;margin-top:10px}
.modo-full #izq{display:none!important}
.modo-full .rcols{grid-template-columns:1fr!important}
@media(max-width:960px){[data-vista=repertorio] .rcols{grid-template-columns:minmax(0,1fr)}.hojap{padding:24px 20px;min-height:300px}}
@media print{header,#aviso,#izq,.noprint,.mo,.falta,.blk:has(.falta){display:none!important}main{padding:0;max-width:none}.rcols{display:block!important}.hojap{box-shadow:none;padding:0}
@page{size:A4;margin:14mm}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}}`;
document.head.append(st);

const ico=(p,s=16)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const SHF='<path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>';
const PRN='<path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><path d="M6 14h12v8H6z"/>';
const EXP='<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>';
const FUL='<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>';

const MOM=[['entrada','Canto de entrada'],['kyrie','Kyrie'],['gloria','Gloria'],['aclamacion','Aclamaci\u00f3n'],['peticiones','Peticiones'],['ofertorio','Ofertorio'],['santo','Santo'],['elevacion','Elevaci\u00f3n'],['anunciamos','Anunciamos'],['amen','Am\u00e9n'],['cordero','Cordero'],['comunion','Comuni\u00f3n'],['gracias','Acci\u00f3n de gracias'],['maria','Canto a Mar\u00eda']];
const MES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],DIA=['domingo','lunes','martes','mi\u00e9rcoles','jueves','viernes','s\u00e1bado'];
const fechaLarga=f=>{if(!f)return'';const [y,m,d]=f.split('-').map(Number);return DIA[new Date(y,m-1,d).getDay()]+' '+d+' de '+MES[m-1]+' de '+y};
const fechaCorta=f=>{if(!f)return'Sin fecha';const [y,m,d]=f.split('-');return d+'/'+m+'/'+y};

const FF={'Courier New':'Arial,Courier,monospace','Arial':'Arial,"Courier New",monospace','Lucida Console':'"Lucida Console",Monaco,monospace','Menlo / Monaco':'Menlo,Monaco,"Courier New",monospace'};
const fcss=n=>!n?'':(FF[n]||('"'+String(n).replace(/["\\<>]/g,'')+'",sans-serif'));
const OKC=/^(#[0-9a-f]{3,8}|rgba?\([\d\s,.]+\))$/i;
const est=r=>(r.k?'font-weight:700;color:#b3261e;':'')+(r.b?'font-weight:700;':'')+(r.i?'font-style:italic;':'')+((r.u||r.x)?'text-decoration:'+[r.u&&'underline',r.x&&'line-through'].filter(Boolean).join(' ')+';':'')+(OKC.test(r.c||'')?'color:'+r.c+';':'')+(OKC.test(r.h||'')?'background-color:'+r.h+';':'');
const hl=(c,t)=>{c=c||[];t=String(t||'');let h='',i=0;while(i<t.length){let j=i;while(j<t.length&&(c[j]||0)===(c[i]||0))j++;h+=OKC.test(c[i]||'')?`<span style="color:${c[i]}">${esc(t.slice(i,j))}</span>`:esc(t.slice(i,j));i=j}return h};

function hojaAcordes(c){
  const f=fcss(c.fuenteA),tono=c.tonoAct||c.tono;
  let h=`<div class="sg" style="${f?'font-family:'+f+';':''}${c.lh?'--lh:'+c.lh+';':''}"><div class="st">${esc(c.titulo)}${tono?`<small>Tono: ${esc(tono)}</small>`:''}</div>`;
  c.lineasA.forEach(l=>{h+=`<div class="rl" style="font-size:${l.s||18}px;padding-left:${(l.n||0)*28}px;${l.a?'text-align:'+l.a+';':''}">${l.r.map(x=>`<span style="${est(x)}">${esc(x.t)}</span>`).join('')||'&nbsp;'}</div>`});
  return h+'</div>';
}
function cancion(c,ac){
  if(ac&&c.lineasA&&c.lineasA.some(l=>l.r.length))return hojaAcordes(c);
  const cc=c.cc||{},blq=(n,t,k)=>`<div class="rc"><b>${n}:</b>${hl(cc[k],t)}</div>`;
  const L=c.lineas||(c.letra||'').split('\n').map(t=>({r:t?[{t}]:[]})),it=c.interludios||[];
  let h=`<div class="sg" style="${fcss(ac?c.fuenteA:c.fuente)?'font-family:'+fcss(ac?c.fuenteA:c.fuente)+';':''}${c.lh?'--lh:'+c.lh+';':''}"><div class="st">${esc(c.titulo)}${ac&&(c.tonoAct||c.tono)?`<small>Tono: ${esc(c.tonoAct||c.tono)}</small>`:''}</div>`;
  if(ac&&c.intro&&c.intro.trim())h+=blq('Intro',c.intro,'intro');
  L.forEach((l,i)=>{
    const z=l.s||18,ca=ac&&c.ac&&c.ac[i];
    if(ca&&ca.trim())h+=`<div class="rc" style="font-size:${z}px;padding-left:${(l.n||0)*28}px">${hl(cc['a'+i],ca)}</div>`;
    h+=`<div class="rl" style="font-size:${z}px;padding-left:${(l.n||0)*28}px;${!ac&&l.a?'text-align:'+l.a+';':''}">${l.r.map(r=>`<span style="${est(r)}">${esc(r.t)}</span>`).join('')||'&nbsp;'}</div>`;
    if(ac)it.filter(x=>x.despues===i).forEach(x=>{if((x.texto||'').trim())h+=blq('Interludio',x.texto,'i:'+x.id)});
  });
  if(ac)it.filter(x=>x.despues<0||x.despues>=L.length).forEach(x=>{if((x.texto||'').trim())h+=blq('Interludio',x.texto,'i:'+x.id)});
  if(ac&&c.final!=null&&String(c.final).trim())h+=blq('Final',c.final,'final');
  return h+'</div>';
}

let C=[],T=[],A=[],R=[],el=null,rep=null,tm=null,fullMode=false,fullZoom=1,pinchDist=0,baseZoom=1;
const alb=c=>A.find(a=>a.id===c.albumId)?.nombre||'';
const titAlb=c=>`<span>${esc(c.titulo)}</span>`+(alb(c)?`<small>${esc(alb(c))}</small>`:'');
const ref=()=>{if(el)rep?pder():lista()};
escuchar('canciones',l=>{C=l;ref()});escuchar('etiquetas',l=>{T=l;ref()});escuchar('albumes',l=>{A=l});escuchar('repertorios',l=>{R=l;ref()});
const rand=()=>Math.random().toString(36).slice(2,8);
const sec=id=>rep.secciones.find(s=>s.id===id);
const tagId=n=>T.find(t=>t.nombre.toLowerCase()===n.toLowerCase())?.id;
const candMom=id=>{const g=tagId(MOM.find(m=>m[0]===id)[1]);return g?C.filter(c=>(c.etiquetas||[]).includes(g)):[]};
const candSec=s=>s.tag?C.filter(c=>(c.etiquetas||[]).includes(s.tag)):C;
const usadas=()=>[...Object.values(rep.misa),...rep.secciones.flatMap(s=>s.canciones)];
const azar=(l,u)=>{const d=l.filter(c=>!u.includes(c.id)),b=d.length?d:l;return b.length?b[Math.floor(Math.random()*b.length)].id:null};
const guarda=()=>{clearTimeout(tm);tm=setTimeout(flush,300)};
function flush(){clearTimeout(tm);tm=null;if(rep){const {id,...d}=rep;guardar('repertorios',id,d,false)}}

vistas.repertorio=e=>{
  el=e;rep=null;fullMode=false;el.onclick=clic;el.oninput=entra;el.onchange=entra;
  const a=sessionStorage.getItem('repAbrir'),f=sessionStorage.getItem('repFecha');
  sessionStorage.removeItem('repAbrir');sessionStorage.removeItem('repFecha');
  if(a&&R.find(x=>x.id===a))abrir(a);else if(f)nuevo(f);else lista();
};
addEventListener('hashchange',()=>{if(location.hash!=='#repertorio'){flush();el=null;rep=null;fullMode=false;fullZoom=1}});
addEventListener('reinicio',e=>{if(e.detail==='repertorio'&&el){flush();rep=null;fullMode=false;lista()}});

function lista(){
  el.className="";
  const cuadro=f=>{if(!f)return '<b>\u2013</b><span>Sin fecha</span>';const [y,m,d]=f.split('-').map(Number);return `<b>${d}</b><span>${MES[m-1].slice(0,3)}${y!==new Date().getFullYear()?' '+y:''}</span>`};
  const cuantas=r=>{const n=r.tipo==='evento'?(r.secciones||[]).reduce((a,x)=>a+(x.canciones||[]).length,0):Object.values(r.misa||{}).filter(Boolean).length;return n?n+(n>1?' canciones':' canci\u00f3n'):'Sin canciones'};
  el.innerHTML=`<div class="ch2"><h1>Repertorios</h1><button data-nuevo>${ic('pls',16)} Nuevo repertorio</button></div><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr))">`
    +[...R].sort((a,b)=>(b.fecha||'').localeCompare(a.fecha||'')).map(r=>`<div class="card rcard" data-open="${r.id}" role="button" tabindex="0"><div class="cf" aria-hidden="true">${cuadro(r.fecha)}</div><div class="ri"><b>${esc(r.nombre||'Sin nombre')}</b><small>${cuantas(r)}</small><span class="tipo">${r.tipo==='evento'?'Evento':'Misa'}</span></div><button class="ic rj" data-del="${r.id}" aria-label="Eliminar \u00ab${esc(r.nombre||'Sin nombre')}\u00bb" title="Eliminar">${ic('trs',16)}</button></div>`).join('')
    +'</div>'+(R.length?'':'<p class="vacio">A\u00fan no hay repertorios. Pulsa \u00abNuevo repertorio\u00bb para preparar el primero.</p>');
}
async function nuevo(f){const d={nombre:'Nuevo repertorio',fecha:f||'',tipo:'misa',acordes:false,misa:{},secciones:[]};const r=await crear('repertorios',d);rep={id:r.id,...d};editor()}
function abrir(id){rep=structuredClone(R.find(x=>x.id===id));rep.misa=rep.misa||{};rep.secciones=rep.secciones||[];editor()}
function editor(){
  el.className=fullMode?"modo-full":"";
  if(!fullMode) fullZoom = 1; // Reiniciar zoom al salir de pantalla completa
  el.innerHTML=`<div class="rcols"><section class="c2" id="izq"></section><section><div class="ch2 noprint" id="btn-full-container" ${fullMode ? 'style="position:fixed;top:15px;right:15px;z-index:9999;background:#fff;padding:8px 12px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);"' : ''}><h2 style="margin:0; ${fullMode ? 'display:none;' : ''}">Vista previa</h2><div style="display:flex;gap:6px;"><button data-full class="sec">${ico(FUL)} ${fullMode?'Salir vista completa':'Vista completa'}</button><button data-print>${ico(PRN)} Descargar PDF</button></div></div><div class="hojap" id="hoja" style="transform: scale(${fullZoom}); transform-origin: top center; transition: transform 0.05s ease-out;"></div></section></div>`;
  pizq();pder();
  
  // Agregar listeners táctiles para zoom por gestos en pantalla completa
  const hojaEl = $('#hoja');
  if(hojaEl){
    hojaEl.ontouchstart = e => {
      if(fullMode && e.touches.length === 2){
        pinchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        baseZoom = fullZoom;
      }
    };
    hojaEl.ontouchmove = e => {
      if(fullMode && e.touches.length === 2 && pinchDist > 0){
        e.preventDefault();
        const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        fullZoom = Math.min(Math.max(0.5, baseZoom * (dist / pinchDist)), 2.5); // Limita el zoom entre 50% y 250%
        hojaEl.style.transform = `scale(${fullZoom})`;
      }
    };
  }
}function pizq(){
  const i=$('#izq');if(!i||!rep)return;
  const fila=([id,n])=>{const c=C.find(x=>x.id===rep.misa[id]);
    return`<div class="mrow"><div class="mn"><b>${n}</b>${c?titAlb(c):'<em class="falta">Sin canci\u00f3n</em>'}</div><button class="ic" data-pick="${id}" aria-label="Elegir canci\u00f3n para ${n}" title="Elegir">${ic('edt',15)}</button><button class="ic" data-rnd="${id}" aria-label="Canci\u00f3n al azar para ${n}" title="Al azar">${ico(SHF,15)}</button>${c?`<button class="ic rj" data-rm="${id}" aria-label="Quitar canci\u00f3n de ${n}" title="Quitar">${ic('x',15)}</button>`:''}</div>`};
  const secs=s=>`<div class="sec2"><div class="dh"><input class="inl" data-sn="${s.id}" value="${esc(s.nombre)}" placeholder="Nombre de la secci\u00f3n"><button class="ic" data-srnd="${s.id}" aria-label="A\u00f1adir canci\u00f3n al azar" title="Al azar">${ico(SHF,15)}</button><button class="ic rj" data-sdel="${s.id}" aria-label="Eliminar secci\u00f3n">${ic('trs',15)}</button></div>
    <label class="fl2">Opciones de canciones<select data-st="${s.id}"><option value="">Todas las canciones</option>${T.map(t=>`<option value="${t.id}"${s.tag===t.id?'selected':''}>${esc(t.nombre)}</option>`).join('')}</select></label>`
    +s.canciones.map(id=>{const c=C.find(x=>x.id===id);return c?`<div class="mrow"><div class="mn">${titAlb(c)}</div><button class="ic rj" data-srm="${s.id}:${id}" aria-label="Quitar">${ic('x',15)}</button></div>`:''}).join('')
    +`<button class="sec" data-spick="${s.id}">${ic('pls',15)} Canci\u00f3n</button></div>`;
  i.innerHTML=`<div class="ch2"><button class="sec" data-back>${ic('lft',16)} Repertorios</button></div>
    <div class="rhead"><label class="fl2">Nombre del repertorio<input id="rn" value="${esc(rep.nombre||'')}"></label>
    <div class="dos"><label class="fl2">Fecha<input type="date" id="rf" value="${esc(rep.fecha||'')}"></label>
    <div class="fl2"><span id="tl">Tipo</span><div class="seg" role="group" aria-labelledby="tl"><button data-tipo="misa" class="${rep.tipo!=='evento'?'on':''}" aria-pressed="${rep.tipo!=='evento'}">Misa</button><button data-tipo="evento" class="${rep.tipo==='evento'?'on':''}" aria-pressed="${rep.tipo==='evento'}">Evento</button></div></div></div>
    <label class="chk" style="margin:2px 0"><input type="checkbox" id="ra" ${rep.acordes?'checked':''}> Mostrar acordes</label></div>`
    +(rep.tipo==='evento'?`<button data-sadd style="width:100%;margin-top:8px">${ic('pls',16)} A\u00f1adir secci\u00f3n</button>${rep.secciones.map(secs).join('')}`:`<button class="sec" data-alet style="width:100%;margin-top:8px">${ico(SHF)} Elegir toda la misa al azar</button><div class="momentos">${MOM.map(fila).join('')}</div>`);
}
function pder(){
  const h=$('#hoja');if(!h||!rep)return;
  const song=id=>{const c=C.find(x=>x.id===id);return c?cancion(c,rep.acordes):''};
  const hay=id=>C.find(x=>x.id===id);
  const b=(rep.tipo==='evento'
    ?rep.secciones.filter(s=>s.canciones.some(hay)).map(s=>`<div class="blk"><div class="lab">${esc(s.nombre||'Secci\u00f3n')}</div>${s.canciones.map(song).join('')}</div>`)
    :MOM.filter(([id])=>hay(rep.misa[id])).map(([id,n])=>`<div class="blk"><div class="lab">${n}</div>${song(rep.misa[id])}</div>`)).join('')||'<div class="falta">Elige canciones en la columna de la izquierda para ver aqu\u00ed c\u00f3mo quedar\u00e1 la hoja.</div>';
  h.innerHTML=`<h1 class="rt">${esc(rep.nombre||'')}</h1><div class="rf">${esc(fechaLarga(rep.fecha))}</div>${b}`;
}

function imprimir(){
  const t=document.title;
  document.title=(rep.nombre||'Repertorio')+(rep.fecha?' '+rep.fecha:'');
  window.print();
  setTimeout(()=>document.title=t,3000);
}

function clic(e){
  const b=e.target.closest('[data-nuevo],[data-open],[data-del],[data-back],[data-print],[data-full],[data-tipo],[data-alet],[data-pick],[data-rnd],[data-rm],[data-sadd],[data-sdel],[data-spick],[data-srnd],[data-srm]');
  if(!b)return;const d=b.dataset,ok=()=>{guarda();pizq();pder()};
  if(d.nuevo!=null)nuevo();
  else if(d.del){const r=R.find(x=>x.id===d.del);eliminar('repertorios',r,'el repertorio "'+(r.nombre||'')+'"')}
  else if(d.open)abrir(d.open);
  else if(d.back!=null){flush();rep=null;fullMode=false;fullZoom=1;lista()}
  else if(d.print!=null)imprimir();
  else if(d.full!=null){fullMode=!fullMode;editor()}
  else if(d.tipo){rep.tipo=d.tipo;ok()}
  else if(d.alet!=null){
    if(Object.keys(rep.misa).length&&!confirm('Esto reemplaza las canciones elegidas. \u00bfContinuar?'))return;
    const nm={};MOM.forEach(([id])=>{const x=azar(candMom(id),Object.values(nm));if(x)nm[id]=x});rep.misa=nm;ok();
  }
  else if(d.pick)elegir(MOM.find(m=>m[0]===d.pick)[1],candMom(d.pick),id=>{rep.misa[d.pick]=id;ok()});
  else if(d.rnd){const id=azar(candMom(d.rnd),usadas());if(!id)return alert('No hay canciones con esa etiqueta.');rep.misa[d.rnd]=id;ok()}
  else if(d.rm){delete rep.misa[d.rm];ok()}
  else if(d.sadd!=null){rep.secciones.push({id:rand(),nombre:'',tag:'',canciones:[]});ok()}
  else if(d.sdel){rep.secciones=rep.secciones.filter(s=>s.id!==d.sdel);ok()}
  else if(d.spick){const s=sec(d.spick);elegir(s.nombre||'Elegir canci\u00f3n',candSec(s),id=>{if(!s.canciones.includes(id))s.canciones.push(id);ok()})}
  else if(d.srnd){const s=sec(d.srnd),id=azar(candSec(s),usadas());if(!id)return alert('No hay canciones disponibles para esta secci\u00f3n.');s.canciones.push(id);ok()}
  else if(d.srm){const [sid,cid]=d.srm.split(':'),s=sec(sid);s.canciones=s.canciones.filter(x=>x!==cid);ok()}
}

function entra(e){
  const t=e.target;if(!rep)return;
  if(t.id==='rn'){rep.nombre=t.value;guarda();pder()}
  else if(t.id==='rf'){rep.fecha=t.value;guarda();pder()}
  else if(t.id==='ra'&&e.type==='change'){rep.acordes=t.checked;guarda();pder()}
  else if(t.dataset.sn&&e.type==='change'){const s=sec(t.dataset.sn);s.nombre=t.value.trim();const g=T.find(x=>x.nombre.toLowerCase()===s.nombre.toLowerCase());if(g&&!s.tag)s.tag=g.id;guarda();pizq();pder()}
  else if(t.dataset.st&&e.type==='change'){sec(t.dataset.st).tag=t.value;guarda()}
}

function elegir(titulo,cands,cb){
  let todas=false,q='';
  const o=modal('<div id="el2"></div>'),z=$('#el2',o);
  const p=()=>{
    const k=q.toLowerCase(),l=(todas?C:cands).filter(c=>c.titulo.toLowerCase().includes(k)).sort((a,b)=>a.titulo.localeCompare(b.titulo));
    z.innerHTML=`<div class="mh"><h2>${esc(titulo)}</h2><button class="ic" data-cx aria-label="Cerrar">${ic('x')}</button></div><input id="bq" type="search" placeholder="Buscar canci\u00f3n" aria-label="Buscar canci\u00f3n" value="${esc(q)}" style="width:100%" autocomplete="off">`
      +(cands!==C?`<label class="chk"><input type="checkbox" id="vt" ${todas?'checked':''}> Ver todas las canciones</label>`:'')
      +`<div class="lista2">${l.map(c=>`<button class="fila" data-s="${c.id}">${esc(c.titulo)}${alb(c)?`<small>${esc(alb(c))}</small>`:''}</button>`).join('')||'<p class="vac">No hay canciones para elegir.</p>'}</div>`;
  };
  p();
  o.onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.cx!=null)o.remove();else if(b.dataset.s){o.remove();cb(b.dataset.s)}};
  o.oninput=e=>{if(e.target.id==='bq'){q=e.target.value;p();const i=$('#bq',o);i.focus();i.setSelectionRange(999,999)}};
  o.onchange=e=>{if(e.target.id==='vt'){todas=e.target.checked;p()}};
}