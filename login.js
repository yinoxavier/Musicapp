// ===== LOGIN SENCILLO (un solo usuario) =====
// Ojo: esto solo pide usuario y contraseña en pantalla. No protege los datos de Firebase.
const USUARIO = 'admin';
const CLAVE = 'admin';
const LLAVE = 'musicapp_sesion';

const leer = () => { try { return localStorage.getItem(LLAVE) === '1'; } catch { return false; } };
const escribir = v => { try { v ? localStorage.setItem(LLAVE, '1') : localStorage.removeItem(LLAVE); } catch {} };

// Carga la app (mismo orden que antes en index.html)
async function iniciarApp() {
  document.body.classList.remove('sin-sesion');
  for (const m of ['base', 'canciones', 'calendario', 'escalas', 'repertorio', 'respaldo']) {
    await import(`./${m}.js`);
  }
  const b = document.createElement('button');
  b.className = 'salir';
  b.textContent = 'Salir';
  b.onclick = () => { escribir(false); location.hash = ''; location.reload(); };
  document.querySelector('header').append(b);
}

function mostrarLogin() {
  document.body.classList.add('sin-sesion');
  const app = document.getElementById('app');
  app.innerHTML = `
    <form class="login" autocomplete="off">
      <h2>Iniciar sesión</h2>
      <label>Usuario<input name="u" required autofocus></label>
      <label>Contraseña<input name="c" type="password" required></label>
      <p class="error" hidden>Usuario o contraseña incorrectos</p>
      <button type="submit">Entrar</button>
    </form>`;
  const f = app.querySelector('form');
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
