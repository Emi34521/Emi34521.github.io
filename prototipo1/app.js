/* ════════════════════════════════════════════════
   StoreOS — JavaScript v1.1
   Funciones:
   1. Login / logout / selección de rol y tipo de cliente
   2. Vista de tienda (detalle / mayorista)
   3. Navegación entre paneles (dueño y empleado)
   4. Sub-tabs (pestañas internas)
   5. Modales
   6. Helpers UI
════════════════════════════════════════════════ */

let currentRole         = 'owner';
let currentCustomerType = 'retail'; // 'retail' | 'wholesale'


/* ── 1. LOGIN / LOGOUT ──────────────────────── */

function selectRole(role, el) {
  document.querySelectorAll('.role-btn').forEach(b => b.className = 'role-btn');
  const classMap = { owner: 'active-owner', employee: 'active-employee', customer: 'active-customer' };
  el.classList.add(classMap[role]);
  currentRole = role;

  // Mostrar selector de sub-tipo sólo cuando se elige Cliente
  const ctRow = document.getElementById('customer-type-row');
  if (ctRow) ctRow.style.display = role === 'customer' ? 'flex' : 'none';

  const btn = document.getElementById('login-btn');
  const labels = {
    owner:    'Ingresar como Dueño →',
    employee: 'Ingresar como Empleado →',
    customer: currentCustomerType === 'wholesale'
                ? 'Entrar al portal mayorista →'
                : 'Ver catálogo →'
  };
  const cls = { owner: '', employee: 'emp', customer: 'cust' };
  btn.textContent = labels[role];
  btn.className   = 'btn-login ' + cls[role];
}

function selectCustomerType(type, el) {
  currentCustomerType = type;
  document.querySelectorAll('.ctype-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  // Actualizar texto del botón de login
  const btn = document.getElementById('login-btn');
  if (btn && currentRole === 'customer') {
    btn.textContent = type === 'wholesale'
      ? 'Entrar al portal mayorista →'
      : 'Ver catálogo →';
  }
}

function login() {
  document.getElementById('screen-login').style.display = 'none';
  const appMap = { owner: 'app-owner', employee: 'app-employee', customer: 'app-customer' };
  document.getElementById(appMap[currentRole]).classList.add('active');

  // Si es cliente, activar la vista correspondiente
  if (currentRole === 'customer') {
    showStoreView(currentCustomerType);
  }
}

function logout() {
  document.querySelectorAll('.app').forEach(a => a.classList.remove('active'));
  document.getElementById('screen-login').style.display = 'flex';

  // Ocultar el selector de tipo de cliente al salir
  const ctRow = document.getElementById('customer-type-row');
  if (ctRow) ctRow.style.display = 'none';

  // Resetear el botón de correo si existe
  const eb = document.getElementById('btn-send-email');
  if (eb) {
    eb.textContent = '📧 Enviar correo';
    eb.disabled    = false;
    eb.className   = 'btn btn-owner';
  }
}


/* ── 2. VISTA DE TIENDA (detalle / mayorista) ── */

function showStoreView(type) {
  // Mostrar el panel correcto
  document.querySelectorAll('.store-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById('panel-' + (type === 'wholesale' ? 'wholesale' : 'retail'));
  if (panel) panel.classList.add('active');

  // Actualizar el badge de tipo en el topbar
  const badge = document.getElementById('store-type-badge');
  if (badge) badge.textContent = type === 'wholesale' ? '🏭 Mayorista' : '🛍️ Detalle';

  // Construir la navegación del topbar según el tipo
  const nav = document.getElementById('store-nav');
  if (nav) {
    if (type === 'wholesale') {
      nav.innerHTML = `
        <button class="store-nav-item active">📋 Inventario</button>
        <button class="store-nav-item">🛒 Mi pedido</button>
        <button class="store-nav-item">📦 Mis pedidos</button>`;
    } else {
      nav.innerHTML = `
        <button class="store-nav-item active">🛒 Catálogo</button>
        <button class="store-nav-item">🏷️ Promociones</button>
        <button class="store-nav-item">❓ Ayuda</button>`;
    }
  }
}


/* ── 3. NAVEGACIÓN DE PANELES PRINCIPALES ───── */

function showPanel(app, panelId, btnEl) {
  const appSelector = app === 'owner' ? '#app-owner' : '#app-employee';
  const prefix      = app === 'owner' ? 'owner'      : 'emp';

  document.querySelectorAll(appSelector + ' .panel').forEach(p => p.classList.remove('active'));

  const target = document.getElementById(prefix + '-' + panelId);
  if (target) target.classList.add('active');

  btnEl.closest('nav').querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  btnEl.classList.add('active');
}


/* ── 4. SUB-TABS (pestañas internas) ────────── */

function showSubTab(groupId, tabId, btnEl) {
  const group = document.getElementById(groupId);
  if (!group) return;

  group.querySelectorAll('.sub-panel').forEach(p => p.classList.remove('active'));
  group.querySelectorAll('.sub-tab').forEach(b => b.classList.remove('active'));

  const target = document.getElementById(tabId);
  if (target) target.classList.add('active');
  btnEl.classList.add('active');
}


/* ── 5. MODALES ─────────────────────────────── */

function openModal(id)  { const m = document.getElementById(id); if (m) m.classList.add('open'); }
function closeModal(id) { const m = document.getElementById(id); if (m) m.classList.remove('open'); }

document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('open');
});
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
});


/* ── 6. HELPERS UI ──────────────────────────── */

function sendEmailConfirm() {
  const btn = document.getElementById('btn-send-email');
  if (!btn) return;
  btn.textContent = '⏳ Enviando…';
  btn.disabled    = true;
  setTimeout(() => {
    btn.textContent = '✅ Correo enviado';
    btn.classList.remove('btn-owner');
    btn.classList.add('btn-outline');
    setTimeout(() => closeModal('modal-email'), 1400);
  }, 1200);
}

function savePrice(btnEl) {
  const original = btnEl.textContent;
  btnEl.textContent = '✅ Guardado';
  btnEl.disabled    = true;
  setTimeout(() => { btnEl.textContent = original; btnEl.disabled = false; }, 1500);
}