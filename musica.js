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
//   tokensMarcado(texto) lo mismo pero devuelve TODAS las letras a pintar (notas, números, sus, M, | * % ( ) . #)
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
// ---------- Botón «Ac» con todos sus complementos ----------
// tokensMarcado(texto): como tokensAcorde, pero devuelve TODAS las letras que el botón «Ac» debe pintar (en rojo y negrita):
//   la nota (A-G o Do, Re, Mi, Fa, Sol, La, Si, con su # o b), el bajo (A7/G) y todo lo que acompaña (números, sus, M, m, #, b9, ( ) | * % . + -).
//   Solo las NOTAS se transponen; lo demás es fijo (lo decide transponerChars).
// Una «palabra» (lo que va entre espacios) se acepta solo si TODA ella se entiende (así «Dios» o «Gloria» no cuentan).
// Las notas pueden ir pegadas a símbolos u otras notas: «.D», «|A7M(#11)», «A|D», «A7M(#11)D».
// Devuelve una lista de {ini, fin, raices, marcas}: raices = posición de cada nota, marcas = posición de cada letra a pintar.
const RAIZ_RE=/(?:Sol|Si|La|Fa(?!dd)|Re|Mi|Do|[A-G])[#b]?/y;
const SUFIJO_RE=/Maj|maj|min|dim|aug|sus|add|m|M/y;
export function tokensMarcado(texto){
  const res=[],re=/\S+/g;let m;
  while((m=re.exec(texto))){
    const w=m[0],marcas=[],raices=[];let i=0,acorde=false,ok=true;
    while(i<w.length){
      RAIZ_RE.lastIndex=i;const r=RAIZ_RE.exec(w);
      if(r){                                             // una nota (con su # o b)
        raices.push(m.index+i);
        for(let q=0;q<r[0].length;q++)marcas.push(m.index+i+q);
        i+=r[0].length;acorde=true;continue;
      }
      if(acorde){
        SUFIJO_RE.lastIndex=i;const s=SUFIJO_RE.exec(w);
        if(s){for(let q=0;q<s[0].length;q++)marcas.push(m.index+i+q);i+=s[0].length;continue}   // m, M, sus, add...
      }
      const ch=w[i];
      let fijo=/[\d#|*%().]/.test(ch)                        // números y símbolos fijos
        ||(acorde&&/[+\-°ø]/.test(ch))                        // A+, C-, B° (disminuido), Bø (semidisminuido)
        ||(acorde&&ch==='b'&&/\d/.test(w[i+1]||''))           // el b de (b9)
        ||(acorde&&ch==='/'&&(RAIZ_RE.lastIndex=i+1,RAIZ_RE.test(w)));   // la barra del bajo, solo si lo que sigue es una nota
      if(!fijo){ok=false;break}
      marcas.push(m.index+i);
      if(/[|*%.°]/.test(ch))acorde=false;                     // después de | * % . ya no se está dentro de un acorde
      i++;
    }
    if(ok&&marcas.length)res.push({ini:m.index,fin:m.index+w.length,raices,marcas});
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
// Notas en español (Do, Re, Mi, Fa, Sol, La, Si). Misma idea que nuevaRaiz pero con nombres en español.
export const NATURAL_SOLFA={Do:0,Re:2,Mi:4,Fa:5,Sol:7,La:9,Si:11};
const SOLFA_SOST=['Do','Do#','Re','Re#','Mi','Fa','Fa#','Sol','Sol#','La','La#','Si'];
const SOLFA_BEM=['Do','Reb','Re','Mib','Mi','Fa','Fa#','Sol','Lab','La','Sib','Si'];
export function nuevaRaizSolfa(nombre,acc,d,sostenidos){
  const n=NATURAL_SOLFA[nombre]+(acc==='#'?1:acc==='b'?-1:0)+d;
  const usa=(sostenidos===null||sostenidos===undefined)?acc==='#':sostenidos;
  return (usa?SOLFA_SOST:SOLFA_BEM)[((n%12)+12)%12];
}
// solfaEn(letras, j): si en la posición j empieza una nota en español hecha de letras marcadas, devuelve {nombre, largo}.
// Exige que TODAS sus letras estén marcadas (así un «Do» suelto de la letra, con solo la D marcada, sigue siendo la nota D).
function solfaEn(chars,j){
  if(!chars[j].k)return null;
  let s='';for(let q=j;q<chars.length&&q<j+5&&chars[q].k;q++)s+=chars[q].ch;
  const r=/^(Sol|Si|La|Fa(?!dd)|Re|Mi|Do)/.exec(s);
  return r?{nombre:r[1],largo:r[1].length}:null;
}
// transponerChars(letras, d, sostenidos): sube o baja d semitonos los acordes marcados (letras con k) de UNA línea.
// «letras» es la línea como lista de {ch, ...formato}. Un # o b pegado a la letra cuenta como parte de la nota.
// Si el nombre del acorde cambia de largo (E → Eb), ajusta los espacios para que los demás acordes no se muevan.
// Devuelve {letras: la lista nueva, cambio: true si algo cambió}. No modifica la lista original.
export function transponerChars(chars,d,sostenidos){
  const nuevo=[];let cambio=false,deuda=0;     // deuda: letras de más (+) o de menos (-) por el cambio de nombre
  for(let j=0;j<chars.length;j++){
    const c=chars[j];
    const sol=solfaEn(chars,j);
    if(sol){                                     // nota en español (Do, Re, Mi...): cambia las letras de la nota; lo demás no se toca
      const sig=chars[j+sol.largo],acc=sig&&sig.k&&(sig.ch==='#'||sig.ch==='b')?sig.ch:'';
      const nom=nuevaRaizSolfa(sol.nombre,acc,d,sostenidos);
      for(const ch of nom)nuevo.push({...c,ch});
      j+=sol.largo-1+(acc?1:0);
      deuda+=nom.length-(sol.largo+acc.length);cambio=true;
    }
    else if(c.k&&/[A-G]/.test(c.ch)){
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
