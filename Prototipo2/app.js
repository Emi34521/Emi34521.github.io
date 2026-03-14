/* ════════════════════════════════════════════════
   StoreOS — Prototipo 3 · app.js
   1. Datos de categorías dinámicas
   2. Datos de presentaciones / inventario simulado
   3. Login / logout / roles
   4. Navegación de paneles y sub-tabs
   5. Modales
   6. Wizard de registro de producto (4 pasos)
   7. Lógica de presentaciones (caja → botellas)
   8. Categorías dinámicas (sub-filtros por tipo)
   9. Helpers (precios, correo, exportar, rangos)
════════════════════════════════════════════════ */

/* ── 1. DATOS DE CATEGORÍAS DINÁMICAS ────────
   Cada categoría define qué sub-filtros mostrar
   y qué opciones tienen.
──────────────────────────────────────────────── */
const CATEGORY_FILTERS = {
  'Todas': [],
  'Granos': [
    { id: 'cf-tipo',    label: 'Tipo',    opts: ['Todos', 'Arroz', 'Frijol', 'Maíz', 'Azúcar', 'Lenteja'] },
    { id: 'cf-peso',    label: 'Peso',    opts: ['Todos', '1lb', '5lb', '10lb', '50lb', '100lb'] },
    { id: 'cf-marca',   label: 'Marca',   opts: ['Todas', 'Guatelinda', 'Brillante', 'Sin marca'] },
  ],
  'Aceites': [
    { id: 'cf-tipo',    label: 'Tipo',    opts: ['Todos', 'Vegetal', 'Oliva', 'Girasol', 'Manteca'] },
    { id: 'cf-tamaño',  label: 'Tamaño',  opts: ['Todos', '500ml', '1L', '2L', 'Galón (4L)'] },
    { id: 'cf-marca',   label: 'Marca',   opts: ['Todas', 'Ideal', 'Ina', 'Mazola'] },
  ],
  'Velas': [
    { id: 'cf-color',   label: 'Color',   opts: ['Todos', 'Blanca', 'Roja', 'Verde', 'Azul', 'Beige', 'Morada'] },
    { id: 'cf-tamaño',  label: 'Tamaño',  opts: ['Todos', '10cm', '15cm', '20cm', '30cm', 'Votiva'] },
    { id: 'cf-diseño',  label: 'Diseño',  opts: ['Todos', 'Lisa', 'San Judas', 'Virgen', 'Navidad', 'Corazón'] },
    { id: 'cf-aroma',   label: 'Aroma',   opts: ['Todos', 'Sin aroma', 'Lavanda', 'Vainilla', 'Canela'] },
  ],
  'Higiene': [
    { id: 'cf-tipo',    label: 'Tipo',    opts: ['Todos', 'Jabón', 'Shampoo', 'Desodorante', 'Pasta dental'] },
    { id: 'cf-marca',   label: 'Marca',   opts: ['Todas', 'Dove', 'Colgate', 'Palmolive', 'Suave'] },
  ],
  'Bebidas': [
    { id: 'cf-tipo',    label: 'Tipo',    opts: ['Todos', 'Café', 'Té', 'Refresco', 'Agua', 'Jugo'] },
    { id: 'cf-tamaño',  label: 'Tamaño',  opts: ['Todos', '250g', '500g', '1kg', '350ml', '500ml', '1L'] },
    { id: 'cf-marca',   label: 'Marca',   opts: ['Todas', 'Montaña', 'Café Quetzal', 'Lipton'] },
  ],
  'Condimentos': [
    { id: 'cf-tipo',    label: 'Tipo',    opts: ['Todos', 'Sal', 'Pimienta', 'Consomé', 'Azafrán', 'Sazón'] },
    { id: 'cf-peso',    label: 'Peso',    opts: ['Todos', '100g', '250g', '500g', '1kg'] },
  ],
  'Harinas': [
    { id: 'cf-tipo',    label: 'Tipo',    opts: ['Todos', 'Maíz', 'Trigo', 'Arroz', 'Integral'] },
    { id: 'cf-peso',    label: 'Peso',    opts: ['Todos', '500g', '1kg', '2kg', '5kg'] },
    { id: 'cf-marca',   label: 'Marca',   opts: ['Todas', 'Maseca', 'Selecta', 'Robin Hood'] },
  ],
};

/* Presentaciones disponibles por categoría */
const CATEGORY_PRESENTATIONS = {
  'Granos':      ['Saco', 'Bolsa', 'Caja', 'Unidad'],
  'Aceites':     ['Caja', 'Galón', 'Botella', 'Cubeta'],
  'Velas':       ['Caja', 'Paquete', 'Unidad'],
  'Higiene':     ['Caja', 'Paquete', 'Unidad'],
  'Bebidas':     ['Caja', 'Paquete', 'Botella', 'Unidad'],
  'Condimentos': ['Caja', 'Bolsa', 'Frasco', 'Unidad'],
  'Harinas':     ['Saco', 'Bolsa', 'Caja', 'Unidad'],
};

/* Unidades de venta (cómo se vende al cliente) */
const SELL_UNITS = {
  'Caja':    ['Caja completa', 'Unidad suelta'],
  'Saco':    ['Saco completo', 'Libra', 'Kilo'],
  'Galón':   ['Galón completo', 'Botella (1L)', 'Medio galón'],
  'Paquete': ['Paquete completo', 'Unidad suelta'],
  'Botella': ['Botella'],
  'Bolsa':   ['Bolsa completa', 'Unidad suelta'],
  'Cubeta':  ['Cubeta completa', 'Litro'],
  'Frasco':  ['Frasco'],
  'Unidad':  ['Unidad'],
};

/* ── 2. INVENTARIO SIMULADO ───────────────────
   Estado simple en memoria (no persiste).
   Cada producto tiene: presentaciones de compra
   y cómo se desglosan en unidades de venta.
──────────────────────────────────────────────── */
const inventory = [
  {
    code: 'ACE-002', name: 'Aceite Ideal 1L', category: 'Aceites',
    buyPresentation: 'Caja', unitsPerPresentation: 12,
    presentationsInStock: 5,          // 5 cajas
    unitStock: 60,                    // = 5×12 botellas
    sellUnits: ['Caja completa', 'Unidad suelta'],
    priceUnit: 38.50, priceBox: 420.00,
    minStock: 20, warehouse: 'Principal',
    color: null, size: '1L', design: null,
  },
  {
    code: 'VEL-010', name: 'Vela San Judas 20cm', category: 'Velas',
    buyPresentation: 'Caja', unitsPerPresentation: 24,
    presentationsInStock: 3,
    unitStock: 72,
    sellUnits: ['Caja completa', 'Unidad suelta'],
    priceUnit: 5.00, priceBox: 110.00,
    minStock: 20, warehouse: 'Sur',
    color: 'Beige', size: '20cm', design: 'San Judas',
  },
  {
    code: 'VEL-011', name: 'Vela San Judas 15cm', category: 'Velas',
    buyPresentation: 'Caja', unitsPerPresentation: 24,
    presentationsInStock: 4,
    unitStock: 96,
    sellUnits: ['Caja completa', 'Unidad suelta'],
    priceUnit: 3.50, priceBox: 78.00,
    minStock: 20, warehouse: 'Sur',
    color: 'Blanca', size: '15cm', design: 'San Judas',
  },
  {
    code: 'AZU-001', name: 'Azúcar 50lb', category: 'Granos',
    buyPresentation: 'Saco', unitsPerPresentation: 1,
    presentationsInStock: 0,
    unitStock: 0,
    sellUnits: ['Saco completo', 'Libra'],
    priceUnit: 120.00, priceBox: 120.00,
    minStock: 10, warehouse: 'Principal',
    color: null, size: '50lb', design: null,
  },
  {
    code: 'ARR-003', name: 'Arroz Brillante 1lb', category: 'Granos',
    buyPresentation: 'Saco', unitsPerPresentation: 100,
    presentationsInStock: 1,
    unitStock: 8,
    sellUnits: ['Saco completo', 'Libra'],
    priceUnit: 7.50, priceBox: 680.00,
    minStock: 15, warehouse: 'Norte',
    color: null, size: '1lb', design: null,
  },
];

/* Carrito de venta actual */
let cart = [];

/* ── 3. LOGIN / LOGOUT ──────────────────────── */
let currentRole    = 'owner';
let currentSubRole = 'cajero';

function selectRole(role, el) {
  document.querySelectorAll('.role-btn').forEach(b => b.className = 'role-btn');
  const map = { owner:'active-owner', employee:'active-employee', customer:'active-customer' };
  el.classList.add(map[role]);
  currentRole = role;

  const subrow = document.getElementById('subrole-row');
  if (subrow) subrow.style.display = role === 'employee' ? 'flex' : 'none';

  const btn = document.getElementById('login-btn');
  btn.textContent = { owner:'Ingresar como Dueño →', employee:'Ingresar como Colaborador →', customer:'Ver catálogo →' }[role];
  btn.className   = 'btn-login ' + { owner:'', employee:'emp', customer:'cust' }[role];
}

function selectSubRole(role, el) {
  currentSubRole = role;
  document.querySelectorAll('.subrole-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

function login() {
  document.getElementById('screen-login').style.display = 'none';
  const appMap = { owner:'app-owner', employee:'app-employee', customer:'app-customer' };
  document.getElementById(appMap[currentRole]).classList.add('active');

  if (currentRole === 'employee') {
    const badge = document.getElementById('collab-role-badge');
    const names = { cajero:'🧾 Cajero', bodeguero:'📦 Bodeguero', supervisor:'🔑 Supervisor' };
    if (badge) badge.textContent = names[currentSubRole];

    // Bodeguero y supervisor ven registro de producto
    const regTab = document.getElementById('emp-nav-register');
    if (regTab) regTab.style.display = currentSubRole !== 'cajero' ? 'flex' : 'none';

    // Solo supervisor ve actualizar precios
    const priceTab = document.getElementById('emp-nav-prices');
    if (priceTab) priceTab.style.display = currentSubRole === 'supervisor' ? 'flex' : 'none';
  }

  // Cargar el inventario en las tablas al iniciar
  renderInventoryTable('inv-table-body');
  renderInventoryTable('emp-inv-table-body');
  renderSellProductOptions();
}

function logout() {
  document.querySelectorAll('.app').forEach(a => a.classList.remove('active'));
  document.getElementById('screen-login').style.display = 'flex';
  cart = [];
  renderCart();
  const eb = document.getElementById('btn-send-email');
  if (eb) { eb.textContent = '📧 Enviar correo'; eb.disabled = false; eb.className = 'btn btn-owner'; }
}

/* ── 4. NAVEGACIÓN ──────────────────────────── */
function showPanel(app, panelId, btnEl) {
  const sel    = app === 'owner' ? '#app-owner' : '#app-employee';
  const prefix = app === 'owner' ? 'owner' : 'emp';
  document.querySelectorAll(sel + ' > .main > .panel').forEach(p => p.classList.remove('active'));
  const t = document.getElementById(prefix + '-' + panelId);
  if (t) t.classList.add('active');
  if (btnEl) {
    btnEl.closest('nav').querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    btnEl.classList.add('active');
  }
}

function showSubTab(groupId, tabId, btnEl) {
  const g = document.getElementById(groupId);
  if (!g) return;
  g.querySelectorAll('.sub-panel').forEach(p => p.classList.remove('active'));
  g.querySelectorAll('.sub-tab').forEach(b => b.classList.remove('active'));
  const t = document.getElementById(tabId);
  if (t) t.classList.add('active');
  if (btnEl) btnEl.classList.add('active');
}

/* ── 5. MODALES ─────────────────────────────── */
function openModal(id)  { const m = document.getElementById(id); if (m) m.classList.add('open'); }
function closeModal(id) { const m = document.getElementById(id); if (m) m.classList.remove('open'); }

document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('open');
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
});

/* ── 6. WIZARD DE 4 PASOS ────────────────────
   Estado del wizard
──────────────────────────────────────────────── */
let wizardStep = 1;
const TOTAL_STEPS = 4;

/* wizardCtx = datos acumulados del wizard */
let wizardCtx = {
  name: '', subnameA: '', subnameB: '', code: '', category: '',
  size: '', color: '', design: '', aroma: '',
  buyPresentation: '', unitsPerPres: 1, numPresentations: 1,
  warehouse: '', entryDate: '', entryTime: '',
  invoiceNumber: '', invoiceDate: '',
  pricePublic: '', priceMajor: '', priceSpecial: '',
  supplier: '', totalPaid: '',
};

function wizardNext() {
  if (!wizardValidateStep(wizardStep)) return;
  if (wizardStep < TOTAL_STEPS) {
    wizardStep++;
    wizardRender();
  }
}

function wizardBack() {
  if (wizardStep > 1) { wizardStep--; wizardRender(); }
}

function wizardValidateStep(step) {
  // Validación mínima: solo muestra error visual si campo requerido está vacío
  if (step === 1) {
    const name = document.getElementById('wiz-name');
    const cat  = document.getElementById('wiz-category');
    if (name && !name.value.trim()) { name.style.borderColor = 'var(--danger)'; name.focus(); return false; }
    if (name) name.style.borderColor = '';
    if (cat  && !cat.value) { cat.style.borderColor = 'var(--danger)'; return false; }
    if (cat) cat.style.borderColor = '';
    // Guardar datos del paso 1
    wizardCtx.name     = document.getElementById('wiz-name')?.value || '';
    wizardCtx.subnameA = document.getElementById('wiz-subnameA')?.value || '';
    wizardCtx.subnameB = document.getElementById('wiz-subnameB')?.value || '';
    wizardCtx.code     = document.getElementById('wiz-code')?.value || '';
    wizardCtx.category = document.getElementById('wiz-category')?.value || '';
    wizardCtx.size     = document.getElementById('wiz-size')?.value || '';
    wizardCtx.color    = document.getElementById('wiz-color')?.value || '';
    wizardCtx.design   = document.getElementById('wiz-design')?.value || '';
    wizardCtx.aroma    = document.getElementById('wiz-aroma')?.value || '';
  }
  if (step === 2) {
    wizardCtx.buyPresentation  = document.getElementById('wiz-buyPres')?.value || '';
    wizardCtx.unitsPerPres     = parseInt(document.getElementById('wiz-unitsPerPres')?.value) || 1;
    wizardCtx.numPresentations = parseInt(document.getElementById('wiz-numPres')?.value) || 1;
    wizardCtx.warehouse        = document.getElementById('wiz-warehouse')?.value || '';
    wizardCtx.entryDate        = document.getElementById('wiz-entryDate')?.value || '';
    wizardCtx.entryTime        = document.getElementById('wiz-entryTime')?.value || '';
  }
  if (step === 3) {
    wizardCtx.invoiceNumber = document.getElementById('wiz-invoiceNum')?.value || '';
    wizardCtx.invoiceDate   = document.getElementById('wiz-invoiceDate')?.value || '';
    wizardCtx.supplier      = document.getElementById('wiz-supplier')?.value || '';
    wizardCtx.totalPaid     = document.getElementById('wiz-totalPaid')?.value || '';
    wizardCtx.pricePublic   = document.getElementById('wiz-pricePublic')?.value || '';
    wizardCtx.priceMajor    = document.getElementById('wiz-priceMajor')?.value || '';
    wizardCtx.priceSpecial  = document.getElementById('wiz-priceSpecial')?.value || '';
  }
  return true;
}

function wizardConfirm() {
  // Calcular total de unidades
  const total = wizardCtx.unitsPerPres * wizardCtx.numPresentations;

  // Agregar al inventario simulado
  const newProd = {
    code: wizardCtx.code || ('PRD-' + String(inventory.length + 1).padStart(3,'0')),
    name: wizardCtx.name + (wizardCtx.subnameA ? ' ' + wizardCtx.subnameA : '') + (wizardCtx.subnameB ? ' ' + wizardCtx.subnameB : ''),
    category: wizardCtx.category,
    buyPresentation: wizardCtx.buyPresentation,
    unitsPerPresentation: wizardCtx.unitsPerPres,
    presentationsInStock: wizardCtx.numPresentations,
    unitStock: total,
    sellUnits: (SELL_UNITS[wizardCtx.buyPresentation] || ['Unidad']),
    priceUnit: parseFloat(wizardCtx.pricePublic) || 0,
    priceBox:  parseFloat(wizardCtx.priceMajor)  || 0,
    minStock: 10,
    warehouse: wizardCtx.warehouse,
    color: wizardCtx.color || null,
    size: wizardCtx.size   || null,
    design: wizardCtx.design || null,
  };
  inventory.push(newProd);

  // Re-render tablas
  renderInventoryTable('inv-table-body');
  renderInventoryTable('emp-inv-table-body');
  renderSellProductOptions();

  // Feedback y reset
  const confirmBox = document.getElementById('wiz-confirm-summary');
  if (confirmBox) {
    confirmBox.innerHTML = `
      <div class="alert-banner alert-ok" style="margin-bottom:0">
        ✅ <strong>${newProd.name}</strong> registrado correctamente.
        ${total} unidades en ${newProd.warehouse || 'bodega'}.
        ${wizardCtx.invoiceNumber ? 'Factura: ' + wizardCtx.invoiceNumber : ''}
      </div>`;
  }

  // Después de 2s, resetear wizard
  setTimeout(() => {
    wizardStep = 1;
    wizardCtx  = { name:'', subnameA:'', subnameB:'', code:'', category:'', size:'', color:'', design:'', aroma:'', buyPresentation:'', unitsPerPres:1, numPresentations:1, warehouse:'', entryDate:'', entryTime:'', invoiceNumber:'', invoiceDate:'', supplier:'', totalPaid:'', pricePublic:'', priceMajor:'', priceSpecial:'' };
    wizardRender();
  }, 2200);
}

/* Renderiza el wizard completo según el paso actual */
function wizardRender() {
  // Actualizar indicadores de paso
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const s = document.getElementById('wiz-step-' + i);
    if (!s) continue;
    s.className = 'step ' + (i < wizardStep ? 'done' : i === wizardStep ? 'active' : '');
  }
  // Mostrar panel correcto
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const p = document.getElementById('wiz-panel-' + i);
    if (p) p.style.display = i === wizardStep ? 'block' : 'none';
  }
  // Botones nav
  const btnBack = document.getElementById('wiz-btn-back');
  const btnNext = document.getElementById('wiz-btn-next');
  const btnConf = document.getElementById('wiz-btn-confirm');
  if (btnBack) btnBack.style.display = wizardStep > 1 ? 'inline-flex' : 'none';
  if (btnNext) btnNext.style.display = wizardStep < TOTAL_STEPS ? 'inline-flex' : 'none';
  if (btnConf) btnConf.style.display = wizardStep === TOTAL_STEPS ? 'inline-flex' : 'none';

  // Si llegamos al paso 4, llenar el resumen
  if (wizardStep === TOTAL_STEPS) renderWizardSummary();

  // Si cambia la categoría en paso 1, actualizar sub-filtros de wizard
  if (wizardStep === 1) {
    const catSel = document.getElementById('wiz-category');
    if (catSel) onWizardCategoryChange(catSel.value);
  }

  // En paso 2, actualizar presentaciones disponibles según categoría
  if (wizardStep === 2) updateWizardPresentations();
}

function renderWizardSummary() {
  // Recoger datos actuales de paso 3 si aún no se validó
  wizardCtx.pricePublic  = document.getElementById('wiz-pricePublic')?.value  || wizardCtx.pricePublic;
  wizardCtx.priceMajor   = document.getElementById('wiz-priceMajor')?.value   || wizardCtx.priceMajor;
  wizardCtx.priceSpecial = document.getElementById('wiz-priceSpecial')?.value || wizardCtx.priceSpecial;
  wizardCtx.invoiceNumber = document.getElementById('wiz-invoiceNum')?.value  || wizardCtx.invoiceNumber;
  wizardCtx.invoiceDate   = document.getElementById('wiz-invoiceDate')?.value || wizardCtx.invoiceDate;
  wizardCtx.supplier      = document.getElementById('wiz-supplier')?.value    || wizardCtx.supplier;
  wizardCtx.totalPaid     = document.getElementById('wiz-totalPaid')?.value   || wizardCtx.totalPaid;

  const total = wizardCtx.unitsPerPres * wizardCtx.numPresentations;
  const box = document.getElementById('wiz-confirm-summary');
  if (!box) return;
  box.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
      <div class="card">
        <div class="card-title">📋 Datos del producto</div>
        <table class="tbl" style="font-size:13px">
          <tr><td style="color:var(--muted);width:120px">Nombre</td><td><strong>${wizardCtx.name || '—'}</strong></td></tr>
          <tr><td style="color:var(--muted)">Sub-nombre A</td><td>${wizardCtx.subnameA || '—'}</td></tr>
          <tr><td style="color:var(--muted)">Sub-nombre B</td><td>${wizardCtx.subnameB || '—'}</td></tr>
          <tr><td style="color:var(--muted)">Código</td><td><span class="prod-code">${wizardCtx.code || 'Auto'}</span></td></tr>
          <tr><td style="color:var(--muted)">Categoría</td><td>${wizardCtx.category || '—'}</td></tr>
          <tr><td style="color:var(--muted)">Tamaño</td><td>${wizardCtx.size || '—'}</td></tr>
          <tr><td style="color:var(--muted)">Color</td><td>${wizardCtx.color || '—'}</td></tr>
          <tr><td style="color:var(--muted)">Diseño</td><td>${wizardCtx.design || '—'}</td></tr>
        </table>
      </div>
      <div class="card">
        <div class="card-title">📦 Inventario a ingresar</div>
        <table class="tbl" style="font-size:13px">
          <tr><td style="color:var(--muted);width:160px">Presentación compra</td><td><span class="pres-tag">${wizardCtx.buyPresentation || '—'}</span></td></tr>
          <tr><td style="color:var(--muted)">Uds. por presentación</td><td class="mono">${wizardCtx.unitsPerPres}</td></tr>
          <tr><td style="color:var(--muted)">Cantidad recibida</td><td class="mono">${wizardCtx.numPresentations} ${wizardCtx.buyPresentation || ''}(s)</td></tr>
          <tr><td style="color:var(--muted)">Bodega</td><td><span class="bodega-tag">${wizardCtx.warehouse || '—'}</span></td></tr>
          <tr><td style="color:var(--muted)">Fecha ingreso</td><td class="mono">${wizardCtx.entryDate || '—'} ${wizardCtx.entryTime || ''}</td></tr>
        </table>
        <div style="background:var(--employee-light);border-radius:8px;padding:12px;margin-top:12px">
          <div style="font-size:12px;color:var(--muted)">Total unidades a almacenar</div>
          <div style="font-size:26px;font-weight:800;font-family:'DM Mono',monospace;color:var(--employee)">${total}</div>
          <div style="font-size:11px;color:var(--muted)">${wizardCtx.numPresentations} × ${wizardCtx.unitsPerPres} uds.</div>
        </div>
      </div>
      <div class="card">
        <div class="card-title">🧾 Datos de factura</div>
        <table class="tbl" style="font-size:13px">
          <tr><td style="color:var(--muted);width:140px">N° Factura</td><td class="mono">${wizardCtx.invoiceNumber || '—'}</td></tr>
          <tr><td style="color:var(--muted)">Fecha factura</td><td class="mono">${wizardCtx.invoiceDate || '—'}</td></tr>
          <tr><td style="color:var(--muted)">Proveedor</td><td>${wizardCtx.supplier || '—'}</td></tr>
          <tr><td style="color:var(--muted)">Total pagado</td><td class="mono">${wizardCtx.totalPaid ? 'Q ' + wizardCtx.totalPaid : '—'}</td></tr>
        </table>
      </div>
      <div class="card">
        <div class="card-title">💰 Precios de venta</div>
        <table class="tbl" style="font-size:13px">
          <tr><td style="color:var(--muted);width:140px">💵 Público</td><td class="mono">${wizardCtx.pricePublic ? 'Q ' + wizardCtx.pricePublic : '—'}</td></tr>
          <tr><td style="color:var(--muted)">📦 Mayorista</td><td class="mono">${wizardCtx.priceMajor ? 'Q ' + wizardCtx.priceMajor : '—'}</td></tr>
          <tr><td style="color:var(--muted)">⭐ Especial</td><td class="mono">${wizardCtx.priceSpecial ? 'Q ' + wizardCtx.priceSpecial : '—'}</td></tr>
        </table>
      </div>
    </div>
    <div id="wiz-confirm-msg" style="margin-top:12px"></div>`;
}

/* Actualiza presentaciones en el paso 2 según la categoría elegida */
function updateWizardPresentations() {
  const sel  = document.getElementById('wiz-buyPres');
  if (!sel) return;
  const opts = CATEGORY_PRESENTATIONS[wizardCtx.category] || ['Caja','Saco','Unidad'];
  sel.innerHTML = opts.map(o => `<option value="${o}">${o}</option>`).join('');
  updateCalcUnits();
}

/* Recalcular total unidades en paso 2 */
function updateCalcUnits() {
  const u = parseInt(document.getElementById('wiz-unitsPerPres')?.value) || 0;
  const n = parseInt(document.getElementById('wiz-numPres')?.value)      || 0;
  const total = u * n;
  const el = document.getElementById('wiz-calc-total');
  const el2 = document.getElementById('wiz-calc-detail');
  const sel = document.getElementById('wiz-buyPres');
  const pres = sel ? sel.value : '';
  if (el)  el.textContent  = total + ' unidades';
  if (el2) el2.textContent = `${n} ${pres}(s) × ${u} uds. = ${total} en inventario`;

  // También actualizar unidades de venta disponibles
  const sellDiv = document.getElementById('wiz-sell-units');
  if (sellDiv && pres) {
    const units = SELL_UNITS[pres] || ['Unidad'];
    sellDiv.innerHTML = units.map((u,i) =>
      `<span class="unit-pill ${i===0?'active':''}" onclick="selectUnit(this)">${u}</span>`
    ).join('');
  }
}

/* Sub-filtros dinámicos del wizard paso 1 */
function onWizardCategoryChange(cat) {
  wizardCtx.category = cat;
  const container = document.getElementById('wiz-dynamic-filters');
  if (!container) return;
  const filters = CATEGORY_FILTERS[cat] || [];
  if (!filters.length) { container.innerHTML = ''; return; }
  container.innerHTML = filters.map(f => `
    <div class="inp-group">
      <label>${f.label}</label>
      <select id="${f.id}" onchange="syncWizardFilter('${f.id}','${f.label}')">
        ${f.opts.map(o => `<option value="${o}">${o}</option>`).join('')}
      </select>
    </div>`).join('');
}

function syncWizardFilter(id, label) {
  const val = document.getElementById(id)?.value;
  if (label === 'Color')  wizardCtx.color  = val;
  if (label === 'Tamaño') wizardCtx.size   = val;
  if (label === 'Diseño') wizardCtx.design = val;
  if (label === 'Aroma')  wizardCtx.aroma  = val;
  if (label === 'Tipo')   wizardCtx.subnameA = val;
  if (label === 'Peso')   wizardCtx.size   = val;
  if (label === 'Marca')  wizardCtx.subnameB = val;
}


/* ── 7. LÓGICA DE PRESENTACIONES ────────────
   Renderiza tabla de inventario con presentaciones
──────────────────────────────────────────────── */
function renderInventoryTable(tbodyId) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;

  tbody.innerHTML = inventory.map(p => {
    const status = p.unitStock === 0 ? 'danger' : p.unitStock < p.minStock ? 'warn' : 'ok';
    const statusLabel = { danger:'🔴 Agotado', warn:'🟡 Bajo', ok:'🟢 OK' }[status];
    const chipClass   = { danger:'chip-danger', warn:'chip-warn', ok:'chip-ok' }[status];

    // Sub-nombres visibles
    const subnames = [p.color, p.size, p.design].filter(Boolean).join(' · ');

    return `<tr>
      <td><span class="prod-code">${p.code}</span></td>
      <td>
        <strong>${p.name}</strong>
        ${subnames ? `<div style="font-size:11px;color:var(--muted);margin-top:2px">${subnames}</div>` : ''}
      </td>
      <td>${p.category}</td>
      <td>
        <span class="pres-tag">📦 ${p.buyPresentation}</span>
        <div style="font-size:11px;color:var(--muted);margin-top:3px">${p.unitsPerPresentation} uds/pres.</div>
      </td>
      <td>
        <span class="mono" style="font-size:15px;font-weight:700">${p.presentationsInStock}</span>
        <div style="font-size:11px;color:var(--muted)">${p.buyPresentation}(s)</div>
      </td>
      <td>
        <span class="mono" style="font-size:15px;font-weight:700">${p.unitStock}</span>
        <div style="font-size:11px;color:var(--muted)">uds. sueltas</div>
      </td>
      <td>${p.minStock}</td>
      <td><span class="bodega-tag">${p.warehouse}</span></td>
      <td class="mono">Q ${p.priceUnit.toFixed(2)}</td>
      <td><span class="chip ${chipClass}">${statusLabel}</span></td>
      <td>
        <div style="display:flex;gap:4px">
          <button class="btn btn-outline btn-sm" onclick="openPresBreakdown('${p.code}')">📦 Ver</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

/* Modal de desglose de presentación */
function openPresBreakdown(code) {
  const p = inventory.find(x => x.code === code);
  if (!p) return;
  const modal = document.getElementById('modal-pres-breakdown');
  const body  = document.getElementById('modal-pres-body');
  if (!modal || !body) return;

  const unitOptions = SELL_UNITS[p.buyPresentation] || ['Unidad'];

  body.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px">
      <div class="stat-card">
        <div class="s-icon">📦</div>
        <div class="s-val">${p.presentationsInStock}</div>
        <div class="s-label">${p.buyPresentation}(s) en bodega</div>
      </div>
      <div class="stat-card">
        <div class="s-icon">🔢</div>
        <div class="s-val">${p.unitStock}</div>
        <div class="s-label">Unidades sueltas disponibles</div>
      </div>
    </div>

    <div class="card" style="margin-bottom:14px;background:var(--owner-light);border-color:#AACBE8">
      <div class="card-title">📐 Cómo se calcula el inventario</div>
      <div style="font-size:13px;line-height:1.6">
        Se compraron <strong>${p.presentationsInStock} ${p.buyPresentation}(s)</strong>, cada una con
        <strong>${p.unitsPerPresentation} unidades</strong>.<br>
        El sistema guarda <strong>${p.unitStock} unidades</strong> disponibles para vender.<br>
        Al vender una <em>${p.buyPresentation} completa</em>, se descuentan <strong>${p.unitsPerPresentation} unidades</strong> del total.
      </div>
    </div>

    <div class="card-title">🛒 Se puede vender como:</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px">
      ${unitOptions.map(u => `<span class="unit-pill active">${u}</span>`).join('')}
    </div>

    <div class="card-title">💰 Precios</div>
    <table class="tbl" style="font-size:13px">
      <tr><td style="color:var(--muted);width:180px">💵 Precio por unidad suelta</td><td class="mono">Q ${p.priceUnit.toFixed(2)}</td></tr>
      <tr><td style="color:var(--muted)">${p.buyPresentation === 'Saco' ? '🛍 Precio por saco' : '📦 Precio por ' + p.buyPresentation.toLowerCase() + ' completa'}</td><td class="mono">Q ${p.priceBox.toFixed(2)}</td></tr>
    </table>`;

  modal.classList.add('open');
  document.getElementById('modal-pres-title').textContent = '📦 Presentación — ' + p.name;
}

/* Opciones de producto en el formulario de venta */
function renderSellProductOptions() {
  const dl = document.getElementById('sell-prod-list');
  if (!dl) return;
  dl.innerHTML = inventory.map(p =>
    `<option value="${p.name} (${p.code})">${p.name} — ${p.code}</option>`
  ).join('');
}

/* Al seleccionar un producto en la venta, mostrar las unidades disponibles */
function onSellProductSelect(inputEl) {
  const val = inputEl.value;
  const code = val.match(/\(([^)]+)\)/)?.[1];
  const p = inventory.find(x => x.code === code);
  const unitSel = document.getElementById('sell-unit-select');
  const stockInfo = document.getElementById('sell-stock-info');
  if (!unitSel) return;

  if (p) {
    const units = SELL_UNITS[p.buyPresentation] || ['Unidad'];
    unitSel.innerHTML = units.map(u => `<option>${u}</option>`).join('');
    if (stockInfo) {
      const status = p.unitStock === 0 ? 'danger' : p.unitStock < p.minStock ? 'warn' : 'ok';
      const colors = { danger:'var(--danger)', warn:'var(--warn)', ok:'var(--ok)' };
      stockInfo.innerHTML = `<span style="color:${colors[status]};font-size:12px;font-weight:600">
        ${p.unitStock === 0 ? '❌ Agotado' : `✅ ${p.unitStock} uds disponibles · ${p.presentationsInStock} ${p.buyPresentation}(s)`}
      </span>`;
    }
  } else {
    unitSel.innerHTML = '<option>Unidad</option>';
    if (stockInfo) stockInfo.innerHTML = '';
  }
}

/* ── 8. CATEGORÍAS DINÁMICAS (filtro en tablas) ──
   Cuando se cambia la categoría en los filtros de
   inventario o búsqueda, los sub-filtros cambian.
──────────────────────────────────────────────── */
function onCategoryFilterChange(selectEl, targetContainerId) {
  const cat = selectEl.value;
  const container = document.getElementById(targetContainerId);
  if (!container) return;

  const filters = CATEGORY_FILTERS[cat] || [];
  if (!filters.length) {
    container.innerHTML = '<div style="font-size:12px;color:var(--muted);padding:8px 0">Selecciona una categoría para ver filtros adicionales.</div>';
    return;
  }

  container.innerHTML = filters.map(f => `
    <div class="inp-group">
      <label>${f.label}</label>
      <select style="min-width:110px" onchange="applyDynFilter()">
        ${f.opts.map(o => `<option value="${o}">${o}</option>`).join('')}
      </select>
    </div>`).join('');
}

/* Placeholder — en producción filtraría la tabla */
function applyDynFilter() { /* filtra tabla según selects dinámicos */ }

/* ── 9. HELPERS ─────────────────────────────── */
function setDateRange(range, el) {
  document.querySelectorAll('.quick-range-btn').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
}

function savePrice(btnEl) {
  const orig = btnEl.textContent;
  btnEl.textContent = '✅ Guardado'; btnEl.disabled = true;
  setTimeout(() => { btnEl.textContent = orig; btnEl.disabled = false; }, 1600);
}

function sendEmailConfirm() {
  const btn = document.getElementById('btn-send-email');
  if (!btn) return;
  btn.textContent = '⏳ Enviando…'; btn.disabled = true;
  setTimeout(() => {
    btn.textContent = '✅ Correo enviado';
    btn.classList.remove('btn-owner'); btn.classList.add('btn-outline');
    setTimeout(() => closeModal('modal-email'), 1400);
  }, 1200);
}

function selectUnit(pill) {
  pill.closest('.unit-pills').querySelectorAll('.unit-pill').forEach(p => p.classList.remove('active'));
  pill.classList.add('active');
}

function exportKardex(format) {
  const btn = event.target;
  const orig = btn.textContent;
  btn.textContent = '⏳ Generando…'; btn.disabled = true;
  setTimeout(() => {
    btn.textContent = '✅ ' + format.toUpperCase() + ' listo';
    setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 1800);
  }, 1000);
}

/* Init al cargar la página */
document.addEventListener('DOMContentLoaded', () => {
  // El wizard empieza en paso 1 con panel 1 visible
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const p = document.getElementById('wiz-panel-' + i);
    if (p) p.style.display = i === 1 ? 'block' : 'none';
  }
});