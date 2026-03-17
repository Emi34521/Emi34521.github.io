/* ════════════════════════════════════════════════
   StoreOS — Cliente v4.5 · customer.js
   1. Estado y datos
   2. Login / logout
   3. Navegación de vistas y tabs
   4. Modales
   5. Lógica del carrito mayorista
   6. Seguimiento de entregas
════════════════════════════════════════════════ */

/* ── 1. ESTADO Y DATOS ───────────────────────── */

let currentCustomerType = 'retail'; // 'retail' | 'wholesale'
let cart = []; // { name, qty, unitPrice, subtotal }

const DISCOUNT_TIERS = [
  { min: 5000, pct: 15 },
  { min: 2000, pct: 10 },
  { min: 500,  pct: 5  },
];

/* Pedidos de ejemplo para el seguimiento */
const sampleOrders = [
  {
    id: '#PED-0042',
    date: '10/03/2026',
    total: 'Q 553.00',
    items: 'Jabón Dove ×20, Sal ×30, Frijol ×15',
    deliveryType: 'entrega', // 'entrega' | 'recogida'
    address: 'Zona 3, 6a Calle 12-45',
    status: 'en_camino', // confirmado | preparando | en_camino | entregado
    steps: [
      { label: 'Pedido confirmado',    sub: 'Tu pedido fue recibido',          time: '10/03 09:14', done: true  },
      { label: 'Preparando pedido',    sub: 'Empacando productos en bodega',   time: '10/03 10:30', done: true  },
      { label: 'En camino',            sub: 'El repartidor está en ruta',      time: '10/03 11:45', active: true },
      { label: 'Entregado',            sub: 'Pedido completado',               time: '—',           done: false },
    ],
  },
  {
    id: '#PED-0039',
    date: '05/03/2026',
    total: 'Q 890.00',
    items: 'Aceite Ideal ×5, Café ×10, Arroz ×20',
    deliveryType: 'recogida',
    address: 'Recogida en local',
    status: 'entregado',
    steps: [
      { label: 'Pedido confirmado',  sub: 'Tu pedido fue recibido',       time: '05/03 08:00', done: true },
      { label: 'Preparando pedido',  sub: 'Empacando en bodega',          time: '05/03 09:15', done: true },
      { label: 'Listo para recoger', sub: 'Puedes pasar al local',        time: '05/03 10:00', done: true },
      { label: 'Recogido',           sub: 'Pedido completado',            time: '05/03 10:45', done: true },
    ],
  },
];


/* ── 2. LOGIN / LOGOUT ───────────────────────── */

function selectCustomerType(type, el) {
  currentCustomerType = type;
  document.querySelectorAll('.ctype-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  const btn = document.getElementById('clogin-btn');
  if (btn) btn.textContent = type === 'wholesale'
    ? 'Entrar al portal mayorista →'
    : 'Ver catálogo →';
}

function customerLogin() {
  document.getElementById('screen-customer-login').style.display = 'none';
  document.getElementById('app-customer').style.display = 'block';
  showStoreView(currentCustomerType);
}

function customerLogout() {
  document.getElementById('app-customer').style.display = 'none';
  document.getElementById('screen-customer-login').style.display = 'flex';
  cart = [];
  renderCart();
}


/* ── 3. NAVEGACIÓN ───────────────────────────── */

function showStoreView(type) {
  currentCustomerType = type;

  // Cambiar clase del topbar y del app-customer
  const topbar = document.getElementById('store-topbar');
  const app    = document.getElementById('app-customer');
  if (topbar) {
    topbar.className = 'store-topbar ' + (type === 'wholesale' ? 'wholesale' : 'retail');
  }
  if (app) app.className = 'store-app ' + type;

  // Paneles
  document.querySelectorAll('.store-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById('panel-' + type);
  if (panel) panel.classList.add('active');

  // Badge
  const badge = document.getElementById('store-type-badge');
  if (badge) badge.textContent = type === 'wholesale' ? '🏭 Mayorista' : '🛍️ Detalle';

  // Nav
  const nav = document.getElementById('store-nav');
  if (!nav) return;
  if (type === 'wholesale') {
    nav.innerHTML = `
      <button class="store-nav-item active" onclick="showWholesaleTab('tab-inventory',this)">📋 Inventario</button>
      <button class="store-nav-item"        onclick="showWholesaleTab('tab-pedido',this)">📝 Hacer pedido</button>
      <button class="store-nav-item"        onclick="showWholesaleTab('tab-entregas',this)">🚚 Mis entregas</button>`;
  } else {
    nav.innerHTML = `
      <button class="store-nav-item active" onclick="showRetailTab('tab-catalogo',this)">🛒 Catálogo</button>
      <button class="store-nav-item"        onclick="showRetailTab('tab-promos',this)">🏷️ Promociones</button>`;
  }
}

function showRetailTab(tabId, btnEl) {
  document.querySelectorAll('#panel-retail .retail-tab-panel').forEach(p => p.classList.remove('active'));
  const t = document.getElementById(tabId);
  if (t) t.classList.add('active');
  document.querySelectorAll('#store-nav .store-nav-item').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
}

function showWholesaleTab(tabId, btnEl) {
  document.querySelectorAll('#panel-wholesale .wholesale-tab-panel').forEach(p => p.classList.remove('active'));
  const t = document.getElementById(tabId);
  if (t) t.classList.add('active');
  document.querySelectorAll('#store-nav .store-nav-item').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
}

/* Tabs del formulario de pedido */
function showOrderTab(tabId, btnEl) {
  document.querySelectorAll('.order-tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.order-tab').forEach(b => b.classList.remove('active'));
  const t = document.getElementById(tabId);
  if (t) t.classList.add('active');
  if (btnEl) btnEl.classList.add('active');
}

/* Tipo de pedido: entrega a domicilio vs recogida */
function selectDeliveryType(type) {
  const entrega  = document.getElementById('section-entrega');
  const recogida = document.getElementById('section-recogida');
  document.querySelectorAll('.delivery-type-btn').forEach(b => b.classList.remove('active'));
  const activeBtn = document.getElementById('btn-' + type);
  if (activeBtn) activeBtn.classList.add('active');
  if (entrega)  entrega.style.display  = type === 'entrega'  ? 'grid' : 'none';
  if (recogida) recogida.style.display = type === 'recogida' ? 'grid' : 'none';
}


/* ── 4. MODALES ──────────────────────────────── */

function openModal(id)  { const m = document.getElementById(id); if (m) m.classList.add('open'); }
function closeModal(id) { const m = document.getElementById(id); if (m) m.classList.remove('open'); }

document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('open');
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
});


/* ── 5. CARRITO MAYORISTA ────────────────────── */

function addToCart(name, unitPrice, maxStock) {
  const existing = cart.find(i => i.name === name);
  if (maxStock === 0) return;
  if (existing) {
    if (existing.qty >= maxStock) return;
    existing.qty++;
    existing.subtotal = existing.qty * existing.unitPrice;
  } else {
    cart.push({ name, qty: 1, unitPrice, subtotal: unitPrice });
  }
  renderCart();
}

function renderCart() {
  const container = document.getElementById('cart-items');
  const emptyMsg  = document.getElementById('cart-empty');
  const totalRow  = document.getElementById('cart-total-row');
  const discMsg   = document.getElementById('discount-msg');

  if (!container) return;

  if (!cart.length) {
    container.innerHTML = '';
    if (emptyMsg)  emptyMsg.style.display  = 'block';
    if (totalRow)  totalRow.style.display  = 'none';
    if (discMsg)   discMsg.style.display   = 'none';
    updateCartBadge(0);
    return;
  }

  if (emptyMsg) emptyMsg.style.display = 'none';
  if (totalRow) totalRow.style.display = 'flex';

  container.innerHTML = cart.map((item, i) => `
    <div class="cart-row">
      <div>
        <div class="cr-name">${item.name}</div>
        <div class="cr-qty">×${item.qty} unidades</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <span class="cr-val">Q ${item.subtotal.toFixed(2)}</span>
        <button onclick="removeFromCart(${i})" style="background:none;border:none;cursor:pointer;font-size:14px;color:#C0392B">✕</button>
      </div>
    </div>`).join('');

  const subtotal = cart.reduce((a, i) => a + i.subtotal, 0);
  const tier     = DISCOUNT_TIERS.find(t => subtotal >= t.min);
  const discount = tier ? subtotal * tier.pct / 100 : 0;
  const total    = subtotal - discount;

  const totalEl = document.getElementById('cart-total-val');
  if (totalEl) totalEl.textContent = 'Q ' + total.toFixed(2);

  if (discMsg) {
    if (tier) {
      discMsg.style.display = 'block';
      discMsg.textContent   = `✅ Descuento ${tier.pct}% aplicado — ahorras Q ${discount.toFixed(2)}`;
    } else {
      const next = [...DISCOUNT_TIERS].reverse().find(t => subtotal < t.min);
      if (next) {
        discMsg.style.display = 'block';
        discMsg.textContent   = `💡 Agrega Q ${(next.min - subtotal).toFixed(2)} más para obtener ${next.pct}% de descuento`;
        discMsg.style.background = '#FEF3DC';
        discMsg.style.color      = '#7A5300';
      } else {
        discMsg.style.display = 'none';
      }
    }
  }

  updateCartBadge(cart.reduce((a, i) => a + i.qty, 0));
}

function removeFromCart(idx) {
  cart.splice(idx, 1);
  renderCart();
}

function updateCartBadge(n) {
  const badge = document.getElementById('cart-badge');
  if (badge) badge.textContent = n;
}


/* ── 6. SEGUIMIENTO DE ENTREGAS ──────────────── */

function renderDeliveries() {
  const container = document.getElementById('deliveries-container');
  if (!container) return;

  container.innerHTML = sampleOrders.map(order => {
    const statusMap = {
      confirmado: { label: 'Confirmado',   chip: 'chip-blue'    },
      preparando: { label: 'Preparando',   chip: 'chip-warn'    },
      en_camino:  { label: 'En camino',    chip: 'chip-pending' },
      listo:      { label: 'Listo para recoger', chip: 'chip-warn' },
      entregado:  { label: 'Entregado',    chip: 'chip-ok'      },
    };
    const st = statusMap[order.status] || { label: order.status, chip: 'chip-blue' };

    const stepsHtml = order.steps.map(step => {
      const cls = step.done ? 'done' : step.active ? 'active' : 'pending';
      const icon = step.done ? '✓' : step.active ? '●' : '○';
      return `
        <div class="dt-step ${cls === 'active' ? 'active' : ''}">
          <div class="dt-dot ${cls}">${icon}</div>
          <div class="dt-label">${step.label}</div>
          <div class="dt-sub">${step.sub}</div>
          ${step.time !== '—' ? `<div class="dt-time">${step.time}</div>` : ''}
        </div>`;
    }).join('');

    const typeIcon = order.deliveryType === 'recogida' ? '🏪' : '🚚';
    const typeLabel = order.deliveryType === 'recogida' ? 'Recogida en local' : 'Entrega a domicilio';

    return `
      <div class="delivery-card">
        <div class="delivery-card-header">
          <div>
            <div class="delivery-order-num">${order.id}</div>
            <div class="delivery-date">${order.date} · ${typeIcon} ${typeLabel}</div>
            <div style="font-size:12px;color:var(--wholesale-muted);margin-top:3px">${order.items}</div>
          </div>
          <div style="text-align:right">
            <span class="chip ${st.chip}">${st.label}</span>
            <div style="font-size:14px;font-weight:700;font-family:'DM Mono',monospace;margin-top:6px">${order.total}</div>
          </div>
        </div>
        <div class="delivery-timeline">${stepsHtml}</div>
      </div>`;
  }).join('');
}

/* Init al cargar */
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  renderDeliveries();
  // Mostrar sección de entrega por defecto en el formulario
  const recSec = document.getElementById('section-recogida');
  if (recSec) recSec.style.display = 'none';
});