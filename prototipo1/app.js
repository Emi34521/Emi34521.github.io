/* ════════════════════════════════════════════════
   StoreOS — JavaScript
   Funciones:
   1. Login / logout / selección de rol
   2. Navegación entre paneles
   3. Sub-tabs (pestañas internas)
   4. Modales (Kardex, correo, pagos, bodega)
════════════════════════════════════════════════ */

let currentRole = 'owner';

/* ── 1. LOGIN / LOGOUT ──────────────────────── */

function selectRole(role, el) {
  document.querySelectorAll('.role-btn').forEach(b => b.className = 'role-btn');
  const classMap = { owner: 'active-owner', employee: 'active-employee', customer: 'active-customer' };
  el.classList.add(classMap[role]);
  currentRole = role;

  const btn = document.getElementById('login-btn');
  const labels = {
    owner:    'Ingresar como Dueño →',
    employee: 'Ingresar como Empleado →',
    customer: 'Ver catálogo →'
  };
  const cls = { owner: '', employee: 'emp', customer: 'cust' };
  btn.textContent = labels[role];
  btn.className   = 'btn-login ' + cls[role];
}

function login() {
  document.getElementById('screen-login').style.display = 'none';
  const appMap = {
    owner:    'app-owner',
    employee: 'app-employee',
    customer: 'app-customer'
  };
  document.getElementById(appMap[currentRole]).classList.add('active');
}

function logout() {
  document.querySelectorAll('.app').forEach(a => a.classList.remove('active'));
  document.getElementById('screen-login').style.display = 'flex';
}


/* ── 2. NAVEGACIÓN DE PANELES PRINCIPALES ───── */

/**
 * showPanel(app, panelId, btnEl)
 *  app     → 'owner' | 'emp'
 *  panelId → id del panel sin prefijo (ej: 'dashboard', 'kardex')
 *  btnEl   → botón de navegación que se activó
 */
function showPanel(app, panelId, btnEl) {
  const appSelector = app === 'owner' ? '#app-owner' : '#app-employee';
  const prefix      = app === 'owner' ? 'owner'      : 'emp';

  // Ocultar todos los paneles de esta app
  document.querySelectorAll(appSelector + ' .panel').forEach(p => p.classList.remove('active'));

  // Activar el panel solicitado
  const target = document.getElementById(prefix + '-' + panelId);
  if (target) target.classList.add('active');

  // Actualizar estado activo en la nav
  btnEl.closest('nav').querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  btnEl.classList.add('active');
}


/* ── 3. SUB-TABS (pestañas internas) ────────── */

/**
 * showSubTab(groupId, tabId, btnEl)
 *  groupId → id del contenedor padre de sub-tabs (ej: 'kardex-tabs')
 *  tabId   → id del sub-panel a mostrar
 *  btnEl   → botón de sub-tab activado
 */
function showSubTab(groupId, tabId, btnEl) {
  const group = document.getElementById(groupId);
  if (!group) return;

  group.querySelectorAll('.sub-panel').forEach(p => p.classList.remove('active'));
  group.querySelectorAll('.sub-tab').forEach(b => b.classList.remove('active'));

  const target = document.getElementById(tabId);
  if (target) target.classList.add('active');
  btnEl.classList.add('active');
}


/* ── 4. MODALES ─────────────────────────────── */

function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('open');
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('open');
}

// Cerrar modal al hacer clic en el overlay (fuera del cuadro)
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

// Cerrar con Escape
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  }
});


/* ── 5. HELPERS UI ──────────────────────────── */

// Simulación de envío de correo de confirmación
function sendEmailConfirm() {
  const btn = document.getElementById('btn-send-email');
  if (!btn) return;
  btn.textContent = '⏳ Enviando…';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = '✅ Correo enviado';
    btn.classList.remove('btn-owner');
    btn.classList.add('btn-outline');
    setTimeout(() => closeModal('modal-email'), 1400);
  }, 1200);
}

// Simular guardar precio
function savePrice(btnEl) {
  const original = btnEl.textContent;
  btnEl.textContent = '✅ Guardado';
  btnEl.disabled = true;
  setTimeout(() => {
    btnEl.textContent = original;
    btnEl.disabled = false;
  }, 1500);
}