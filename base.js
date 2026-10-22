// ===== BASE: Firebase + funciones comunes + navegación + INICIO =====
import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getFirestore,collection,doc,setDoc,addDoc,deleteDoc,onSnapshot} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {firebaseConfig} from "./firebase-config.js";

const db=getFirestore(initializeApp(firebaseConfig));
export const $=(s,r=document)=>r.querySelector(s);
export const esc=t=>String(t??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export const guardar=(col,id,d,m=true)=>setDoc(doc(db,col,id),d,{merge:m});
export const crear=(col,d)=>addDoc(collection(db,col),d);
export const escuchar=(col,fn)=>onSnapshot(collection(db,col),s=>fn(s.docs.map(d=>({...d.data(),id:d.id}))));

// Eliminar con confirmación (o directo) y botón "Deshacer" durante 6 segundos
export function eliminar(col,item,texto,directo){
  if(!directo&&!confirm('¿Eliminar '+texto+'?'))return;
  deleteDoc(doc(db,col,item.id));
  const d=document.createElement('div');
  d.innerHTML='Eliminado <button class="sec">Deshacer</button>';
  d.querySelector('button').onclick=()=>{guardar(col,item.id,item,false);d.remove()};
  $('#aviso').append(d);setTimeout(()=>d.remove(),6000);
}

// Reduce una foto para guardarla dentro de la base de datos
export const imagen=(f,max=300)=>new Promise(r=>{
  const i=new Image;
  i.onload=()=>{const k=Math.min(1,max/Math.max(i.width,i.height)),c=document.createElement('canvas');
    c.width=i.width*k;c.height=i.height*k;c.getContext('2d').drawImage(i,0,0,c.width,c.height);
    r(c.toDataURL('image/jpeg',.8))};
  i.src=URL.createObjectURL(f);
});

// ===== ÍCONOS (en lugar de emojis) y VENTANA PEQUEÑA CENTRADA =====
const I={cal:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  mus:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  dsc:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/>',
  usr:'<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8"/>',
  edt:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>',
  trs:'<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/>',
  pls:'<path d="M12 5v14M5 12h14"/>',lft:'<path d="M15 18l-6-6 6-6"/>',rgt:'<path d="M9 18l6-6-6-6"/>',x:'<path d="M18 6L6 18M6 6l12 12"/>'};
export const ic=(n,s=18)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]}</svg>`;
export function modal(html){
  const o=document.createElement('div');o.className='mo';o.innerHTML=`<div class="mc">${html}</div>`;
  document.body.append(o);o.addEventListener('mousedown',e=>{if(e.target===o)o.remove()});return o;
}

// ===== NAVEGACIÓN (la barra de arriba solo muestra los botones dentro de las pantallas) =====
export const vistas={};
const MENU=[['calendario','cal','Calendario'],['repertorio','mus','Repertorio'],['canciones','dsc','Canciones'],['escalas','usr','Escalas']];
const vista=()=>location.hash.slice(1)||'inicio';
function irA(){
  $('#nav').innerHTML=vista()==='inicio'?'':MENU.map(([k,i,n])=>`<a href="#${k}" class="${k===vista()?'on':''}">${ic(i,17)} ${n}</a>`).join('');
  const el=$('#app');el.innerHTML='';
  (vistas[vista()]||(e=>e.innerHTML='<p>Esta ventana llega en la siguiente parte.</p>'))(el);
}

// ===== INICIO (logo, nombre y 4 botones) =====
let cfg={nombre:'Ministerio de música',logo:''},listo=0;
const cabecera=()=>{$('#logo').innerHTML=(cfg.logo?`<img src="${cfg.logo}" alt="">`:`<span class="lg">${ic('mus',20)}</span>`)+`<span>${esc(cfg.nombre)}</span>`};

vistas.inicio=el=>{
  el.innerHTML=`<div class="inicio">
    <div style="text-align:right"><button class="sec" id="bl">Logo</button> <button class="sec" id="bn">${ic('edt',15)} Nombre</button><input type="file" id="fl" accept="image/*" hidden></div>
    ${cfg.logo?`<img class="logo" src="${cfg.logo}" alt="">`:`<div class="bigmark">${ic('mus',54)}</div>`}
    <h1>${esc(cfg.nombre)}</h1>
    <div class="menu4">${MENU.map(([k,i,n])=>`<a href="#${k}">${ic(i,44)}<span>${n}</span></a>`).join('')}</div>
  </div>`;
  $('#bl').onclick=()=>$('#fl').click();
  $('#fl').onchange=async e=>guardar('config','app',{logo:await imagen(e.target.files[0],200)});
  $('#bn').onclick=()=>{const n=prompt('Nombre de la app',cfg.nombre);if(n)guardar('config','app',{nombre:n})};
};

escuchar('config',l=>{
  cfg={...cfg,...(l.find(x=>x.id==='app')||{})};
  cabecera();
  if(!listo||vista()==='inicio'){listo=1;irA()}
});
addEventListener('hashchange',irA);

// ===== Clic en el botón de la pantalla en la que ya estás: vuelve al inicio de esa pantalla =====
$('#nav').addEventListener('click',e=>{
  const enlace=e.target.closest('a');
  if(enlace&&enlace.getAttribute('href')==='#'+vista())dispatchEvent(new CustomEvent('reinicio',{detail:vista()}));
});
