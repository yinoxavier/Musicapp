// =====================================================================
//  MUSICA.JS  ·  Tonos, acordes y transposición
//  Aquí vive todo lo «musical». No dibuja nada en pantalla.
//
//  QUÉ HAY AQUÍ:
//   S, F ............ los 12 nombres de las notas (con # y con b)
//   ix(nota) ........ da el número de una nota (C=0, C#=1, D=2 ...)
//   trans(acorde,n) . sube o baja un acorde n semitonos (G +2 → A)
//   transTxt(texto,n) transpone todos los acordes de un texto
//   MAY, MEN ........ listas de tonos mayores y menores
//   tokensAcorde(texto) busca las «palabras» con forma de acorde (E, Em7, D/F#)
//   nuevaRaiz(letra,acc,n) calcula la nota nueva al transponer una letra A-G
//   transponerChars(letras,d,sost) transpone una línea (la usan el editor y la ventana Compartir)
//   raizTono, esMenor, nombreTono  ayudas para nombrar el tono nuevo
// =====================================================================
export const S=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'],F=['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
export const ix=n=>{const k=S.indexOf(n);return k<0?F.indexOf(n):k};
export const trans=(c,d)=>c.replace(/[A-G][#b]?/g,n=>{const k=ix(n);return k<0?n:(/b/.test(n)?F:S)[(k+d+120)%12]});
export const ES_ACORDE=/^[A-G][#b]?(?:m|maj|min|dim|aug|sus|add|M|\d|[()+\-])*(?:\/[A-G][#b]?)?$/;
export const transTxt=(t,d)=>{let deb=0;return t.split(/(\s+)/).map(x=>{
  if(ES_ACORDE.test(x)){const n=trans(x,d);deb+=n.length-x.length;return n}
  if(/\n/.test(x)){deb=0;return x}
  if(/^ +$/.test(x)&&deb){const l=Math.max(1,x.length-deb);deb=0;return ' '.repeat(l)}
  return x}).join('')};
// Los 12 tonos mayores y los 12 menores (así aparecen en el botón «Tonalidad»)
export const MAY=['C','Db','D','Eb','E','F','F#','G','Ab','A','Bb','B'],MEN=['Cm','C#m','Dm','Ebm','Em','Fm','F#m','Gm','G#m','Am','Bbm','Bm'];

// ---------- Acordes marcados con el botón «Ac» ----------
// tokensAcorde(texto): busca las «palabras» del texto que tienen forma de acorde completo (E, Em7, D/F#...).
// Devuelve una lista de {ini, fin, raices}: dónde empieza y termina, y la posición de cada letra raíz (la A-G).
// Palabras como «Dios» o «Gloria» NO cuentan, porque no tienen forma de acorde.
export function tokensAcorde(texto){
  const res=[],re=/\S+/g;let m;
  while((m=re.exec(texto))){
    const t=m[0];
    if(!ES_ACORDE.test(t))continue;
    const raices=[m.index],barra=t.indexOf('/');
    if(barra>=0)raices.push(m.index+barra+1);          // la nota del bajo, en acordes como D/F#
    res.push({ini:m.index,fin:m.index+t.length,raices});
  }
  return res;
}
// NATURAL: el número de cada nota sin sostenidos ni bemoles (C=0, D=2, E=4...)
export const NATURAL={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
const SOST=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];     // nombres con sostenidos (para tonos como G, D, A, E, B)
// usaSostenidos(tono): ¿el tono se escribe con sostenidos (true), con bemoles (false) o da igual (null)?
export function usaSostenidos(tono){
  const menor=/m$/.test(tono),r=tono.replace(/m$/,'');
  const i=((NATURAL[r[0]]+(r[1]==='#'?1:r[1]==='b'?-1:0)+(menor?3:0))%12+12)%12;   // el tono mayor equivalente (Em → G)
  if([7,2,9,4,11,6].includes(i))return true;      // G, D, A, E, B, F#
  if([5,10,3,8,1].includes(i))return false;       // F, Bb, Eb, Ab, Db
  return null;                                    // C / Am
}
// nuevaRaiz(letra, acc, d, sostenidos): la nota que resulta al subir d semitonos la nota «letra» (con acc = '#', 'b' o '').
export function nuevaRaiz(letra,acc,d,sostenidos){
  const n=NATURAL[letra]+(acc==='#'?1:acc==='b'?-1:0)+d;
  const usa=(sostenidos===null||sostenidos===undefined)?acc==='#':sostenidos;     // si da igual, respeta lo que ya escribiste
  return (usa?SOST:MAY)[((n%12)+12)%12];
}
// transponerChars(letras, d, sostenidos): sube o baja d semitonos los acordes marcados (letras con k) de UNA línea.
// «letras» es la línea como lista de {ch, ...formato}. Un # o b pegado a la letra cuenta como parte de la nota.
// Si el nombre del acorde cambia de largo (E → Eb), ajusta los espacios para que los demás acordes no se muevan.
// Devuelve {letras: la lista nueva, cambio: true si algo cambió}. No modifica la lista original.
export function transponerChars(chars,d,sostenidos){
  const nuevo=[];let cambio=false,deuda=0;     // deuda: letras de más (+) o de menos (-) por el cambio de nombre
  for(let j=0;j<chars.length;j++){
    const c=chars[j];
    if(c.k&&/[A-G]/.test(c.ch)){
      const sig=chars[j+1],acc=sig&&(sig.ch==='#'||sig.ch==='b')?sig.ch:'';
      const nom=nuevaRaiz(c.ch,acc,d,sostenidos);
      nuevo.push({...c,ch:nom[0]});
      if(nom[1])nuevo.push({...c,ch:nom[1]});   // el # o b nuevo hereda el formato del acorde (rojo y negrita)
      if(acc)j++;
      deuda+=nom.length-(1+acc.length);cambio=true;
    }
    else if(c.ch===' '&&deuda>0&&chars[j+1]&&chars[j+1].ch===' '){deuda--;cambio=true}     // el acorde creció: quita un espacio
    else if(c.ch===' '&&deuda<0){nuevo.push(c,{...c});deuda++;cambio=true}                // el acorde se achicó: añade un espacio
    else nuevo.push(c);
  }
  return {letras:nuevo,cambio};
}
// Nombres de tonos: raizTono('Em') = 'E', esMenor('Em') = true, nombreTono('D', 2, false) = 'E'
export const raizTono=k=>k.replace(/m$/,''),esMenor=k=>/m$/.test(k);
export const nombreTono=(base,d,menor)=>(menor?MEN:MAY)[(((ix(raizTono(base))+d)%12)+12)%12];
