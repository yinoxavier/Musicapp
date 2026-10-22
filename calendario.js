// ===== PANTALLA: CALENDARIO (mes + panel de detalles del día) =====
import {$,esc,guardar,crear,escuchar,eliminar,vistas,ic} from "./base.js";

const st=document.createElement('style');
st.textContent=`.cols{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:24px;align-items:start}
.chd{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;gap:8px}.mt{margin:0;font-size:clamp(24px,3vw,30px)}
.mt::first-letter{text-transform:uppercase}
.bt{display:flex;gap:6px}.bt .w{width:auto;padding:0 14px}
.cal{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px}
.cal .w{text-align:center;font-size:12.5px;font-weight:700;color:var(--gris);padding:4px 0 6px}
.cal .d{background:var(--capa);color:var(--tx);border-radius:var(--r-m);min-height:96px;min-width:0;padding:7px;display:flex;flex-direction:column;align-items:stretch;justify-content:flex-start;gap:3px;border:2px solid transparent;text-align:left;font-weight:500;overflow:hidden}
.cal .d:hover{filter:none;border-color:var(--linea-2)}.cal .d b{font-size:13px;align-self:flex-start;min-width:24px;height:24px;display:grid;place-items:center;border-radius:999px;padding:0 6px;margin:-2px 0 2px -2px}
.cal .d.hoy b{background:var(--oro);color:var(--azul)}
.cal .d.sel{border-color:var(--azul);background:var(--blanco);box-shadow:var(--sombra-2)}
.cal .p{font-size:11px;font-weight:700;color:#fff;border-radius:6px;padding:2px 6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;line-height:1.5}
.cal .p.rep{background:var(--suave);color:var(--azul);display:flex;align-items:center;gap:4px}.cal small{color:var(--gris);font-size:11px;font-weight:600}
.pan{display:flex;flex-direction:column;gap:14px;position:sticky;top:86px}
.pan .fecha h2{margin:0;font-size:26px;display:flex;align-items:center;gap:10px}.pan .fecha small{color:var(--gris);font-weight:600}
.hoyb{background:var(--oro);color:var(--azul);font-family:var(--fuente);font-size:12px;font-weight:800;border-radius:20px;padding:3px 10px}
.ev{display:flex;gap:12px;align-items:center;background:var(--capa);border-radius:var(--r-m);padding:12px}
.ev .bar{width:5px;align-self:stretch;border-radius:3px;flex:none}.ev .t{flex:1;min-width:0}.ev .hora{color:var(--gris);font-weight:600;font-size:13.5px;margin-left:4px}.ev small{color:var(--gris);display:block;overflow-wrap:anywhere}
.ev.rp{background:var(--suave)}
.sw{width:30px;height:30px;min-height:0;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 1px var(--linea-2);padding:0}
.sw:hover{filter:none;transform:scale(1.08)}
.sw.on{box-shadow:0 0 0 2px var(--azul)}
.resaltar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:13.5px;font-weight:700;color:var(--gris)}
.colores{display:flex;gap:7px;flex-wrap:wrap}
.pan .linea{height:1px;background:var(--linea);margin:2px 0}
.fev{display:grid;gap:12px;background:var(--capa);border-radius:var(--r-m);padding:14px}
.fev .dos{display:grid;grid-template-columns:minmax(0,1fr) 116px;gap:10px}.fev input,.fev textarea{width:100%}
.fev .pie{display:flex;justify-content:flex-end;gap:8px}
@media(max-width:900px){.cols{grid-template-columns:minmax(0,1fr)}.pan{position:static}}
@media(max-width:600px){.cal{gap:3px}.cal .d{min-height:54px;padding:4px;border-radius:9px;gap:2px}.cal .d b{font-size:12px;min-width:22px;height:22px;margin:0}
  .cal .p{height:5px;padding:0;font-size:0;border-radius:3px}.cal .p.rep{background:var(--azul)}.cal .p.rep svg{display:none}.cal small{font-size:10px;line-height:1}.cal .w{font-size:11px}}`;
document.head.append(st);

const COL=['#1F6FEB','#2E7D32','#7B1FA2','#D9822B','#B3261E','#757575'];
const NCOL={'#1F6FEB':'Azul','#2E7D32':'Verde','#7B1FA2':'Morado','#D9822B':'Naranja','#B3261E':'Rojo','#757575':'Gris'};
const MES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const DIA=['Domingo','Lunes','Martes','Mi\u00e9rcoles','Jueves','Viernes','S\u00e1bado'],DCORTO=['Dom','Lun','Mar','Mi\u00e9','Jue','Vie','S\u00e1b'];
const dos=n=>String(n).padStart(2,'0'),ymd=d=>d.getFullYear()+'-'+dos(d.getMonth()+1)+'-'+dos(d.getDate());
let E=[],D=[],R=[],el=null,mes=new Date(),sel=ymd(new Date()),form=null;
mes.setDate(1);
const pill=e=>`<span class="p" style="background:${e.color}" aria-hidden="true">${esc(e.titulo)}</span>`;

escuchar('eventos',l=>{E=l;pCal();if(!form)pPan()});
escuchar('dias',l=>{D=l;pCal();if(!form)pPan()});
escuchar('repertorios',l=>{R=l;pCal();if(!form)pPan()});   // los llena la Parte 3
vistas.calendario=e=>{
  el=e;form=null;sel=ymd(new Date());mes=new Date();mes.setDate(1);
  el.innerHTML='<div class="cols"><section class="c2" id="cal" aria-label="Calendario del mes"></section><aside class="c2 pan" id="pan" aria-live="polite"></aside></div>';
  el.onclick=clic;el.oninput=tecla;pCal();pPan();
};
addEventListener('hashchange',()=>{if(location.hash!=='#calendario')el=null});

function pCal(){
  if(!el||!$('#cal'))return;
  const y=mes.getFullYear(),m=mes.getMonth(),ini=mes.getDay(),n=new Date(y,m+1,0).getDate(),hoy=ymd(new Date());
  let h=`<div class="chd"><h1 class="mt" aria-live="polite">${MES[m]} ${y}</h1><div class="bt"><button class="ic" data-nav="-1" aria-label="Mes anterior">${ic('lft')}</button><button class="ic w" data-nav="0">Hoy</button><button class="ic" data-nav="1" aria-label="Mes siguiente">${ic('rgt')}</button></div></div><div class="cal">`
    +DCORTO.map((x,i)=>`<div class="w"><abbr title="${DIA[i]}" style="text-decoration:none">${x}</abbr></div>`).join('')+'<div></div>'.repeat(ini);
  for(let d=1;d<=n;d++){
    const f=y+'-'+dos(m+1)+'-'+dos(d),hl=D.find(x=>x.id===f),evs=E.filter(e=>e.fecha===f).sort((a,b)=>(a.hora||'').localeCompare(b.hora||'')),rs=R.filter(r=>r.fecha===f);
    const etiqueta=DIA[new Date(y,m,d).getDay()]+' '+d+' de '+MES[m]+(evs.length?', '+evs.length+(evs.length>1?' eventos':' evento'):'')+(rs.length?', '+rs.length+(rs.length>1?' repertorios':' repertorio'):'');
    h+=`<button class="d${f===hoy?' hoy':''}${f===sel?' sel':''}" data-dia="${f}" aria-label="${esc(etiqueta)}" aria-pressed="${f===sel}" ${f===hoy?'aria-current="date"':''} ${hl?`style="background:${hl.color}33"`:''}><b>${d}</b>`
      +evs.slice(0,2).map(pill).join('')+(evs.length>2?`<small>+${evs.length-2} m\u00e1s</small>`:'')
      +(rs.length?`<span class="p rep" aria-hidden="true">${ic('mus',11)} ${rs.length>1?rs.length+' repertorios':esc(rs[0].nombre)}</span>`:'')+'</button>';
  }
  $('#cal').innerHTML=h+'</div>';
}

function pPan(){
  if(!el||!$('#pan'))return;
  const [Y,M,Dd]=sel.split('-').map(Number),dt=new Date(Y,M-1,Dd),hoy=sel===ymd(new Date());
  const evs=E.filter(e=>e.fecha===sel).sort((a,b)=>(a.hora||'').localeCompare(b.hora||'')),hl=D.find(x=>x.id===sel),rs=R.filter(r=>r.fecha===sel);
  let h=`<div class="fecha"><h2>${DIA[dt.getDay()]} ${Dd}${hoy?'<span class="hoyb">Hoy</span>':''}</h2><small>${MES[M-1]} de ${Y}</small></div>`;
  if(form){
    h+=`<div class="fev"><h3 style="margin:0">${form.id?'Editar evento':'Nuevo evento'}</h3>
      <div class="dos"><label class="fl2">T\u00edtulo<input id="ft" value="${esc(form.titulo)}" placeholder="Ej: Ensayo"></label><label class="fl2">Hora<input type="time" id="fh" value="${esc(form.hora||'')}"></label></div>
      <label class="fl2">Notas<textarea id="fn" rows="2" style="resize:vertical" placeholder="Opcional">${esc(form.notas||'')}</textarea></label>
      <div class="fl2">Color<div class="colores" role="group" aria-label="Color del evento">${COL.map(c=>`<button class="sw${c===form.color?' on':''}" data-fc="${c}" style="background:${c}" aria-label="${NCOL[c]}" aria-pressed="${c===form.color}" title="${NCOL[c]}"></button>`).join('')}</div></div>
      <div class="pie"><button class="sec" data-no>Cancelar</button><button data-ok>${form.id?'Guardar cambios':'Guardar evento'}</button></div></div>`;
  }else{
    h+=(evs.map(e=>`<div class="ev"><span class="bar" style="background:${e.color}"></span><div class="t"><b>${esc(e.titulo)}</b>${e.hora?`<span class="hora">${esc(e.hora)}</span>`:''}${e.notas?`<small>${esc(e.notas)}</small>`:''}</div><button class="ic" data-e="${e.id}" aria-label="Editar \u00ab${esc(e.titulo)}\u00bb" title="Editar">${ic('edt',16)}</button><button class="ic rj" data-x="${e.id}" aria-label="Eliminar \u00ab${esc(e.titulo)}\u00bb" title="Eliminar">${ic('trs',16)}</button></div>`).join('')||'<p class="vac" style="margin:0">No hay eventos este d\u00eda.</p>')
      +rs.map(r=>`<div class="ev rp"><div class="t" style="display:flex;align-items:center;gap:10px;font-weight:700;color:var(--azul)">${ic('mus',18)} ${esc(r.nombre)}</div><button data-rep="${r.id}">Abrir</button></div>`).join('')
      +`<button data-add>${ic('pls',16)} A\u00f1adir evento</button>
      <button class="sec" data-rd>${ic('mus',16)} Crear repertorio para este d\u00eda</button>
      <div class="linea"></div>
      <div class="resaltar"><span id="rl">Resaltar d\u00eda</span><div class="colores" role="group" aria-labelledby="rl">${COL.map(c=>`<button class="sw${hl&&hl.color===c?' on':''}" data-sw="${c}" style="background:${c}" aria-label="${NCOL[c]}" aria-pressed="${!!(hl&&hl.color===c)}" title="${NCOL[c]}"></button>`).join('')}</div>${hl?'<button class="lnk" data-hq>Quitar</button>':''}</div>`;
  }
  $('#pan').innerHTML=h;
}

function clic(e){
  const b=e.target.closest('[data-nav],[data-dia],[data-e],[data-x],[data-add],[data-sw],[data-fc],[data-ok],[data-no],[data-hq],[data-rep],[data-rd]');
  if(!b)return;const d=b.dataset;
  if(d.nav!=null){mes=d.nav==='0'?new Date():new Date(mes.getFullYear(),mes.getMonth()+ +d.nav,1);mes.setDate(1);if(d.nav==='0')sel=ymd(new Date());form=null;pCal();pPan();$(`[data-nav="${d.nav}"]`).focus()}
  else if(d.dia){sel=d.dia;form=null;pCal();pPan();const b=$(`[data-dia="${sel}"]`);if(b)b.focus()}
  else if(d.add!=null){form={titulo:'',hora:'',color:COL[0],notas:''};pPan();$('#ft').focus()}
  else if(d.e){form={...E.find(x=>x.id===d.e)};pPan();$('#ft').focus()}
  else if(d.x){const v=E.find(x=>x.id===d.x);eliminar('eventos',v,'el evento "'+v.titulo+'"')}
  else if(d.fc){form.color=d.fc;pPan()}
  else if(d.no!=null){form=null;pPan()}
  else if(d.ok!=null){
    if(!form.titulo.trim())return alert('Escribe un t\u00edtulo.');
    const v={titulo:form.titulo.trim(),hora:form.hora||'',color:form.color,notas:form.notas||'',fecha:sel};
    form.id?guardar('eventos',form.id,v):crear('eventos',v);form=null;pPan();
  }
  else if(d.sw)guardar('dias',sel,{color:d.sw});
  else if(d.hq!=null)eliminar('dias',D.find(x=>x.id===sel),'el resaltado');
  else if(d.rep){sessionStorage.setItem('repAbrir',d.rep);location.hash='repertorio'}
  else if(d.rd!=null){sessionStorage.setItem('repFecha',sel);location.hash='repertorio'}
}
function tecla(e){
  const t=e.target;if(!form)return;
  if(t.id==='ft')form.titulo=t.value;else if(t.id==='fh')form.hora=t.value;else if(t.id==='fn')form.notas=t.value;
}
