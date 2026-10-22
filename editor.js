// =====================================================================
//  EDITOR.JS  ·  El editor de canciones (la hoja con la barra de herramientas)
//
//  Se abre desde la pantalla Canciones con  abrir(cancion, alCerrar).
//  alCerrar es una función que se ejecuta cuando cierras el editor.
//
//  MAPA (usa Ctrl+F para buscar cada parte):
//   ESTILOS ............ colores y tamaños del editor (CSS)
//   Las dos hojas (Letra y Acordes) son documentos libres: se escribe
//   lo que se quiera. Los acordes se distinguen con el botón «Ac».
//   1. HERRAMIENTAS BÁSICAS .. funciones pequeñas de formato
//   2. HISTORIAL ............. Deshacer / Rehacer
//   3. TONALIDAD ............. botón «Tonalidad» y cambio de tono
//   4. LEER Y PEGAR .......... leerDom, limpiaHtml
//   5. FORMATO ............... fmt: negrita, color, tamaño, alineación...
//   6. BUSCAR Y REEMPLAZAR ... buscar
//   7. DIBUJAR LA HOJA ....... hojaHtml, cnt, optsFuente
//   8. ACORDES ............... marcar acordes, transponer, escribir en modo acorde
//   9. DIBUJAR LA BARRA ...... pinta
//  10. EVENTOS ............... clics, teclas, pegar
// =====================================================================
import {$,esc,guardar,crear,modal} from "./base.js";
import {E} from "./estado.js";
import {ix,MAY,MEN,tokensAcorde,nuevaRaiz,usaSostenidos} from "./musica.js";
import {FIJAS,PROPOR,cssFuente,K,OKC,comp,plano,colorOk,CT,CH,svgI,UNDO,REDO,AL_L,AL_C,AL_R,AL_J,IND,OUTD,FIND,BRUSH,MARK} from "./formato.js";

let ed=null;                 // la canción que se está editando (null = ningún editor abierto)
let limpieza=null;           // función para limpiar escuchas al cerrar
let LOCALES=[];              // fuentes instaladas en este equipo (se cargan si el usuario lo pide)
export const editando=()=>ed!==null;   // ¿hay un editor abierto?
export function forzarCierre(){        // cierra el editor sin guardar (por ejemplo al cambiar de pantalla)
  if(limpieza)limpieza();
  document.querySelectorAll('#editor').forEach(x=>x.remove());
  ed=null;
}

// ---------- ESTILOS del editor ----------
const st=document.createElement('style');
st.textContent=`#editor.ed{background:#D3D9E6;padding:0 16px 16px}
.tb{position:sticky;top:0;z-index:3;background:#D3D9E6e8;backdrop-filter:blur(6px);margin:0 -16px;padding:14px 16px 8px;border-bottom:1px solid #c3cadb}
.pg{background:linear-gradient(90deg,#f1f3f8 0,#f1f3f8 34px,#fff 34px);max-width:794px;min-height:1123px;margin:10px auto 40px;padding:48px 56px;box-shadow:0 2px 14px #0003;font-size:18px;line-height:var(--lh,1.35);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,"Courier New",monospace}
@media(max-width:700px){.pg{padding:20px 14px;min-height:80vh}}
.le{outline:none;min-height:400px}.ln{white-space:pre-wrap;min-height:1.35em}
.fl{overflow-x:auto}.fl .ln{white-space:pre}
textarea.ac{display:block;width:100%;box-sizing:border-box;border:0;background:transparent;resize:none;overflow:hidden;white-space:pre;font:inherit;font-weight:700;color:transparent;-webkit-text-fill-color:transparent;caret-color:#333;padding:0;margin:0;line-height:var(--lh,1.35);min-height:1.35em;outline:none;position:relative}
textarea.ac:disabled{opacity:1}textarea.ac::selection{background:#1f6feb44;color:transparent}
.aw{position:relative}.aw .hl{position:absolute;left:0;right:0;top:0;white-space:pre;font:inherit;font-weight:700;color:#b3261e;line-height:var(--lh,1.35);pointer-events:none}
.rib{display:flex;flex-wrap:wrap;gap:4px;align-items:center;margin-bottom:6px}.rib .sp{width:1px;height:24px;background:#9aa3bf;margin:0 4px}
.rib button{padding:6px 9px;min-width:34px}.rib select,.rib input{padding:6px;max-width:170px}.rib .bi{font-family:Georgia,serif}
.rib .cs{width:22px;height:22px;border-radius:5px;border:2px solid #fff;box-shadow:0 0 0 1px #9aa3bf;padding:0;min-width:0}
.rib button.on{background:#1F2A4D;color:#fff;box-shadow:0 0 0 2px #C58A2B}.cnt{margin-left:auto;font-size:12px;color:#4b5575;font-weight:600}
.tb .top{align-items:center;margin-bottom:10px}.tb #ti{flex:1 1 220px;min-width:150px;font-weight:700;font-size:16px}.tb #al{flex:0 1 190px;min-width:0}.tb .et .box{min-width:150px}
.tb .acc{margin-left:auto;display:flex;gap:8px}
@media(max-width:760px){.tb{padding:10px 8px 6px;margin:0 -8px}.tb .top{gap:6px}.tb #al{flex:1 1 140px}.tb .et{flex:1 1 160px}.tb .et .box{min-width:0;width:100%}.tb .acc{width:100%}.tb .acc button{flex:1}
  .rib{flex-wrap:nowrap;overflow-x:auto;padding-bottom:4px;-webkit-overflow-scrolling:touch;scrollbar-width:thin}.gr{flex:none}.tabs .der{margin-left:0;width:100%;justify-content:space-between}#editor.ed{padding:0 8px 8px}}
.gr{display:flex;align-items:center;gap:4px;padding:5px 8px 16px;border:1px solid #B9C1D6;border-radius:var(--r-m);position:relative;background:#E6EAF3}
.gr::after{content:attr(data-g);position:absolute;bottom:1px;left:0;right:0;text-align:center;font-size:10.5px;color:#4b5575;font-weight:700}
.rib{gap:8px}.rib button{padding:3px 7px;min-width:32px;height:32px;min-height:0;border-radius:var(--r-s)}.rib select{padding:3px 6px;height:32px;min-height:0;border-radius:var(--r-s)}.rib input[type=text]{padding:3px 6px;height:32px;min-height:0;border-radius:var(--r-s)}
.dd{position:relative;display:inline-block}.pp{position:absolute;top:100%;left:0;z-index:9;background:#fff;border:1px solid var(--linea);border-radius:var(--r-m);box-shadow:var(--sombra-2);padding:10px;min-width:170px;margin-top:4px}.pp[hidden]{display:none}
.pal{display:grid;grid-template-columns:repeat(6,26px);gap:6px}.rib .pal button{width:26px;height:26px;padding:0;min-width:0;border-radius:6px;border:2px solid #fff;box-shadow:0 0 0 1px #9aa3bf}
.pie{display:flex;gap:6px;margin-top:8px;align-items:center}.mas{display:inline-flex;align-items:center;gap:6px;padding:4px 8px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600}.mas input{width:24px;height:24px;padding:0;border:0;background:none}
.ia{font-weight:800;font-size:14px;line-height:1}.cb{display:block;width:16px;height:4px;border-radius:2px;margin-top:2px}.rib .dd>button{flex-direction:column;gap:0}
.menuAa{display:grid;gap:4px}.menuAa button{justify-content:flex-start}
.tonbox{width:270px}.tr1{display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap}.tinfo{font-size:12px;color:#4b5575;margin:6px 0 4px;font-weight:600}
.keys{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.kq{padding:6px 0;min-width:0;background:#e1e6f2;color:#1F2A4D}.kq.on{background:#1F2A4D;color:#fff}.kq.or{box-shadow:0 0 0 2px #C58A2B}
.tabs{display:flex;align-items:center;gap:6px;margin:6px 0 2px;flex-wrap:wrap}.tabs .der{margin-left:auto;display:flex;align-items:center;gap:8px}.tabs select,.tabs button{height:34px;min-height:0;padding-top:3px;padding-bottom:3px}
.btnk{color:#b3261e;font-size:18px;line-height:1}.on .btnk{color:#fff}
.blq{margin:10px 0}.blq b{color:#b3261e}.it{border-left:4px solid #c58a2b;padding-left:8px}
.et{position:relative;display:inline-flex;gap:4px}.et .box{display:flex;flex-wrap:wrap;gap:4px;align-items:center;border:1px solid #c3cae0;background:#fff;border-radius:10px;padding:6px 8px;min-width:240px}.et .box input{border:0;outline:none;min-width:120px;flex:1;padding:2px;background:transparent}.et .box input::placeholder{color:#1d2233;opacity:1;font-weight:600}
.et .box{padding:3px 34px 3px 8px;min-height:40px}.et .box input{min-height:0;box-shadow:none}
.et #eta{position:absolute;right:3px;top:3px;bottom:3px;width:30px;min-width:0;padding:0;background:transparent;color:#1d2233}
.et #eta:hover{background:#e1e6f2}
.et .lista label{border-radius:8px;cursor:pointer}
.et .lista label:hover{background:#e1e6f2}
.et .lista label:has(input:checked){background:#1F2A4D;color:#fff}
.et:has(.lista:not([hidden])) #eta{background:#1F2A4D;color:#fff}
.et .lista{min-width:240px;position:absolute;top:100%;left:0;background:#fff;box-shadow:0 2px 10px #0003;border-radius:10px;padding:6px;z-index:5;max-height:260px;overflow:auto;white-space:nowrap}.et .lista label{display:block;padding:3px 6px}`;
document.head.append(st);

// ---------- LA FUNCIÓN PRINCIPAL ----------
export function abrir(s,alCerrar){
  const A=E.albumes,T=E.etiquetas;   // listas de álbumes y etiquetas que usa el editor
  ed={titulo:'',tono:'',tonoAct:'',etiquetas:[],acordes:{},ac:null,cc:{},intro:'',interludios:[],final:null,fuente:'',fuenteA:'',lh:0,...structuredClone(s)};
  if(!ed.tonoAct)ed.tonoAct=ed.tono;
  ed.albumId=ed.albumId||A[0]?.id;
  ed.lineas=structuredClone(s.lineas||(s.letra||'').split('\n').map(t=>({r:t?[{t}]:[]}))).map(l=>{
    const z=l.s||Math.max(0,...l.r.map(x=>x.s||0));
    return {...l,r:l.r.map(({s,...x})=>x),...(z?{s:z}:{})}});
  if(!ed.ac){ed.ac={};for(const l in ed.acordes){let f='';[...ed.acordes[l]].sort((a,b)=>a.i-b.i).forEach(a=>{f=f.padEnd(a.i,' ')+(f.length>a.i?' ':'')+a.c});ed.ac[l]=f}}
  let modo='letra',lock=false,verEt=false,eq='',rango=null,modoAcorde=false,pincel=null,zoom=100,plegada=false,popAb=null,uc='#B3261E',uh='#FFF176',ancla=null,inicial='',base='';
  const ov=document.createElement('div');ov.id='editor';ov.className='ed';document.body.append(ov);
  const nom=i=>T.find(t=>t.id===i)?.nombre||'';
  const filtra=()=>T.filter(t=>t.nombre.toLowerCase().includes(eq.toLowerCase()));
  const listaEt=()=>filtra().map(t=>`<label><input type="checkbox" value="${t.id}" ${ed.etiquetas.includes(t.id)?'checked':''}> ${esc(t.nombre)}</label>`).join('')||'<small style="padding:6px;display:block;color:#6b7390">No hay etiquetas con ese nombre</small>';
  const resumen=()=>{const n=ed.etiquetas.map(nom).filter(Boolean);return n.length?(n.length>1?'Varios':n[0]):'Sin etiqueta'};
  const refEt=()=>{const i=$('#eq',ov),l=ov.querySelector('.lista');if(i)i.placeholder=resumen();if(l)l.innerHTML=listaEt()};
  const alterna=(id,on)=>{ed.etiquetas=on?[...new Set([...ed.etiquetas,id])]:ed.etiquetas.filter(x=>x!==id);refEt()};
  // ================= 1. HERRAMIENTAS BÁSICAS =================
  // px, est, pick, exp, fin: funciones pequeñas para leer el formato de cada letra.
  const px=l=>l.s||18;
  const AL=['center','right','justify'],DEFC='#1d2233';
  const est=r=>(r.k?'font-weight:700;color:#b3261e;':'')+(r.b?'font-weight:700;':'')+(r.i?'font-style:italic;':'')+((r.u||r.x)?'text-decoration:'+[r.u&&'underline',r.x&&'line-through'].filter(Boolean).join(' ')+';':'')+(OKC.test(r.c||'')?'color:'+r.c+';':'')+(OKC.test(r.h||'')?'background-color:'+r.h+';':'');
  const pick=r=>{const o={};K.forEach(k=>{if(r[k]!=null)o[k]=r[k]});return o};
  const aChars=l=>l.r.flatMap(r=>[...r.t].map(ch=>({ch,...pick(r)})));   // una línea como lista de letras, cada una con su formato
  const fin=r=>comp(r.flatMap(x=>[...x.t].map(ch=>{const o={ch,...pick(x)};if(o.k&&!/[A-G]/.test(ch))delete o.k;return o})));   // solo las letras A-G pueden ser acorde
  const lineasDe=()=>modo==='letra'?ed.lineas:ed.lineasA;           // las líneas de la hoja que estás viendo
  const ponerLineas=l=>{if(modo==='letra')ed.lineas=l;else ed.lineasA=l};

  // ================= 2. HISTORIAL (Deshacer / Rehacer) =================
  // punto() guarda una «foto» del estado cada vez que algo cambia. Deshacer vuelve a la foto anterior.
  const hist=[],fut=[];
  const snap=()=>JSON.stringify({l:ed.lineas,a:ed.lineasA,t:ed.tonoAct});
  const punto=()=>{leer();const x=snap();if(x!==base){hist.push(base);if(hist.length>80)hist.shift();base=x;fut.length=0}};
  let reloj=null;const programaPunto=()=>{clearTimeout(reloj);reloj=setTimeout(punto,500)};   // guarda la foto medio segundo después de dejar de escribir
  const aplicaH=x=>{const o=JSON.parse(x);ed.lineas=o.l;ed.lineasA=o.a;ed.tonoAct=o.t;pinta()};
  const deshacer=()=>{punto();if(!hist.length)return;fut.push(base);base=hist.pop();aplicaH(base)};
  const rehacer=()=>{punto();if(!fut.length)return;hist.push(base);base=fut.pop();aplicaH(base)};
  const snapFull=()=>JSON.stringify({t:ed.titulo,a:ed.albumId,e:[...ed.etiquetas].sort(),l:ed.lineas,la:ed.lineasA,to:ed.tono,ta:ed.tonoAct,fu:ed.fuente,fa:ed.fuenteA,lh:ed.lh});

  // ================= 3. TONALIDAD =================
  // Solo mayores o solo menores, según el tono original. Transpone los acordes marcados con el botón «Ac».
  const raiz=k=>k.replace(/m$/,''),esMenor=k=>/m$/.test(k),nomTono=(i,m)=>(m?MEN:MAY)[((i%12)+12)%12];  
    const cambiaTono=d=>{
    if(!ed.tono)return;
    const nuevo=nomTono(ix(raiz(ed.tonoAct||ed.tono))+d,esMenor(ed.tono));
    transponer(d,usaSostenidos(nuevo));      // siempre se transponen TODOS los acordes marcados de la hoja
    ed.tonoAct=nuevo;
  };
  const irATono=k=>{const d=ix(raiz(k))-ix(raiz(ed.tonoAct||ed.tono));cambiaTono(((d%12)+12)%12)};
  const refTono=()=>{
    const p=ov.querySelector('.tonbox'),act=ed.tonoAct||ed.tono;
    const b=$('#tonb',ov);if(b)b.innerHTML='Tonalidad'+(act?' \u00b7 <b>'+esc(act)+'</b>':'');
    if(!p)return;
    const sq=l=>l.map(k=>`<button class="fb kq${k===act?' on':''}${k===ed.tono?' or':''}" data-tk="${k}" ${k===ed.tono?'title="Tono original"':''}>${k}</button>`).join('');
    p.innerHTML=ed.tono?`<div class="tr1"><button class="sec fb" data-tt="-2">-1</button><button class="sec fb" data-tt="-1">-\u00bd</button><button class="sec fb" data-tt="1">+\u00bd</button><button class="sec fb" data-tt="2">+1</button></div>
      <div class="tr1"><button class="sec fb" data-tv>Volver al original</button><button class="sec fb" data-tf>Fijar como original</button></div>
      <div class="tinfo">Original: <b>${esc(ed.tono)}</b> \u00b7 Actual: <b>${esc(act)}</b></div><div class="keys">${sq(esMenor(ed.tono)?MEN:MAY)}</div><button class="lnk fb" data-tr>Cambiar tono original</button>`
      :`<div class="tinfo">\u00bfEn qu\u00e9 tono est\u00e1n escritos los acordes?</div><div class="tinfo">Mayores</div><div class="keys">${sq(MAY)}</div><div class="tinfo">Menores</div><div class="keys">${sq(MEN)}</div>`;
  };
  const cierraPop=()=>{if(popAb){popAb=null;ov.querySelectorAll('.pp').forEach(x=>x.hidden=true)}};

  // ================= 4. LEER Y PEGAR =================
  // Convierte lo escrito en la hoja (un <div> por línea) en líneas con formato
  const leerDom=root=>{
    const out=[];let cur=[],L={},vivo=false,base={};
    const fin2=()=>{out.push({r:fin(cur),...(L.s?{s:L.s}:{}),...(L.a?{a:L.a}:{}),...(L.n?{n:L.n}:{})});cur=[];L={...base};vivo=false};
    const w=(n,sty,k)=>{
      if(n.nodeType===3){const t=n.data.replace(/\u00a0/g,' ');if(t){if(!L.s&&k.s)L.s=k.s;cur.push({...sty,t});vivo=true}return}
      if(n.nodeType!==1)return;
      if(n.nodeName==='BR'){fin2();return}
      const q={...sty},cs=n.style,blk=/^(DIV|P)$/.test(n.nodeName),td=cs.textDecoration+cs.textDecorationLine,fw=cs.fontWeight;
      if(/^(B|STRONG)$/.test(n.nodeName)||fw==='bold'||+fw>=600)q.b=1;else if(fw==='normal'||fw==='400')delete q.b;
      if(/^(I|EM)$/.test(n.nodeName)||cs.fontStyle==='italic')q.i=1;else if(cs.fontStyle==='normal')delete q.i;
      if(n.dataset&&n.dataset.k)q.k=1;                       // letra marcada como acorde
      if(n.nodeName==='U'||/underline/.test(td))q.u=1;
      if(/^(S|STRIKE|DEL)$/.test(n.nodeName)||/line-through/.test(td))q.x=1;
      if(/none/.test(td)&&!/underline|line-through/.test(td)){delete q.u;delete q.x}
      if(OKC.test(cs.color)){if(colorOk(cs.color)===DEFC)delete q.c;else q.c=cs.color}
      const bg=cs.backgroundColor;if(bg){if(OKC.test(bg)&&!/,\s*0\)$/.test(bg))q.h=bg;else delete q.h}
      const k2=blk?{s:parseFloat(cs.fontSize)||k.s,a:AL.includes(cs.textAlign)?cs.textAlign:k.a,n:(n.dataset&&+n.dataset.n)||k.n}:{...k,s:parseFloat(cs.fontSize)||k.s};
      const sv=base;
      if(blk){if(vivo)fin2();base=k2;L={...k2}}
      n.childNodes.forEach(c=>w(c,q,k2));
      if(blk){if(vivo)fin2();base=sv;L={...base}}
    };
    w(root,{},{});
    if(vivo||!out.length)fin2();
    while(out.length>1&&!out[out.length-1].r.length)out.pop();
    return out;
  };
  const leer=()=>{const le=$('#le',ov);if(le)ponerLineas(leerDom(le))};   // lee lo que hay en pantalla y lo guarda en la hoja actual

  // Al pegar: conserva negrita, cursiva, subrayado, color, resaltado y tamaño
  const limpiaHtml=html=>{
    const d=new DOMParser().parseFromString(html,'text/html'),out=[];
    const w=(n,st)=>{
      if(n.nodeType===3){const t=n.data.replace(/[\r\n\t]+/g,' ').replace(/\u00a0/g,' ');if(!t)return;if(!t.trim()&&(!out.length||out[out.length-1].br))return;out.push({...st,t});return}
      if(n.nodeType!==1)return;
      const nm=n.nodeName;if(/^(SCRIPT|STYLE|META|LINK|HEAD|TITLE|NOSCRIPT)$/.test(nm))return;
      if(nm==='BR'){out.push({br:1});return}
      const cs=n.style||{},q={...st},td=(cs.textDecoration||'')+(cs.textDecorationLine||''),fw=cs.fontWeight;
      if(/^(B|STRONG)$/.test(nm)||fw==='bold'||+fw>=600)q.b=1;
      if(/^(I|EM)$/.test(nm)||cs.fontStyle==='italic')q.i=1;
      if(n.dataset&&n.dataset.k)q.k=1;
      if(nm==='U'||/underline/.test(td))q.u=1;
      const c=colorOk(cs.color||(n.getAttribute&&n.getAttribute('color')));if(c&&c!=='#000000'&&c!==DEFC)q.c=c;
      const bg=colorOk(cs.backgroundColor);if(bg&&bg!=='#ffffff')q.h=bg;
      const fs=cs.fontSize||'';if(/pt$/.test(fs))q.s=Math.round(parseFloat(fs)*4/3);else if(/px$/.test(fs))q.s=Math.round(parseFloat(fs));
      const blk=/^(DIV|P|LI|H[1-6]|TR|TABLE|UL|OL|BLOCKQUOTE|PRE)$/.test(nm);
      if(blk&&out.length&&!out[out.length-1].br)out.push({br:1});
      n.childNodes.forEach(x=>w(x,q));
      if(blk&&out.length&&!out[out.length-1].br)out.push({br:1});
    };
    w(d.body,{});
    while(out.length&&out[out.length-1].br)out.pop();
    return out.map(x=>x.br?'<br>':`<span ${x.k?'data-k="1" ':''}style="${est(x)}${x.s?'font-size:'+x.s+'px;':''}">${esc(x.t)}</span>`).join('');
  };

  // ================= 5. FORMATO =================
  // fmt(p,v) aplica un formato a lo seleccionado. p dice cuál:
  //   b i u = negrita, cursiva, subrayado     c h = color y resaltado     s = tamaño
  //   a = alineación     n = sangría     case = mayúsculas     k = acorde (botón «Ac»)
  //   undo redo = deshacer y rehacer     clear = borrar formato     pincel = copiar formato
  const hayRango=()=>{const le=$('#le',ov);return !!(rango&&le&&le.contains(rango.commonAncestorContainer))};   // ¿hay texto seleccionado en la hoja?
  function fmt(p,v){fmtInterno(p,v);if(p!=='undo'&&p!=='redo')programaPunto();marcarBotones()}
  function fmtInterno(p,v){
    if(p==='undo')return deshacer();
    if(p==='redo')return rehacer();
    if(p==='k')return botonAcorde();
    if(!hayRango())return;                                  // sin texto seleccionado, los botones no hacen nada
    if(p==='pincel'&&!pincel){
      const e0=rango.startContainer.nodeType===3?rango.startContainer.parentElement:rango.startContainer,cs=getComputedStyle(e0),c=colorOk(cs.color),h=colorOk(cs.backgroundColor);
      pincel={b:+cs.fontWeight>=600,i:cs.fontStyle==='italic',u:/underline/.test(cs.textDecorationLine),c:c&&c!==DEFC?c:'',h:h&&h!=='#ffffff'?h:''};
      const b=$('[data-f="pincel"]',ov);if(b)b.classList.add('on');return}
    const nuevoTam=(cur,p,v)=>p==='s'?v:Math.max(6,Math.min(120,cur+(p==='s+'?2:-2)));
    const mayus=(t,v)=>v==='up'?t.toUpperCase():v==='low'?t.toLowerCase():t.toLowerCase().replace(/(^|[\s\u00bf\u00a1(])(\S)/g,(m,a,b)=>a+b.toUpperCase());
    const le=$('#le',ov);
    punto();                                                // guarda el estado antes de cambiarlo (para poder deshacer)
    const toca=e=>rango.intersectsNode(e)&&!(rango.endOffset===0&&[e,e.firstChild,e.firstChild?.firstChild].includes(rango.endContainer)&&rango.startContainer!==rango.endContainer);
    const lns=()=>[...le.querySelectorAll('.ln')].filter(toca);   // las líneas tocadas por la selección
    if(p==='s'||p==='s+'||p==='s-'){lns().forEach(e=>{e.style.fontSize=nuevoTam(parseFloat(e.style.fontSize)||18,p,v)+'px'});return}
    if(p==='a'){lns().forEach(e=>{e.style.textAlign=v==='left'?'':v});return}
    if(p==='n'){lns().forEach(e=>{const n=Math.max(0,Math.min(8,(+e.dataset.n||0)+ +v));e.dataset.n=n;e.style.paddingLeft=n*28+'px'});return}
    if(p==='case'){
      const tw=document.createTreeWalker(le,NodeFilter.SHOW_TEXT);let n;
      while(n=tw.nextNode()){if(!rango.intersectsNode(n))continue;
        const a=n===rango.startContainer?rango.startOffset:0,b=n===rango.endContainer?rango.endOffset:n.data.length,t=n.data.slice(a,b),u=mayus(t,v);
        if(u.length===t.length)n.data=n.data.slice(0,a)+u+n.data.slice(b)}
      return}
    le.focus();const x=getSelection();x.removeAllRanges();x.addRange(rango);
    document.execCommand('styleWithCSS',false,true);
    const C={b:'bold',i:'italic',u:'underline',clear:'removeFormat'};
    if(p==='pincel'){fmtInterno('clear');['b','i','u'].forEach(k=>pincel[k]&&fmtInterno(k));if(pincel.c)fmtInterno('c',pincel.c);if(pincel.h)fmtInterno('h',pincel.h);pincel=null;const b=$('[data-f="pincel"]',ov);if(b)b.classList.remove('on')}
    else if(C[p])document.execCommand(C[p]);
    else if(p==='c')document.execCommand('foreColor',false,v==='auto'?DEFC:v);
    else if(p==='h')document.execCommand('hiliteColor',false,v==='none'?'transparent':v);
  }

  // ================= 6. BUSCAR Y REEMPLAZAR =================
  function buscar(){
    const o=modal(`<div class="mh"><h2>Buscar y reemplazar</h2><button class="ic" data-cx aria-label="Cerrar">\u00d7</button></div>
      <label class="fl2">Buscar<input id="fb"></label><label class="fl2" style="margin-top:8px">Reemplazar con<input id="fr"></label>
      <label class="chk"><input type="checkbox" id="fm"> Coincidir may\u00fasculas y min\u00fasculas</label>
      <label class="chk"><input type="checkbox" id="fo"> Tambi\u00e9n en la otra hoja</label>
      <div class="barra"><button class="sec" id="fc">Contar</button><button id="fa">Reemplazar todo</button></div><p id="fs" role="status" style="font-weight:600;margin:0"></p>`);
    const re=()=>{const f=$('#fb',o).value;return f?new RegExp(f.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),$('#fm',o).checked?'g':'gi'):null};
    o.onclick=e=>{
      const b=e.target.closest('button');if(!b)return;
      if(b.dataset.cx!=null){o.remove();return}
      const r=re(),fs=$('#fs',o);if(!r){fs.textContent='Escribe qu\u00e9 buscar.';return}
      leer();const ambas=$('#fo',o).checked;
      if(b.id==='fc')fs.textContent=(ambas?[ed.lineas,ed.lineasA]:[lineasDe()]).reduce((n,ls)=>n+ls.reduce((m,l)=>m+(plano(l).match(r)||[]).length,0),0)+' coincidencias';
      else if(b.id==='fa'){
        punto();const rp=$('#fr',o).value;let n=0;
        const cambiar=ls=>ls.map(l=>{
          const t=plano(l),ms=[...t.matchAll(r)];if(!ms.length)return l;n+=ms.length;
          const ar=l.r.flatMap(x=>x.t.split('').map(ch=>({ch,...pick(x)})));
          for(let k=ms.length-1;k>=0;k--){const m=ms[k],base=ar[m.index]?pick(ar[m.index]):{};ar.splice(m.index,m[0].length,...rp.split('').map(ch=>({ch,...base})))}
          return {...l,r:comp(ar)}});
        if(ambas){ed.lineas=cambiar(ed.lineas);ed.lineasA=cambiar(ed.lineasA)}else ponerLineas(cambiar(lineasDe()));
        fs.textContent=n+' reemplazos';pinta();punto();
      }
    };
  }
  async function cargarLocales(){
    if(!window.queryLocalFonts){alert('Tu navegador no permite leer las fuentes instaladas. Usa Chrome o Edge en una computadora.');return pinta()}
    try{const f=await window.queryLocalFonts();LOCALES=[...new Set(f.map(x=>x.family))].sort((a,b)=>a.localeCompare(b))}catch(err){alert('No se dio permiso para leer las fuentes del equipo.')}
    pinta();
  }

  // ================= 2. DIBUJAR LA HOJA =================
  // lineaHtml: dibuja una línea en la pestaña Acordes.
  // hoja: dibuja toda la pestaña Acordes.  letraHtml: dibuja la pestaña Letra.
  // ================= 7. DIBUJAR LA HOJA =================
  // htmlLinea: el contenido de UNA línea. hojaHtml: todas las líneas de la hoja que estás viendo.
  const htmlLinea=l=>l.r.map(r=>`<span ${r.k?'data-k="1" ':''}style="${est(r)}">${esc(r.t)}</span>`).join('')||'<br>';
  const hojaHtml=()=>lineasDe().map(l=>`<div class="ln" data-n="${l.n||0}" style="font-size:${px(l)}px;${l.a?'text-align:'+l.a+';':''}padding-left:${(l.n||0)*28}px">${htmlLinea(l)}</div>`).join('');
  const cnt=()=>{const e=$('#cnt',ov);if(!e)return;const le=$('#le',ov),t=le?le.innerText:lineasDe().map(plano).join('\n'),n=t.trim()?t.trim().split(/\s+/).length:0;e.textContent=n+' palabras \u00b7 '+t.replace(/\n/g,'').length+' caracteres'};
  const optsFuente=()=>{
    const cur=(modo==='letra'?ed.fuente:ed.fuenteA)||'Est\u00e1ndar',op=n=>`<option ${n===cur?'selected':''}>${esc(n)}</option>`;
    const todas=[...Object.keys(FIJAS),...PROPOR,...LOCALES];
    return todas.map(op).join('')+(todas.includes(cur)?'':`<option selected>${esc(cur)}</option>`)
      +(window.queryLocalFonts&&!LOCALES.length?'<option value="__local">Cargar fuentes de este equipo...</option>':'');
  };

  // ================= 8. ACORDES =================
  // Un acorde es una letra A-G con la marca «k». Se ve en negrita y rojo, y es lo único que transpone el botón «Tonalidad».
  // Lo que acompaña a la letra (m, 7, sus, #, b...) queda como texto normal.
  const lineaDe=nodo=>{const el=nodo&&(nodo.nodeType===3?nodo.parentElement:nodo);return el&&el.closest?el.closest('#le .ln'):null};
  const desplazamiento=(ln,nodo,off)=>{const r=document.createRange();r.selectNodeContents(ln);r.setEnd(nodo,off);return r.toString().length};   // cuántas letras hay antes del cursor en la línea
  function ponerCursor(ln,pos){
    const tw=document.createTreeWalker(ln,NodeFilter.SHOW_TEXT);let n,acum=0;
    while(n=tw.nextNode()){
      if(acum+n.data.length>=pos){const r=document.createRange();r.setStart(n,pos-acum);r.collapse(true);const x=getSelection();x.removeAllRanges();x.addRange(r);return}
      acum+=n.data.length;
    }
  }
  // rangosPorLinea: para cada línea tocada por la selección, desde qué letra hasta cuál está seleccionada.
  const rangosPorLinea=lns=>{
    const out=[];
    lns.forEach((ln,i)=>{
      if(!rango.intersectsNode(ln))return;
      const largo=ln.textContent.length;
      const ini=ln.contains(rango.startContainer)?desplazamiento(ln,rango.startContainer,rango.startOffset):0;
      const fi=ln.contains(rango.endContainer)?desplazamiento(ln,rango.endContainer,rango.endOffset):largo;
      if(fi>ini||largo===0)out.push({i,ini,fin:fi});
    });
    return out;
  };

  // Botón «Ac»: con texto seleccionado marca (o desmarca) los acordes; sin selección activa o desactiva el modo «escribir acordes».
  function botonAcorde(){
    if(modo!=='acordes')return;
    if(hayRango()){marcarSeleccion();return}
    modoAcorde=!modoAcorde;
        marcarBotones();
    const le=$('#le',ov);if(le)le.focus();
  }
  // marcarBotones: enciende B, I, U, acorde y alineación según el texto donde está el cursor o la selección.
  // mostrarTam: escribe en la casilla de tamaño el tamaño de la(s) línea(s) donde estás.
  const el0=n=>n&&(n.nodeType===3?n.parentElement:n);
  const tocaR=(r,e)=>r.intersectsNode(e)&&!(r.endOffset===0&&[e,e.firstChild,e.firstChild?.firstChild].includes(r.endContainer)&&r.startContainer!==r.endContainer);
  const formatoEn=el=>{
    const cs=getComputedStyle(el);let u=false;
    for(let n=el;n&&n.nodeType===1&&n.id!=='le';n=n.parentElement){if(/underline/.test(getComputedStyle(n).textDecorationLine)){u=true;break}}
    return {b:+cs.fontWeight>=600&&!el.closest('[data-k]'),i:/italic|oblique/.test(cs.fontStyle),u};
  };
  function mostrarTam(forzar){
    const sz=$('#sz',ov),pg=ov.querySelector('.pg'),le=$('#le',ov);
    if(!sz||!pg||!le||(!forzar&&document.activeElement===sz))return;
    const x=getSelection();let r=null;
    if(x.rangeCount&&pg.contains(x.getRangeAt(0).commonAncestorContainer))r=x.getRangeAt(0);
    else if(hayRango())r=rango;
    if(!r){if(forzar)sz.value='';return}
    const v=[...new Set([...le.querySelectorAll('.ln')].filter(e=>tocaR(r,e)).map(e=>Math.round((parseFloat(e.style.fontSize)||18)*10)/10))];
    if(v.length===1){sz.value=v[0];sz.placeholder=String(v[0])}
    else{sz.value='';sz.placeholder=v.length?'\u2013':'18'}
  }
  const marcarBotones=()=>{
    const pg=ov.querySelector('.pg'),le=$('#le',ov);
    if(!pg||!le)return;
    const x=getSelection(),r=x.rangeCount?x.getRangeAt(0):null,enHoja=!!(r&&le.contains(r.commonAncestorContainer));
    const kb=$('[data-f="k"]',ov);
    if(kb)kb.classList.toggle('on',modoAcorde||(enHoja&&!!el0(r.startContainer).closest('[data-k]')));
    if(enHoja){
      const ini=el0(r.startContainer),ln=ini.closest('.ln'),e={b:false,i:false,u:false};
      if(r.collapsed){
        const f=formatoEn(ini),vivo=document.activeElement===le;
        e.b=vivo?document.queryCommandState('bold')&&!ini.closest('[data-k]'):f.b;
        e.i=vivo?document.queryCommandState('italic'):f.i;
        e.u=vivo?document.queryCommandState('underline'):f.u;
      }else{
        const tw=document.createTreeWalker(le,NodeFilter.SHOW_TEXT);let n,t=0,b=0,i=0,u=0;
        while(n=tw.nextNode()){
          if(!r.intersectsNode(n))continue;
          const a=n===r.startContainer?r.startOffset:0,z=n===r.endContainer?r.endOffset:n.data.length;
          if(z<=a)continue;
          const f=formatoEn(n.parentElement);t++;b+=f.b;i+=f.i;u+=f.u;
        }
        e.b=t>0&&b===t;e.i=t>0&&i===t;e.u=t>0&&u===t;
      }
      const alin=(ln&&ln.style.textAlign)||'left';
      ov.querySelectorAll('.rib [data-f]').forEach(bt=>{
        const f=bt.dataset.f;
        if(f==='b'||f==='i'||f==='u'){bt.classList.toggle('on',e[f]);bt.setAttribute('aria-pressed',String(e[f]))}
        else if(f.startsWith('a:'))bt.classList.toggle('on',f==='a:'+alin);
      });
    }
    mostrarTam();
  };
  function marcarSeleccion(){
    punto();
    const le=$('#le',ov),lns=[...le.querySelectorAll('.ln')],ls=lineasDe();
    if(lns.length!==ls.length)return;
    const trabajo=rangosPorLinea(lns).map(z=>{
      const chars=aChars(ls[z.i]),texto=chars.map(c=>c.ch).join(''),raices=[];
      for(const t of tokensAcorde(texto))if(t.fin>z.ini&&t.ini<z.fin)raices.push(...t.raices);
      return {z,chars,raices};
    });
    const todas=trabajo.flatMap(w=>w.raices.map(i=>w.chars[i]));
    if(!todas.length)return;                                 // no hay nada con forma de acorde en la selección
    const quitar=todas.every(c=>c.k);                        // si ya estaban todos marcados, se desmarcan
    trabajo.forEach(w=>{w.raices.forEach(i=>{if(quitar)delete w.chars[i].k;else w.chars[i].k=1});ls[w.z.i]={...ls[w.z.i],r:comp(w.chars)}});
    const primero=trabajo[0].z.i,ultimo=trabajo[trabajo.length-1].z.i;
    pinta();
    const nuevos=[...$('#le',ov).querySelectorAll('.ln')];selLineas(nuevos[primero],nuevos[ultimo]);   // vuelve a seleccionar las mismas líneas
  }
  // marcarTecleado: en modo «escribir acordes», la letra A-G recién escrita queda como acorde; lo demás, como texto normal.
  function marcarTecleado(e){
    if(e.inputType!=='insertText'||!e.data||e.data.length!==1||modo!=='acordes')return;
    const sel=getSelection();if(!sel.rangeCount||!sel.isCollapsed)return;
    const nodo=sel.anchorNode,off=sel.anchorOffset;
    if(!nodo||nodo.nodeType!==3||off<1)return;
    const ln=lineaDe(nodo);if(!ln)return;
    const deberia=modoAcorde&&/[A-G]/.test(e.data),es=!!nodo.parentElement.closest('[data-k]');
    if(deberia===es)return;                                  // ya está como debe estar
    const pos=desplazamiento(ln,nodo,off),linea=leerDom(ln)[0],chars=aChars(linea),c=chars[pos-1];
    if(!c)return;
    if(deberia)c.k=1;else delete c.k;
    ln.innerHTML=htmlLinea({...linea,r:comp(chars)});
    ponerCursor(ln,pos);
  }
  // transponer(d, parcial): sube o baja d semitonos los acordes marcados. Un # o b pegado a la letra cuenta como parte de la nota.
    // transponer(d, sostenidos): sube o baja d semitonos los acordes marcados. Un # o b pegado a la letra cuenta como parte de la nota.
  // Si el nombre del acorde cambia de largo (E → Eb), ajusta los espacios para que los demás acordes no se muevan.
  const transponer=(d,sostenidos)=>{
    punto();
    lineasDe().forEach((l,i,ls)=>{
      const chars=aChars(l),nuevo=[];let cambio=false,deuda=0;     // deuda: letras de más (+) o de menos (-) por el cambio de nombre
      for(let j=0;j<chars.length;j++){
        const c=chars[j];
        if(c.k&&/[A-G]/.test(c.ch)){
          const sig=chars[j+1],acc=sig&&!sig.k&&(sig.ch==='#'||sig.ch==='b')?sig.ch:'';
          const nom=nuevaRaiz(c.ch,acc,d,sostenidos);
          nuevo.push({...c,ch:nom[0]});
          if(nom[1]){const a={...(acc?sig:c),ch:nom[1]};delete a.k;nuevo.push(a)}   // el # o b nuevo es texto normal
          if(acc)j++;
          deuda+=nom.length-(1+acc.length);cambio=true;
        }
        else if(c.ch===' '&&deuda>0&&chars[j+1]&&chars[j+1].ch===' '){deuda--;cambio=true}     // el acorde creció: quita un espacio
        else if(c.ch===' '&&deuda<0){nuevo.push(c,{...c});deuda++;cambio=true}                // el acorde se achicó: añade un espacio
        else nuevo.push(c);
      }
      if(cambio)ls[i]={...l,r:comp(nuevo)};
    });
    pinta();
  };
  // convertirAcordes: si la canción es de la versión anterior, arma la hoja de Acordes con sus acordes, intro, interludios y final.
  function convertirAcordes(){
    const tiene=(ed.ac&&Object.values(ed.ac).some(x=>String(x).trim()))||(ed.intro&&ed.intro.trim())||(ed.interludios&&ed.interludios.some(x=>(x.texto||'').trim()))||(ed.final&&String(ed.final).trim());
    if(!tiene)return [{r:[]}];
    const cols=ed.cc||{};
    const filas=(texto,clave,etiqueta,extra)=>{
      let acum=0;
      return String(texto||'').split('\n').map((t,n)=>{
        const marcas=new Set();for(const k of tokensAcorde(t))k.raices.forEach(i=>marcas.add(i));
        const chars=(n===0&&etiqueta?[...etiqueta+' '].map(ch=>({ch,b:1})):[]);
        [...t].forEach((ch,i)=>{const o={ch};if(marcas.has(i))o.k=1;const col=(cols[clave]||[])[acum+i];if(col&&OKC.test(col))o.c=col;chars.push(o)});
        acum+=t.length+1;
        return {...extra,r:comp(chars)};
      });
    };
    const out=[],n=ed.lineas.length;
    if(ed.intro&&ed.intro.trim())out.push(...filas(ed.intro,'intro','Intro:',{}));
    ed.lineas.forEach((l,i)=>{
      const extra={...(l.s?{s:l.s}:{}),...(l.n?{n:l.n}:{})};
      if(ed.ac&&ed.ac[i]&&String(ed.ac[i]).trim())out.push(...filas(ed.ac[i],'a'+i,'',extra));
      out.push(JSON.parse(JSON.stringify(l)));
      (ed.interludios||[]).filter(x=>x.despues===i&&(x.texto||'').trim()).forEach(x=>out.push(...filas(x.texto,'i:'+x.id,'Interludio:',{})));
    });
    (ed.interludios||[]).filter(x=>(x.despues<0||x.despues>=n)&&(x.texto||'').trim()).forEach(x=>out.push(...filas(x.texto,'i:'+x.id,'Interludio:',{})));
    if(ed.final&&String(ed.final).trim())out.push(...filas(ed.final,'final','Final:',{}));
    return out.length?out:[{r:[]}];
  }

  // ================= 9. DIBUJAR LA BARRA Y LA HOJA (pinta) =================
  // pinta() vuelve a dibujar todo el editor: fila de arriba, barra de formato, pestañas y hoja.
  // Si quieres cambiar un botón de la barra, búscalo aquí con Ctrl+F.
  const pinta=()=>{
    const fb=(f,h,t)=>`<button class="sec fb" data-f="${f}" title="${t}" aria-label="${t}">${h}</button>`;
    const dd=(n,btn,body)=>`<span class="dd">${btn}<div class="pp" data-pp="${n}" ${popAb===n?'':'hidden'}>${body}</div></span>`;
    const pal=(f,cols)=>`<div class="pal">${cols.map(c=>`<button class="fb" data-f="${f}:${c}" style="background:${c}" title="${c}" aria-label="${c}"></button>`).join('')}</div>`;
    const act=ed.tonoAct||ed.tono,fam=modo==='letra'?ed.fuente:ed.fuenteA;
    ov.innerHTML=`<div class="tb"><div class="barra top"><input id="ti" placeholder="T\u00edtulo de la canci\u00f3n" aria-label="T\u00edtulo de la canci\u00f3n" value="${esc(ed.titulo)}"><select id="al" aria-label="\u00c1lbum" title="\u00c1lbum">${A.map(a=>`<option value="${a.id}" ${a.id===ed.albumId?'selected':''}>${esc(a.nombre)}</option>`).join('')}</select>
        <div class="et"><div class="box"><input id="eq" value="${esc(eq)}" placeholder="${esc(resumen())}" autocomplete="off" aria-label="Buscar etiqueta"></div><button class="sec" id="eta" aria-label="Ver etiquetas">${svgI('<path d="M6 9l6 6 6-6"/>',14)}</button><div class="lista" ${verEt?'':'hidden'}>${listaEt()}</div></div>
        <span class="dd"><button class="sec" id="tonb" data-pop="ton" ${modo==='letra'?'disabled title="La tonalidad se cambia en la pesta\u00f1a Acordes"':''}>Tonalidad${act?' \u00b7 <b>'+esc(act)+'</b>':''}</button><div class="pp tonbox" data-pp="ton" ${popAb==='ton'?'':'hidden'}></div></span>
        <span class="acc"><button class="sec" id="no">Cancelar</button><button id="ok">Guardar canci\u00f3n</button></span></div>
      <div class="rib" ${plegada?'hidden':''}>
        <div class="gr" data-g="Texto"><select id="ff" title="Tipo de letra">${optsFuente()}</select><input type="text" id="sz" list="tams" placeholder="18" title="Tama\u00f1o de la l\u00ednea" style="flex:none;min-width:0;width:50px;text-align:center"><datalist id="tams">${[8,10,12,14,16,18,20,22,24,28,32,36,40,48,60].map(n=>`<option value="${n}">`).join('')}</datalist>${fb('s-','A\u2212','Reducir tama\u00f1o (Ctrl+Mays+&lt;)')}${fb('s+','A+','Aumentar tama\u00f1o (Ctrl+Mays+&gt;)')}
          ${fb('b','<b>B</b>','Negrita (Ctrl+B)')}${fb('i','<i class="bi">I</i>','Cursiva (Ctrl+I)')}${fb('u','<u>U</u>','Subrayado (Ctrl+U)')}
          <button class="sec fb${modoAcorde?' on':''}" data-f="k" title="Acorde: marca los acordes de lo seleccionado. Sin selecci\u00f3n, act\u00edvalo para escribir acordes" aria-label="Acorde" ${modo==='letra'?'disabled':''}><b class="btnk">\u266A</b></button>
          ${dd('c',`<button class="sec fb" data-pop="c" title="Color de texto" aria-label="Color de texto"><span class="ia">A</span><span class="cb" style="background:${uc}"></span></button>`,pal('c',CT)+`<div class="pie"><button class="sec fb" data-f="c:auto">Autom\u00e1tico</button><label class="sec mas">M\u00e1s colores<input type="color" id="co" value="${uc}"></label></div>`)}
          ${dd('h',`<button class="sec fb" data-pop="h" title="Resaltar texto" aria-label="Resaltar texto">${svgI(MARK,15)}<span class="cb" style="background:${uh}"></span></button>`,pal('h',CH)+`<div class="pie"><button class="sec fb" data-f="h:none">Sin resaltado</button><label class="sec mas">M\u00e1s colores<input type="color" id="ch" value="${uh}"></label></div>`)}</div>
        <div class="gr" data-g="P\u00e1rrafo">${fb('a:left',svgI(AL_L,16),'Alinear a la izquierda')}${fb('a:center',svgI(AL_C,16),'Centrar')}${fb('a:right',svgI(AL_R,16),'Alinear a la derecha')}${fb('a:justify',svgI(AL_J,16),'Justificar')}
          ${fb('n:-1',svgI(OUTD,16),'Reducir sangr\u00eda')}${fb('n:1',svgI(IND,16),'Aumentar sangr\u00eda')}
          <select id="lh" title="Interlineado">${[1,1.15,1.35,1.5,2].map(n=>`<option value="${n}" ${n===(ed.lh||1.35)?'selected':''}>${n}</option>`).join('')}</select>
          ${dd('aa',`<button class="sec fb" data-pop="aa" title="May\u00fasculas y min\u00fasculas">Aa</button>`,`<div class="menuAa"><button class="sec fb" data-f="case:up">MAY\u00daSCULAS</button><button class="sec fb" data-f="case:low">min\u00fasculas</button><button class="sec fb" data-f="case:cap">Cada Palabra</button></div>`)}</div>
        <div class="gr" data-g="Herramientas">${fb('undo',svgI(UNDO,16),'Deshacer (Ctrl+Z)')}${fb('redo',svgI(REDO,16),'Rehacer (Ctrl+Y)')}${fb('pincel',svgI(BRUSH,16),'Copiar formato (selecciona, pulsa, selecciona otro y vuelve a pulsar)')}${fb('clear','T<sub>x</sub>','Borrar formato')}<button class="sec" data-bus title="Buscar y reemplazar">${svgI(FIND,16)} Buscar</button></div></div>
      <div class="tabs" role="tablist" aria-label="Hoja"><button class="${modo==='letra'?'':'sec'}" id="ml" role="tab" aria-selected="${modo==='letra'}">Letra</button><button class="${modo==='acordes'?'':'sec'}" id="ma" role="tab" aria-selected="${modo==='acordes'}">Acordes</button>
        <span class="der"><select id="zm" title="Zoom de la hoja">${[50,75,100,125,150,200].map(n=>`<option value="${n}" ${n===zoom?'selected':''}>${n}%</option>`).join('')}</select><span id="cnt" class="cnt"></span><button class="sec" data-plegar title="Mostrar u ocultar la barra de formato" aria-label="Mostrar u ocultar la barra de formato">${plegada?'\u25BC':'\u25B2'}</button></span></div></div>
      <div class="pg" style="--lh:${ed.lh||1.35};zoom:${zoom/100};${cssFuente(fam)?'font-family:'+esc(cssFuente(fam))+';':''}"><div id="le" class="le" contenteditable="true" spellcheck="false" role="textbox" aria-multiline="true" aria-label="${modo==='letra'?'Letra':'Acordes'} de la canci\u00f3n">${hojaHtml()}</div></div>`;
    cnt();refTono();marcarBotones();
  };

  // ================= 10. EVENTOS (qué pasa cuando haces algo) =================
  const sc=()=>{                                            // recuerda qué texto está seleccionado
    const x=getSelection();if(!x.rangeCount)return;const r=x.getRangeAt(0);
    if(!ov.querySelector('.pg')?.contains(r.commonAncestorContainer))return;
    rango=x.isCollapsed?null:r.cloneRange();
        marcarBotones();
  };
  document.addEventListener('selectionchange',sc);
  limpieza=()=>document.removeEventListener('selectionchange',sc);
  const cerrar=()=>{document.removeEventListener('selectionchange',sc);ed=null;ov.remove();if(alCerrar)alCerrar()};

  ov.onmousedown=e=>{if(e.target.closest('.fb'))e.preventDefault()};   // los botones no le quitan la selección al texto
  ov.onfocusin=e=>{if(e.target.id==='eq'){verEt=true;const l=ov.querySelector('.lista');if(l)l.hidden=false}
    else if(e.target.id==='sz'){const z=e.target;if(z.value){z.placeholder=z.value;z.value=''}}
    else if(e.target.id==='le')marcarBotones()};
  ov.addEventListener('focusout',e=>{if(e.target.id==='sz')setTimeout(()=>mostrarTam(true),0)});
  ov.addEventListener('keyup',e=>{if(e.target.id==='le')marcarBotones()});
  ov.oninput=e=>{const t=e.target;
    if(t.id==='le'){marcarTecleado(e);cnt();programaPunto();marcarBotones();return}
    if(t.id==='eq'){eq=t.value;verEt=true;const l=ov.querySelector('.lista');l.hidden=false;l.innerHTML=listaEt();return}
    if(t.id==='ti')ed.titulo=t.value;
  };
  // Clic en el margen izquierdo de la hoja: selecciona la línea (y arrastrando, varias)
  const lineaEn=y=>{const r=ov.querySelector('.pg').getBoundingClientRect(),el=document.elementFromPoint(r.left+r.width/2,y);return el?(el.closest('.ln')||null):null};
  const selLineas=(a,b)=>{
    const ls=[...ov.querySelectorAll('.pg .ln')];let i=ls.indexOf(a),j=ls.indexOf(b);if(i<0||j<0)return;if(i>j)[i,j]=[j,i];
    const r=document.createRange();r.setStart(ls[i],0);r.setEnd(ls[j],ls[j].childNodes.length);const x=getSelection();x.removeAllRanges();x.addRange(r)};
  ov.addEventListener('mousedown',e=>{
    const pg=e.target.closest('.pg');if(!pg||e.target.closest('textarea,input'))return;
    if(e.clientX-pg.getBoundingClientRect().left>34*zoom/100)return;
    const ln=lineaEn(e.clientY);if(!ln)return;e.preventDefault();ancla=ln;selLineas(ln,ln)});
  ov.addEventListener('mousemove',e=>{if(ancla&&e.buttons===1){const ln=lineaEn(e.clientY);if(ln)selLineas(ancla,ln)}});
  ov.addEventListener('mouseup',()=>{ancla=null;setTimeout(marcarBotones,0)});
  ov.onchange=e=>{const t=e.target;leer();
    if(t.id==='al')ed.albumId=t.value;
    else if(t.closest('.lista'))alterna(t.value,t.checked);
    else if(t.id==='co'){uc=t.value;fmt('c',t.value);cierraPop()}
    else if(t.id==='ch'){uh=t.value;fmt('h',t.value);cierraPop()}
    else if(t.id==='sz'){const n=parseFloat(t.value);if(n>=6&&n<=120)fmt('s',n);mostrarTam(true)}
    else if(t.id==='lh'){ed.lh=+t.value;ov.querySelector('.pg').style.setProperty('--lh',ed.lh||1.35)}
    else if(t.id==='zm'){zoom=+t.value;ov.querySelector('.pg').style.zoom=zoom/100}
    else if(t.id==='ff'){
      if(t.value==='__local')return cargarLocales();
      const v=t.value==='Est\u00e1ndar'?'':t.value;
      if(modo==='letra')ed.fuente=v;else ed.fuenteA=v;
      ov.querySelector('.pg').style.fontFamily=cssFuente(v)}};
  ov.onkeydown=e=>{
    const k=e.key.toLowerCase(),ctl=e.ctrlKey||e.metaKey,enHoja=!e.target.matches('input,select,textarea');
    if(ctl&&!e.shiftKey&&/^[biu]$/.test(k)){e.preventDefault();fmt(k)}
    else if(ctl&&enHoja&&k==='z'&&!e.shiftKey){e.preventDefault();deshacer()}
    else if(ctl&&enHoja&&(k==='y'||(k==='z'&&e.shiftKey))){e.preventDefault();rehacer()}
    else if(ctl&&e.shiftKey&&(e.key==='>'||e.key==='.')){e.preventDefault();fmt('s+')}
    else if(ctl&&e.shiftKey&&(e.key==='<'||e.key===',')){e.preventDefault();fmt('s-')}
    else if(e.key==='Tab'&&e.target.id==='le'){e.preventDefault();document.execCommand('insertText',false,'    ')}
    else if(e.key==='Enter'&&e.target.id==='eq'){e.preventDefault();const f=filtra()[0];if(f){alterna(f.id,!ed.etiquetas.includes(f.id));eq='';e.target.value='';refEt()}}};
  ov.addEventListener('paste',e=>{
    if(!e.target.closest('#le'))return;e.preventDefault();
    const cd=e.clipboardData,h=cd.getData('text/html'),r=h?limpiaHtml(h):'';
    document.execCommand('insertHTML',false,r||esc(cd.getData('text/plain')).replace(/\r?\n/g,'<br>'));
    programaPunto()});
  ov.onclick=e=>{
    const tg=e.target;
    if(tg.closest('.et')){
      if(tg.closest('#eta')){verEt=!verEt;ov.querySelector('.lista').hidden=!verEt}
      return}
    const pb=tg.closest('[data-pop]');
    if(pb){popAb=popAb===pb.dataset.pop?null:pb.dataset.pop;ov.querySelectorAll('.pp').forEach(x=>x.hidden=x.dataset.pp!==popAb);if(popAb==='ton')refTono();return}
    if(!tg.closest('.pp'))cierraPop();
    if(verEt){verEt=false;ov.querySelector('.lista').hidden=true;eq='';const i=$('#eq',ov);if(i)i.value='';refEt()}
    const t=tg.closest('[id],[data-f],[data-bus],[data-tt],[data-tv],[data-tf],[data-tr],[data-tk],[data-plegar]')||tg,d=t.dataset;leer();
    if(t.id==='ok'){
      if(!ed.titulo.trim())return alert('Escribe un t\u00edtulo.');
      ed.letra=ed.lineas.map(plano).join('\n');
      const {id,acordes,...x}=ed;id?guardar('canciones',id,x,false):crear('canciones',x);cerrar();return}
    if(t.id==='no'){if(snapFull()!==inicial&&!confirm('\u00bfDescartar los cambios?'))return;return cerrar()}
    if(d.tt!=null){cambiaTono(+d.tt);return}
        if(d.tv!=null){if(ed.tono){const dd=ix(raiz(ed.tono))-ix(raiz(ed.tonoAct||ed.tono));cambiaTono(((dd%12)+12)%12);ed.tonoAct=ed.tono;pinta()}return}
    if(d.tf!=null){ed.tono=ed.tonoAct||ed.tono;refTono();return}
    if(d.tr!=null){ed.tono='';ed.tonoAct='';refTono();return}
    if(d.tk!=null){if(!ed.tono){ed.tono=ed.tonoAct=d.tk;refTono()}else irATono(d.tk);return}
    if(d.plegar!=null){plegada=!plegada;ov.querySelector('.rib').hidden=plegada;t.textContent=plegada?'\u25BC':'\u25B2';return}
    if(d.f){const [p,...r]=d.f.split(':'),v=r.join(':');
      if(p==='c'&&v!=='auto'){uc=v;ov.querySelectorAll('[data-pop="c"] .cb').forEach(x=>x.style.background=uc)}
      if(p==='h'&&v!=='none'){uh=v;ov.querySelectorAll('[data-pop="h"] .cb').forEach(x=>x.style.background=uh)}
      cierraPop();return fmt(p,v)}
    else if(d.bus!=null)return buscar();
    else if(t.id==='ml'||t.id==='ma'){modo=t.id==='ml'?'letra':'acordes';modoAcorde=false}
    else return;
    pinta();
  };
  if(!ed.lineasA)ed.lineasA=convertirAcordes();              // canciones de la versión anterior: se arma la hoja de Acordes
  pinta();leer();inicial=snapFull();base=snap();
}
