// =====================================================================
//  ETIQUETAS.JS  ·  Ventana para crear, editar y borrar etiquetas
//  Se abre con  etiquetas(alCerrar)  desde el botón «Etiquetas».
// =====================================================================
import {$,esc,guardar,crear,eliminar,ic,modal} from "./base.js";
import {E,alCambiar} from "./estado.js";

export function etiquetas(alCerrar){
  let modoEditar=false;                          // ¿está activado el botón «Editar»?
  let dejarDeEscuchar=()=>{};
  const ventana=modal('<div id="te"></div>'),zona=$('#te',ventana);

  // Dibuja el contenido de la ventana (se llama cada vez que algo cambia)
  function dibujar(){
    if(!ventana.isConnected){dejarDeEscuchar();if(alCerrar)alCerrar();return}   // la ventana ya se cerró
    zona.innerHTML=`<div class="mh"><h2>Etiquetas</h2><div class="mb"><button class="${modoEditar?'':'sec'}" data-ed>${modoEditar?'Listo':ic('edt',16)+' Editar'}</button><button class="ic" data-cx aria-label="Cerrar">${ic('x')}</button></div></div>
      <div class="barra"><input id="nt" placeholder="Nueva etiqueta"><button data-add>${ic('pls',16)} A\u00f1adir</button></div>
      <div class="tags">${E.etiquetas.map(t=>modoEditar
        ?`<span class="tag"><input data-te="${t.id}" value="${esc(t.nombre)}" aria-label="Nombre"><button class="ic" data-tx="${t.id}" aria-label="Eliminar">${ic('trs',14)}</button></span>`
        :`<span class="tag">${esc(t.nombre)}</span>`).join('')}</div>`;
  }
  dejarDeEscuchar=alCambiar(dibujar);
  dibujar();

  // Añadir una etiqueta nueva con lo escrito en el cuadro
  const añadir=()=>{const campo=$('#nt',ventana),nombre=campo.value.trim();if(nombre){crear('etiquetas',{nombre});campo.value=''}};

  ventana.onclick=e=>{
    const boton=e.target.closest('button');if(!boton)return;const d=boton.dataset;
    if(d.cx!=null){ventana.remove();dibujar()}                         // cerrar
    else if(d.ed!=null){modoEditar=!modoEditar;dibujar()}              // activar o desactivar «Editar»
    else if(d.add!=null)añadir();                                      // añadir
    else if(d.tx){const t=E.etiquetas.find(x=>x.id===d.tx);eliminar('etiquetas',t,'',true)}   // borrar
  };
  ventana.onkeydown=e=>{if(e.key==='Enter'&&e.target.id==='nt'){e.preventDefault();añadir()}};
  ventana.onchange=e=>{                                                // renombrar (si queda en blanco, se elimina)
    const caja=e.target,t=caja.dataset.te&&E.etiquetas.find(x=>x.id===caja.dataset.te);
    if(!t)return;const nuevo=caja.value.trim();
    if(!nuevo)eliminar('etiquetas',t,'',true);else guardar('etiquetas',t.id,{nombre:nuevo});
  };
}
