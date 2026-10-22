// ===== LOGIN SENCILLO (un solo usuario) =====
// Ojo: esto solo pide usuario y contraseña en pantalla. No protege los datos de Firebase.
const USUARIO = 'admin';
const CLAVE = 'admin';
const LLAVE = 'musicapp_sesion';

const leer = () => { try { return localStorage.getItem(LLAVE) === '1'; } catch { return false; } };
const escribir = v => { try { v ? localStorage.setItem(LLAVE, '1') : localStorage.removeItem(LLAVE); } catch {} };
const svg = d => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const NOTA = '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>';
const SALIR = '<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>';

// Carga todas las pantallas a la vez y, cuando están listas, dibuja la pantalla actual
async function iniciarApp() {
  document.body.classList.remove('sin-sesion');
  await Promise.all(['base', 'canciones', 'calendario', 'escalas', 'repertorio', 'respaldo'].map(m => import(`./${m}.js`)));
  dispatchEvent(new HashChangeEvent('hashchange'));
  const b = document.createElement('button');
  b.className = 'salir';
  b.innerHTML = svg(SALIR) + '<span>Salir</span>';
  b.title = 'Cerrar sesión';
  b.setAttribute('aria-label', 'Salir');
  b.onclick = () => { escribir(false); location.hash = ''; location.reload(); };
  document.querySelector('header').append(b);
}

function mostrarLogin() {
  document.body.classList.add('sin-sesion');
  document.title = 'Iniciar sesión · Músicapp';
  const app = document.getElementById('app');
  app.innerHTML = `
    <form class="login" novalidate>
      <div class="marca">${svg(NOTA).replace('width="18" height="18"', 'width="28" height="28"')}</div>
      <h1>Músicapp</h1>
      <p class="ayuda">Inicia sesión para continuar</p>
      <label>Usuario<input name="u" autocomplete="username" autocapitalize="none" spellcheck="false" required></label>
      <label>Contraseña<input name="c" type="password" autocomplete="current-password" required></label>
      <p class="error" role="alert" hidden>Usuario o contraseña incorrectos. Revisa los datos e inténtalo otra vez.</p>
      <button type="submit">Entrar</button>
    </form>`;
  const f = app.querySelector('form');
  f.u.focus();
  f.onsubmit = e => {
    e.preventDefault();
    if (f.u.value.trim() === USUARIO && f.c.value === CLAVE) {
      escribir(true);
      app.innerHTML = '';
      iniciarApp();
    } else {
      f.querySelector('.error').hidden = false;
      f.c.value = '';
      f.c.focus();
    }
  };
}

leer() ? iniciarApp() : mostrarLogin();
