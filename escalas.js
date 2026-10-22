// ===== PANTALLA: ESCALAS (personas, equipos por día, modo edición) =====
import {$,esc,guardar,crear,escuchar,eliminar,vistas,ic,modal} from "./base.js";

const st=document.createElement('style');
st.textContent=`.c2{background:#fff;border-radius:18px;padding:22px;box-shadow:0 2px 12px #1f2a4d14;margin-bottom:20px}
.ch2{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:12px}.ch2 h2{margin:0}
.pgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px}
.per{display:flex;align-items:center;gap:10px;background:#f7f8fc;border-radius:12px;padding:10px}.per small{display:block;color:#6b7390}
.av{width:38px;height:38px;border-radius:50%;background:#1F2A4D;color:#fff;display:grid;place-items:center;font-weight:700;font-size:13px;flex:none}
.vac{color:#6b7390;margin:0}.dia{background:#f7f8fc;border-radius:14px;padding:14px;margin-top:14px}
.dh{display:flex;align-items:center;gap:8px;margin-bottom:10px}.dh h3{margin:0;flex:1}.dh .inl{flex:1}
.inl{font-weight:700;border:1px dashed #1F2A4D;border-radius:8px;padding:6px 8px;min-width:0;background:#fff}
.eq{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px}
.tm{background:#fff;border-radius:12px;padding:10px;position:relative}.th{display:flex;align-items:center;gap:6px;margin-bottom:6px;min-height:30px}
.mem{width:100%;min-height:64px;background:#f7f8fc;color:#1d2233;border-radius:10px;padding:8px;display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start;gap:4px;text-align:left;font-weight:600;border:none;cursor:pointer}
.mem em{color:#6b7390;font-weight:500;font-style:normal}
.mrow{display:grid;grid-template-columns:1fr auto;width:100%;gap:12px;align-items:center}
.mrow small{color:#6b7390;font-weight:500;text-align:right}
.pop{position:absolute;left:8px;right:8px;top:100%;z-index:6;background:#fff;border-radius:12px;box-shadow:0 8px 28px #0004;padding:8px;display:grid;gap:2px;max-height:280px;overflow:auto}
.pop label{display:flex;gap:8px;align-items:center;padding:6px;border-radius:8px;cursor:pointer}.pop label:hover{background:#f7f8fc}.pop small{color:#6b7390}
.barra{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
.barra input{flex:1;min-width:120px}
.fp{display:flex;gap:6px;flex-wrap:wrap;background:#f7f8fc;padding:8px;border-radius:10px;margin-bottom:8px}
.fp input{flex:1;min-width:110px}
.fp button{flex:none}`;
document.head.append(st);

let P=[],X=[],el=null,edit=false,abre=null,man=null;

const equipos=()=>['A','B','C','D'].map(x=>({nombre:'Equipo '+x,miembros:[]}));
const ini=n=>(n||'').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();

// Ordenar personas dando prioridad a "Voz"
const ordenarPersonas=(arr)=>{
  return [...arr].sort((a,b)=>{
    const ocA=(a.ocupacion||'').trim().toLowerCase();
    const ocB=(b.ocupacion||'').trim().toLowerCase();

    const aEsVoz=ocA.includes('voz');
    const bEsVoz=ocB.includes('voz');

    if(aEsVoz && !bEsVoz) return -1;
    if(!aEsVoz && bEsVoz) return 1;

    if(ocA!==ocB) return ocA.localeCompare(ocB);
    return a.nombre.localeCompare(b.nombre);
  });
};

// Ordenar los miembros de un equipo (Voz primero)
const ordenarMiembros=(miembrosIds)=>{
  return [...miembrosIds].sort((idA,idB)=>{
    const pA=P.find(x=>x.id===idA)||{};
    const pB=P.find(x=>x.id===idB)||{};
    const ocA=(pA.ocupacion||'').trim().toLowerCase();
    const ocB=(pB.ocupacion||'').trim().toLowerCase();

    const aEsVoz=ocA.includes('voz');
    const bEsVoz=ocB.includes('voz');

    if(aEsVoz && !bEsVoz) return -1;
    if(!aEsVoz && bEsVoz) return 1;

    if(ocA!==ocB) return ocA.localeCompare(ocB);
    return (pA.nombre||'').localeCompare(pB.nombre||'');
  });
};

escuchar('personas',l=>{
  P=ordenarPersonas(l);
  pintar();
  pMan();
});

escuchar('escalas',l=>{
  X=l.sort((a,b)=>(a.orden||0)-(b.orden||0));
  if(!l.length)[['sabado','S\u00e1bado'],['domingo','Domingo']].forEach(([id,n],o)=>guardar('escalas',id,{nombre:n,orden:o,equipos:equipos()}));
  pintar();
});

vistas.escalas=e=>{el=e;edit=false;abre=null;el.onclick=clic;el.onchange=cambia;pintar()};
addEventListener('hashchange',()=>{if(location.hash!=='#escalas')el=null});

function pintar(){
  if(!el)return;

  const popPrev=el.querySelector('.pop');
  const scrollTop=popPrev?popPrev.scrollTop:0;

  const dias=X.map(d=>`<div class="dia"><div class="dh">${edit?`<input class="inl" data-dn="${d.id}" value="${esc(d.nombre)}">`:`<h3>${esc(d.nombre)}</h3>`}`
    +(edit?`<button class="sec" data-ea="${d.id}">${ic('pls',15)} Equipo</button><button class="ic rj" data-dx="${d.id}" aria-label="Eliminar d\u00eda">${ic('trs',16)}</button>`:'')+'</div><div class="eq">'
    +d.equipos.map((q,i)=>{
      const k=d.id+':'+i;
      const miembrosOrdenados=ordenarMiembros(q.miembros);
      return `<div class="tm"><div class="th">${edit?`<input class="inl" data-en="${k}" value="${esc(q.nombre)}"><button class="ic rj" data-ex="${k}" aria-label="Eliminar equipo">${ic('trs',15)}</button>`:`<b>${esc(q.nombre)}</b>`}</div>`
        +`<button class="mem" data-el="${k}">${miembrosOrdenados.map(m=>{const p=P.find(x=>x.id===m);return p?`<span class="mrow"><span>${esc(p.nombre)}</span><small>${esc(p.ocupacion||'')}</small></span>`:''}).join('')||'<em>Toca para elegir</em>'}</button>`
        +(abre===k?`<div class="pop">${P.map(p=>`<label><input type="checkbox" data-pk="${k}" value="${p.id}" ${q.miembros.includes(p.id)?'checked':''}> ${esc(p.nombre)} <small>${esc(p.ocupacion||'')}</small></label>`).join('')||'<p class="vac">Primero a\u00f1ade personas.</p>'}<button class="sec" data-cl style="margin-top:4px;">Listo</button></div>`:'')+'</div>';
    }).join('')+'</div></div>').join('');

  // Secciones ordenadas: Personas ARRIBA, Escalas por d\u00eda ABAJO
  el.innerHTML=`<section class="c2"><div class="ch2"><h2>Escalas</h2><div class="mb"><button id="da">${ic('pls',16)} A\u00f1adir d\u00eda</button><button class="${edit?'':'sec'}" id="ed">${edit?'Listo':ic('edt',16)+' Editar'}</button></div></div>${dias}</section>`
  +`</div></section>`
  +`<section class="c2"><div class="ch2"><h2>Personas</h2><button class="sec" id="gp">${ic('edt',16)} Gestionar</button></div><div class="pgrid">`
    +(P.map(p=>`<div class="per"><span class="av">${esc(ini(p.nombre))}</span><div><b>${esc(p.nombre)}</b><small>${esc(p.ocupacion||'')}</small></div></div>`).join('')||'<p class="vac">A\u00fan no hay personas. Pulsa Gestionar para a\u00f1adirlas.</p>')

  const popNew=el.querySelector('.pop');
  if(popNew&&scrollTop)popNew.scrollTop=scrollTop;
}

function clic(e){
  const t=e.target.closest('button,[data-el]');
  if(abre&&!e.target.closest('.tm')){abre=null;pintar()}
  if(!t)return;const d=t.dataset,dia=id=>X.find(x=>x.id===id);
  if(t.id==='gp')gestionar();
  else if(t.id==='ed'){edit=!edit;abre=null;pintar()}
  else if(t.id==='da'){const n=prompt('Nombre del d\u00eda (ej: Viernes)');if(n&&n.trim())crear('escalas',{nombre:n.trim(),orden:X.length,equipos:equipos()})}
  else if(d.ea){const x=dia(d.ea),n=prompt('Nombre del equipo','Equipo '+String.fromCharCode(65+x.equipos.length));if(n&&n.trim())guardar('escalas',x.id,{equipos:[...x.equipos,{nombre:n.trim(),miembros:[]}]})}
  else if(d.dx){const x=dia(d.dx);eliminar('escalas',x,'el d\u00eda "'+x.nombre+'"')}
  else if(d.ex){const [id,i]=d.ex.split(':'),x=dia(id);if(confirm('\u00bfEliminar el equipo "'+x.equipos[i].nombre+'"?'))guardar('escalas',id,{equipos:x.equipos.filter((_,k)=>k!=i)})}
  else if(d.el!=null){abre=abre===d.el?null:d.el;pintar()}
  else if(d.cl!=null){abre=null;pintar()}
}

function cambia(e){
  const t=e.target,d=t.dataset,v=t.value.trim();
  if(d.dn){if(v)guardar('escalas',d.dn,{nombre:v});else pintar()}
  else if(d.en){const [id,i]=d.en.split(':'),targetDia=X.find(x=>x.id===id);if(!targetDia)return;const eq=structuredClone(targetDia.equipos);if(v){eq[i].nombre=v;guardar('escalas',id,{equipos:eq})}else pintar()}
  else if(d.pk){
    const [id,i]=d.pk.split(':'),targetDia=X.find(x=>x.id===id);
    if(!targetDia)return;
    const eq=structuredClone(targetDia.equipos);
    const seleccionados=[...t.closest('.pop').querySelectorAll('input:checked')].map(c=>c.value);
    eq[i].miembros=ordenarMiembros(seleccionados);
    guardar('escalas',id,{equipos:eq});
  }
}

// Mini ventana para añadir, editar y eliminar personas
function gestionar(){
  man=modal(`<div class="mh"><h2>Personas</h2><button class="ic" data-cx aria-label="Cerrar">${ic('x')}</button></div>
    <form id="fadd" class="barra" onsubmit="return false;">
      <input id="mn" placeholder="Nombre" required>
      <input id="mo2" placeholder="Ocupaci\u00f3n (Voz, Guitarra...)">
      <button id="ma" type="submit">${ic('pls',16)} A\u00f1adir</button>
    </form><div id="lp"></div>`);
  pMan();

  const addPersona=()=>{
    const n=$('#mn',man).value.trim();
    if(!n)return alert('Escribe un nombre.');
    crear('personas',{nombre:n,ocupacion:$('#mo2',man).value.trim()});
    $('#mn',man).value='';$('#mo2',man).value='';
    $('#mn',man).focus();
  };

  const form=$('#fadd',man);
  if(form)form.onsubmit=addPersona;

  man.onclick=e=>{
    const t=e.target.closest('button');if(!t)return;
    if(t.dataset.cx!=null)man.remove();
    else if(t.id==='ma')addPersona();
    else if(t.dataset.px){const p=P.find(x=>x.id===t.dataset.px);if(p)eliminar('personas',p,'a "'+p.nombre+'"')}
  };
  man.onchange=e=>{
    const t=e.target,d=t.dataset;
    if(d.pn){if(t.value.trim())guardar('personas',d.pn,{nombre:t.value.trim()});else pMan()}
    else if(d.po)guardar('personas',d.po,{ocupacion:t.value.trim()});
  };
}

function pMan(){
  if(!man||!man.isConnected)return;
  $('#lp',man).innerHTML=P.map(p=>`<div class="fp"><input data-pn="${p.id}" value="${esc(p.nombre)}" aria-label="Nombre"><input data-po="${p.id}" value="${esc(p.ocupacion||'')}" placeholder="Ocupaci\u00f3n" aria-label="Ocupaci\u00f3n"><button class="ic rj" data-px="${p.id}" aria-label="Eliminar">${ic('trs',15)}</button></div>`).join('')||'<p class="vac">Sin personas todav\u00eda.</p>';
}