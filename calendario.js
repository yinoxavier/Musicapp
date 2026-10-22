// ===== PANTALLA: CALENDARIO (mes + panel de detalles del día) =====
import {$,esc,guardar,crear,escuchar,eliminar,vistas,ic} from "./base.js";

const st=document.createElement('style');
st.textContent=`.cols{display:grid;grid-template-columns:1fr 372px;gap:24px;align-items:start}
.c2{background:#fff;border-radius:18px;padding:22px;box-shadow:0 2px 12px #1f2a4d14}
.chd{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;gap:8px}.mt{margin:0;font-size:28px;text-transform:capitalize}
.bt{display:flex;gap:8px}.bt .w{width:auto;padding:0 14px}
.cal{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}
.cal .w{text-align:center;font-size:12px;font-weight:700;color:#6b7390;padding:6px 0}
.cal .d{background:#f7f8fc;color:#1d2233;border-radius:12px;min-height:92px;padding:8px;display:flex;flex-direction:column;align-items:stretch;justify-content:flex-start;gap:4px;border:2px solid transparent;text-align:left;font-weight:500}
.cal .d:hover{filter:none;border-color:#c3cae0}.cal .d b{font-size:13px;align-self:flex-start}
.cal .d.hoy b{background:#C58A2B;color:#1d2233;border-radius:20px;padding:0 7px}
.cal .d.sel{border-color:#1F2A4D;background:#fff;box-shadow:0 4px 14px #1f2a4d26}
.p{font-size:11px;font-weight:600;color:#fff;border-radius:6px;padding:2px 6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center;gap:4px}
.p.rep{background:#e3e7f2;color:#1F2A4D}.cal small{color:#6b7390;font-size:11px}
.pan{display:flex;flex-direction:column;gap:12px}.eyebrow{font-size:12px;font-weight:700;letter-spacing:.08em;color:#6b7390}
.hoyb{background:#C58A2B;color:#1d2233;font-size:12px;font-weight:700;border-radius:20px;padding:3px 10px}
.ev{display:flex;gap:12px;align-items:center;background:#f7f8fc;border-radius:12px;padding:12px}
.ev .bar{width:6px;align-self:stretch;border-radius:3px}.ev .t{flex:1;min-width:0}.ev small{color:#6b7390;display:block;overflow-wrap:anywhere}
.sw{width:26px;height:26px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 1px #c3cae0;padding:0}
.sw.on{box-shadow:0 0 0 2px #1F2A4D}.fl2{display:flex;flex-direction:column;gap:4px;font-size:12px;font-weight:700;color:#6b7390}
.lnk{background:none;color:#1F2A4D;text-decoration:underline;padding:4px}
@media(max-width:860px){.cols{grid-template-columns:1fr}.cal .d{min-height:62px;padding:5px}.p{font-size:10px}}`;
document.head.append(st);

const COL=['#1F6FEB','#2E7D32','#7B1FA2','#D9822B','#B3261E','#757575'];
const MES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const DIA=['Domingo','Lunes','Martes','Mi\u00e9rcoles','Jueves','Viernes','S\u00e1bado'];
const dos=n=>String(n).padStart(2,'0'),ymd=d=>d.getFullYear()+'-'+dos(d.getMonth()+1)+'-'+dos(d.getDate());
let E=[],D=[],R=[],el=null,mes=new Date(),sel=ymd(new Date()),form=null;
mes.setDate(1);
const pill=e=>`<span class="p" style="background:${e.color}">${esc(e.titulo)}</span>`;

escuchar('eventos',l=>{E=l;pCal();if(!form)pPan()});
escuchar('dias',l=>{D=l;pCal();if(!form)pPan()});
escuchar('repertorios',l=>{R=l;pCal();if(!form)pPan()});   // los llena la Parte 3
vistas.calendario=e=>{
  el=e;form=null;sel=ymd(new Date());mes=new Date();mes.setDate(1);
  el.innerHTML='<div class="cols"><section class="c2" id="cal"></section><aside class="c2 pan" id="pan"></aside></div>';
  el.onclick=clic;el.oninput=tecla;pCal();pPan();
};
addEventListener('hashchange',()=>{if(location.hash!=='#calendario')el=null});

function pCal(){
  if(!el||!$('#cal'))return;
  const y=mes.getFullYear(),m=mes.getMonth(),ini=mes.getDay(),n=new Date(y,m+1,0).getDate(),hoy=ymd(new Date());
  let h=`<div class="chd"><h1 class="mt">${MES[m]} ${y}</h1><div class="bt"><button class="ic" data-nav="-1" aria-label="Mes anterior">${ic('lft')}</button><button class="ic w" data-nav="0">Hoy</button><button class="ic" data-nav="1" aria-label="Mes siguiente">${ic('rgt')}</button></div></div><div class="cal">`
    +'DLMMJVS'.split('').map(x=>`<div class="w">${x}</div>`).join('')+'<div></div>'.repeat(ini);
  for(let d=1;d<=n;d++){
    const f=y+'-'+dos(m+1)+'-'+dos(d),hl=D.find(x=>x.id===f),evs=E.filter(e=>e.fecha===f).sort((a,b)=>(a.hora||'').localeCompare(b.hora||'')),rs=R.filter(r=>r.fecha===f);
    h+=`<button class="d${f===hoy?' hoy':''}${f===sel?' sel':''}" data-dia="${f}" ${hl?`style="background:${hl.color}33"`:''}><b>${d}</b>`
      +evs.slice(0,2).map(pill).join('')+(evs.length>2?`<small>+${evs.length-2} m\u00e1s</small>`:'')
      +(rs.length?`<span class="p rep">${ic('mus',11)} ${rs.length>1?rs.length+' repertorios':esc(rs[0].nombre)}</span>`:'')+'</button>';
  }
  $('#cal').innerHTML=h+'</div>';
}

function pPan(){
  if(!el||!$('#pan'))return;
  const [Y,M,Dd]=sel.split('-').map(Number),dt=new Date(Y,M-1,Dd),hoy=sel===ymd(new Date());
  const evs=E.filter(e=>e.fecha===sel).sort((a,b)=>(a.hora||'').localeCompare(b.hora||'')),hl=D.find(x=>x.id===sel),rs=R.filter(r=>r.fecha===sel);
  let h=`<div><div class="eyebrow">D\u00cdA SELECCIONADO</div><div style="display:flex;align-items:center;gap:10px"><h2 style="margin:4px 0;font-size:26px">${DIA[dt.getDay()]} ${Dd}</h2>${hoy?'<span class="hoyb">Hoy</span>':''}</div><small style="color:#6b7390">${MES[M-1]} ${Y}</small></div>`;
  if(form){
    h+=`<div style="font-weight:700;color:#1F2A4D">${form.id?'Editar evento':'Nuevo evento'}</div>
      <div style="display:grid;grid-template-columns:1fr 120px;gap:8px"><label class="fl2">T\u00edtulo<input id="ft" value="${esc(form.titulo)}"></label><label class="fl2">Hora<input type="time" id="fh" value="${esc(form.hora||'')}"></label></div>
      <label class="fl2">Notas<textarea id="fn" rows="2" style="resize:vertical">${esc(form.notas||'')}</textarea></label>
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px"><div style="display:flex;gap:6px">${COL.map(c=>`<button class="sw${c===form.color?' on':''}" data-fc="${c}" style="background:${c}" aria-label="Color"></button>`).join('')}</div>
      <div style="display:flex;gap:8px"><button class="sec" data-no>Cancelar</button><button data-ok>Guardar</button></div></div>`;
  }else{
    h+=(evs.map(e=>`<div class="ev"><span class="bar" style="background:${e.color}"></span><div class="t"><b>${esc(e.titulo)}</b> <span style="color:#6b7390">${esc(e.hora||'')}</span><small>${esc(e.notas||'')}</small></div><button class="ic" data-e="${e.id}" aria-label="Editar">${ic('edt',16)}</button><button class="ic rj" data-x="${e.id}" aria-label="Eliminar">${ic('trs',16)}</button></div>`).join('')||'<p style="color:#6b7390;margin:0">No hay eventos este d\u00eda.</p>')
      +rs.map(r=>`<div class="ev" style="background:#e3e7f2"><div class="t" style="display:flex;align-items:center;gap:10px;font-weight:700;color:#1F2A4D">${ic('mus',18)} ${esc(r.nombre)}</div><button data-rep="${r.id}">Abrir</button></div>`).join('')
      +`<button data-add>${ic('pls',16)} A\u00f1adir evento</button>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:13px;font-weight:700;color:#6b7390">Resaltar d\u00eda ${COL.map(c=>`<button class="sw${hl&&hl.color===c?' on':''}" data-sw="${c}" style="background:${c}" aria-label="Resaltar"></button>`).join('')}${hl?'<button class="lnk" data-hq>Quitar</button>':''}</div>
      <button class="sec" data-rd>${ic('mus',16)} Ir a Repertorio con esta fecha</button>`;
  }
  $('#pan').innerHTML=h;
}

function clic(e){
  const b=e.target.closest('[data-nav],[data-dia],[data-e],[data-x],[data-add],[data-sw],[data-fc],[data-ok],[data-no],[data-hq],[data-rep],[data-rd]');
  if(!b)return;const d=b.dataset;
  if(d.nav!=null){mes=d.nav==='0'?new Date():new Date(mes.getFullYear(),mes.getMonth()+ +d.nav,1);mes.setDate(1);if(d.nav==='0')sel=ymd(new Date());form=null;pCal();pPan()}
  else if(d.dia){sel=d.dia;form=null;pCal();pPan()}
  else if(d.add!=null){form={titulo:'',hora:'',color:COL[0],notas:''};pPan()}
  else if(d.e){form={...E.find(x=>x.id===d.e)};pPan()}
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
