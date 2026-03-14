/* ════════════════════════════════════════════════
   StoreOS — Prototipo 4 · app.js
   Cambios vs v3:
   - Wizard enriquecido con campos del ERP
     (código OEM, clasificaciones, marca, tecla búsqueda,
      % utilidad, costos, equivalencia inventario, fecha oferta)
   - Pantalla de facturación con:
       * búsqueda de producto con múltiples presentaciones
       * selector de unidad de medida al facturar
       * tabla de ítems editable
       * formas de pago interactivas (efectivo, cheque, tarjetas)
       * cálculo automático de vuelto / pendiente
════════════════════════════════════════════════ */

/* ── DATOS ───────────────────────────────────── */

const CATEGORY_FILTERS = {
  'Todas': [],
  'Granos': [
    { id:'cf-tipo',  label:'Tipo',  opts:['Todos','Arroz','Frijol','Maíz','Azúcar','Lenteja'] },
    { id:'cf-peso',  label:'Peso',  opts:['Todos','1lb','5lb','10lb','50lb','100lb'] },
    { id:'cf-marca', label:'Marca', opts:['Todas','Guatelinda','Brillante','Sin marca'] },
  ],
  'Aceites': [
    { id:'cf-tipo',   label:'Tipo',   opts:['Todos','Vegetal','Oliva','Girasol','Manteca'] },
    { id:'cf-tamaño', label:'Tamaño', opts:['Todos','500ml','1L','2L','Galón (4L)'] },
    { id:'cf-marca',  label:'Marca',  opts:['Todas','Ideal','Ina','Mazola'] },
  ],
  'Velas': [
    { id:'cf-color',  label:'Color',  opts:['Todos','Blanca','Roja','Verde','Azul','Beige','Morada'] },
    { id:'cf-tamaño', label:'Tamaño', opts:['Todos','10cm','15cm','20cm','30cm','Votiva'] },
    { id:'cf-diseño', label:'Diseño', opts:['Todos','Lisa','San Judas','Virgen','Navidad','Corazón'] },
    { id:'cf-aroma',  label:'Aroma',  opts:['Todos','Sin aroma','Lavanda','Vainilla','Canela'] },
  ],
  'Higiene': [
    { id:'cf-tipo',  label:'Tipo',  opts:['Todos','Jabón','Shampoo','Desodorante','Pasta dental'] },
    { id:'cf-marca', label:'Marca', opts:['Todas','Dove','Colgate','Palmolive','Suave'] },
  ],
  'Bebidas': [
    { id:'cf-tipo',   label:'Tipo',   opts:['Todos','Café','Té','Refresco','Agua','Jugo'] },
    { id:'cf-tamaño', label:'Tamaño', opts:['Todos','250g','500g','1kg','350ml','500ml','1L'] },
    { id:'cf-marca',  label:'Marca',  opts:['Todas','Montaña','Café Quetzal','Lipton'] },
  ],
  'Condimentos': [
    { id:'cf-tipo', label:'Tipo', opts:['Todos','Sal','Pimienta','Consomé','Azafrán','Sazón'] },
    { id:'cf-peso', label:'Peso', opts:['Todos','100g','250g','500g','1kg'] },
  ],
  'Harinas': [
    { id:'cf-tipo',  label:'Tipo',  opts:['Todos','Maíz','Trigo','Arroz','Integral'] },
    { id:'cf-peso',  label:'Peso',  opts:['Todos','500g','1kg','2kg','5kg'] },
    { id:'cf-marca', label:'Marca', opts:['Todas','Maseca','Selecta','Robin Hood'] },
  ],
};

const CATEGORY_PRESENTATIONS = {
  'Granos':      ['Saco','Bolsa','Caja','Unidad'],
  'Aceites':     ['Caja','Galón','Botella','Cubeta'],
  'Velas':       ['Caja','Paquete','Unidad'],
  'Higiene':     ['Caja','Paquete','Unidad'],
  'Bebidas':     ['Caja','Paquete','Botella','Unidad'],
  'Condimentos': ['Caja','Bolsa','Frasco','Unidad'],
  'Harinas':     ['Saco','Bolsa','Caja','Unidad'],
};

const SELL_UNITS = {
  'Caja':    ['Caja completa','Unidad suelta'],
  'Saco':    ['Saco completo','Libra','Kilo'],
  'Galón':   ['Galón completo','Botella (1L)','Medio galón'],
  'Paquete': ['Paquete completo','Unidad suelta'],
  'Botella': ['Botella'],
  'Bolsa':   ['Bolsa completa','Unidad suelta'],
  'Cubeta':  ['Cubeta completa','Litro'],
  'Frasco':  ['Frasco'],
  'Unidad':  ['Unidad'],
};

/* Inventario base — cada entrada tiene múltiples presentaciones disponibles */
const inventory = [
  {
    code:'ACE-002', codeOEM:'PROD01002', name:'Aceite Ideal', category:'Aceites',
    brand:'Ideal', clasif1:'Aceites vegetales', clasif2:'Líquidos', clasif3:'',
    presentations:[
      { unit:'Botella', unitsPer:1, stock:60, minStock:20, pricePublic:38.50, priceMajor:34.00, priceSpecial:31.00, costQ:28.00 },
      { unit:'Caja',    unitsPer:12, stock:5, minStock:3,  pricePublic:420.00, priceMajor:380.00, priceSpecial:360.00, costQ:320.00 },
    ],
    warehouse:'Principal', size:'1L', color:null, design:null,
    ivaPct:12, maxDiscount:5, useExpiryDate:false,
  },
  {
    code:'VEL-010', codeOEM:'VEL10', name:'Vela San Judas 20cm', category:'Velas',
    brand:'Sinovela', clasif1:'Velas', clasif2:'San Judas', clasif3:'20cm',
    presentations:[
      { unit:'Unidad',  unitsPer:1,  stock:72, minStock:20, pricePublic:5.00,   priceMajor:4.20,  priceSpecial:3.80,  costQ:2.50 },
      { unit:'Caja',    unitsPer:24, stock:3,  minStock:2,  pricePublic:110.00, priceMajor:96.00, priceSpecial:88.00, costQ:58.00 },
    ],
    warehouse:'Sur', size:'20cm', color:'Beige', design:'San Judas',
    ivaPct:12, maxDiscount:10, useExpiryDate:false,
  },
  {
    code:'VEL-011', codeOEM:'VEL11', name:'Vela San Judas 15cm', category:'Velas',
    brand:'Sinovela', clasif1:'Velas', clasif2:'San Judas', clasif3:'15cm',
    presentations:[
      { unit:'Unidad',  unitsPer:1,  stock:96, minStock:20, pricePublic:3.50,  priceMajor:3.00,  priceSpecial:2.70,  costQ:1.80 },
      { unit:'Caja',    unitsPer:24, stock:4,  minStock:2,  pricePublic:78.00, priceMajor:68.00, priceSpecial:62.00, costQ:42.00 },
    ],
    warehouse:'Sur', size:'15cm', color:'Blanca', design:'San Judas',
    ivaPct:12, maxDiscount:10, useExpiryDate:false,
  },
  {
    code:'AZU-001', codeOEM:'GUA001', name:'Azúcar', category:'Granos',
    brand:'Guatelinda', clasif1:'Endulzantes', clasif2:'', clasif3:'',
    presentations:[
      { unit:'Saco',  unitsPer:1, stock:0, minStock:10, pricePublic:120.00, priceMajor:108.00, priceSpecial:100.00, costQ:95.00 },
      { unit:'Libra', unitsPer:1, stock:0, minStock:50, pricePublic:3.00,   priceMajor:2.70,   priceSpecial:2.50,   costQ:1.90 },
    ],
    warehouse:'Principal', size:'50lb', color:null, design:null,
    ivaPct:0, maxDiscount:5, useExpiryDate:false,
  },
  {
    code:'ARR-003', codeOEM:'BRI003', name:'Arroz Brillante', category:'Granos',
    brand:'Brillante', clasif1:'Granos cocción', clasif2:'', clasif3:'',
    presentations:[
      { unit:'Libra',   unitsPer:1,   stock:8,  minStock:15, pricePublic:7.50,  priceMajor:7.00,  priceSpecial:6.50,  costQ:5.00 },
      { unit:'Saco',    unitsPer:100, stock:1,  minStock:2,  pricePublic:680.00,priceMajor:640.00,priceSpecial:610.00,costQ:490.00 },
    ],
    warehouse:'Norte', size:'1lb', color:null, design:null,
    ivaPct:0, maxDiscount:3, useExpiryDate:false,
  },
];

/* ── ESTADO DE FACTURACIÓN ───────────────────── */
let invoiceItems  = [];       // { prod, pres, qty, unitPrice, subtotal }
let invoiceNumber = 7811;
let selectedPaymentMethod = null;

/* ── ROLES / LOGIN ───────────────────────────── */
let currentRole    = 'owner';
let currentSubRole = 'cajero';

function selectRole(role, el) {
  document.querySelectorAll('.role-btn').forEach(b => b.className='role-btn');
  const m={owner:'active-owner',employee:'active-employee',customer:'active-customer'};
  el.classList.add(m[role]);
  currentRole = role;
  const sr = document.getElementById('subrole-row');
  if (sr) sr.style.display = role==='employee' ? 'flex' : 'none';
  const btn = document.getElementById('login-btn');
  btn.textContent = {owner:'Ingresar como Dueño →',employee:'Ingresar como Colaborador →',customer:'Ver catálogo →'}[role];
  btn.className   = 'btn-login '+{owner:'',employee:'emp',customer:'cust'}[role];
}

function selectSubRole(role, el) {
  currentSubRole = role;
  document.querySelectorAll('.subrole-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
}

function login() {
  document.getElementById('screen-login').style.display='none';
  const map={owner:'app-owner',employee:'app-employee',customer:'app-customer'};
  document.getElementById(map[currentRole]).classList.add('active');
  if (currentRole==='employee') {
    const badge=document.getElementById('collab-role-badge');
    const names={cajero:'🧾 Cajero',bodeguero:'📦 Bodeguero',supervisor:'🔑 Supervisor'};
    if (badge) badge.textContent=names[currentSubRole];
    const rt=document.getElementById('emp-nav-register');
    if (rt) rt.style.display=currentSubRole!=='cajero'?'flex':'none';
    const pt=document.getElementById('emp-nav-prices');
    if (pt) pt.style.display=currentSubRole==='supervisor'?'flex':'none';
  }
  renderInventoryTable('inv-table-body');
  renderInventoryTable('emp-inv-table-body');
  renderProdSearchTable('');
  updateInvoiceHeader();
}

function logout() {
  document.querySelectorAll('.app').forEach(a=>a.classList.remove('active'));
  document.getElementById('screen-login').style.display='flex';
  invoiceItems=[]; selectedPaymentMethod=null;
  renderInvoiceItems();
  const eb=document.getElementById('btn-send-email');
  if (eb){eb.textContent='📧 Enviar';eb.disabled=false;eb.className='btn btn-owner';}
}

/* ── NAVEGACIÓN ──────────────────────────────── */
function showPanel(app, panelId, btnEl) {
  const sel=app==='owner'?'#app-owner':'#app-employee';
  const prefix=app==='owner'?'owner':'emp';
  document.querySelectorAll(sel+' > .main > .panel').forEach(p=>p.classList.remove('active'));
  const t=document.getElementById(prefix+'-'+panelId);
  if (t) t.classList.add('active');
  if (btnEl){
    btnEl.closest('nav').querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
    btnEl.classList.add('active');
  }
}

function showSubTab(groupId, tabId, btnEl) {
  const g=document.getElementById(groupId);
  if (!g) return;
  g.querySelectorAll('.sub-panel').forEach(p=>p.classList.remove('active'));
  g.querySelectorAll('.sub-tab').forEach(b=>b.classList.remove('active'));
  const t=document.getElementById(tabId);
  if (t) t.classList.add('active');
  if (btnEl) btnEl.classList.add('active');
}

function showErpTab(groupId, tabId, btnEl) {
  const g=document.getElementById(groupId);
  if (!g) return;
  g.querySelectorAll('.erp-panel').forEach(p=>p.classList.remove('active'));
  g.querySelectorAll('.erp-tab').forEach(b=>b.classList.remove('active'));
  const t=document.getElementById(tabId);
  if (t) t.classList.add('active');
  if (btnEl) btnEl.classList.add('active');
}

/* ── MODALES ─────────────────────────────────── */
function openModal(id)  { const m=document.getElementById(id); if(m) m.classList.add('open'); }
function closeModal(id) { const m=document.getElementById(id); if(m) m.classList.remove('open'); }
document.addEventListener('click', e=>{ if(e.target.classList.contains('modal-overlay')) e.target.classList.remove('open'); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape') document.querySelectorAll('.modal-overlay.open').forEach(m=>m.classList.remove('open')); });

/* ── WIZARD 4 PASOS ──────────────────────────── */
let wizardStep = 1;
const TOTAL_STEPS = 4;
let wizardCtx = {};

function wizardReset() {
  wizardCtx = {
    name:'',subnameA:'',subnameB:'',code:'',codeOEM:'',category:'',brand:'',
    clasif1:'',clasif2:'',clasif3:'',size:'',color:'',design:'',aroma:'',
    buyPresentation:'',unitsPerPres:1,numPresentations:1,
    warehouse:'',entryDate:'',entryTime:'',
    invoiceNumber:'',invoiceDate:'',supplier:'',totalPaid:'',
    pricePublic:'',priceMajor:'',priceSpecial:'',priceOffer:'',
    pctUtility:'',costQ:'',eqInventory:1,
    ivaPct:'12',maxDiscount:'0',
    useExpiry:false,highlighted:false,
  };
}

function wizardNext() {
  if (!wizardValidateStep(wizardStep)) return;
  if (wizardStep < TOTAL_STEPS) { wizardStep++; wizardRender(); }
}
function wizardBack() {
  if (wizardStep > 1) { wizardStep--; wizardRender(); }
}

function wizardValidateStep(step) {
  if (step===1) {
    const n=document.getElementById('wiz-name');
    const c=document.getElementById('wiz-category');
    if (n && !n.value.trim()) { n.style.borderColor='var(--danger)'; n.focus(); return false; }
    if (n) n.style.borderColor='';
    if (c && !c.value) { c.style.borderColor='var(--danger)'; return false; }
    if (c) c.style.borderColor='';
    // Guardar todo el paso 1
    const g=id=>document.getElementById(id)?.value||'';
    const chk=id=>document.getElementById(id)?.checked||false;
    Object.assign(wizardCtx,{
      name:g('wiz-name'),codeOEM:g('wiz-codeOEM'),code:g('wiz-code'),
      category:g('wiz-category'),brand:g('wiz-brand'),size:g('wiz-size'),
      clasif1:g('wiz-clasif1'),clasif2:g('wiz-clasif2'),clasif3:g('wiz-clasif3'),
      subnameA:g('wiz-subnameA'),subnameB:g('wiz-subnameB'),
      color:g('wiz-color-val'),design:g('wiz-design-val'),
      ivaPct:g('wiz-iva'),maxDiscount:g('wiz-maxdiscount'),
      useExpiry:chk('wiz-useExpiry'),highlighted:chk('wiz-highlighted'),
    });
  }
  if (step===2) {
    const g=id=>document.getElementById(id)?.value||'';
    Object.assign(wizardCtx,{
      buyPresentation:g('wiz-buyPres'),
      unitsPerPres:parseInt(g('wiz-unitsPerPres'))||1,
      numPresentations:parseInt(g('wiz-numPres'))||1,
      eqInventory:parseFloat(g('wiz-eqInv'))||1,
      warehouse:g('wiz-warehouse'),
      entryDate:g('wiz-entryDate'),entryTime:g('wiz-entryTime'),
    });
  }
  if (step===3) {
    const g=id=>document.getElementById(id)?.value||'';
    Object.assign(wizardCtx,{
      invoiceNumber:g('wiz-invoiceNum'),invoiceDate:g('wiz-invoiceDate'),
      supplier:g('wiz-supplier'),totalPaid:g('wiz-totalPaid'),
      costQ:g('wiz-costQ'),pctUtility:g('wiz-pctUtility'),
      pricePublic:g('wiz-pricePublic'),priceMajor:g('wiz-priceMajor'),
      priceSpecial:g('wiz-priceSpecial'),priceOffer:g('wiz-priceOffer'),
      offerDateFrom:g('wiz-offerFrom'),offerDateTo:g('wiz-offerTo'),
    });
  }
  return true;
}

function wizardRender() {
  for (let i=1;i<=TOTAL_STEPS;i++) {
    const s=document.getElementById('wiz-step-'+i);
    if (s) s.className='step '+(i<wizardStep?'done':i===wizardStep?'active':'');
    const p=document.getElementById('wiz-panel-'+i);
    if (p) p.style.display=i===wizardStep?'block':'none';
  }
  const bb=document.getElementById('wiz-btn-back');
  const bn=document.getElementById('wiz-btn-next');
  const bc=document.getElementById('wiz-btn-confirm');
  if (bb) bb.style.display=wizardStep>1?'inline-flex':'none';
  if (bn) bn.style.display=wizardStep<TOTAL_STEPS?'inline-flex':'none';
  if (bc) bc.style.display=wizardStep===TOTAL_STEPS?'inline-flex':'none';
  if (wizardStep===TOTAL_STEPS) renderWizardSummary();
  if (wizardStep===1) onWizardCategoryChange(document.getElementById('wiz-category')?.value||'');
  if (wizardStep===2) updateWizardPresentations();
}

function wizardConfirm() {
  const total = wizardCtx.unitsPerPres * wizardCtx.numPresentations;
  const newProd = {
    code: wizardCtx.code||('PRD-'+String(inventory.length+1).padStart(3,'0')),
    codeOEM: wizardCtx.codeOEM||'',
    name: wizardCtx.name+(wizardCtx.subnameA?' '+wizardCtx.subnameA:'')+(wizardCtx.subnameB?' '+wizardCtx.subnameB:''),
    category: wizardCtx.category, brand: wizardCtx.brand,
    clasif1: wizardCtx.clasif1, clasif2: wizardCtx.clasif2, clasif3: wizardCtx.clasif3,
    presentations:[{
      unit: wizardCtx.buyPresentation,
      unitsPer: wizardCtx.unitsPerPres,
      stock: total,
      minStock: 10,
      pricePublic: parseFloat(wizardCtx.pricePublic)||0,
      priceMajor:  parseFloat(wizardCtx.priceMajor)||0,
      priceSpecial:parseFloat(wizardCtx.priceSpecial)||0,
      costQ: parseFloat(wizardCtx.costQ)||0,
    }],
    warehouse: wizardCtx.warehouse,
    size: wizardCtx.size, color: wizardCtx.color||null, design: wizardCtx.design||null,
    ivaPct: parseFloat(wizardCtx.ivaPct)||12,
    maxDiscount: parseFloat(wizardCtx.maxDiscount)||0,
  };
  inventory.push(newProd);
  renderInventoryTable('inv-table-body');
  renderInventoryTable('emp-inv-table-body');
  renderProdSearchTable('');

  const msg=document.getElementById('wiz-confirm-msg');
  if (msg) msg.innerHTML=`<div class="alert-banner alert-ok" style="margin-bottom:0">✅ <strong>${newProd.name}</strong> registrado. ${total} unidades en ${newProd.warehouse||'bodega'}.</div>`;
  setTimeout(()=>{ wizardStep=1; wizardReset(); wizardRender(); }, 2200);
}

function renderWizardSummary() {
  // Recoger datos pendientes del paso 3 si no se validó
  const g=id=>document.getElementById(id)?.value||'';
  if (!wizardCtx.pricePublic) {
    Object.assign(wizardCtx,{
      invoiceNumber:g('wiz-invoiceNum'),invoiceDate:g('wiz-invoiceDate'),
      supplier:g('wiz-supplier'),totalPaid:g('wiz-totalPaid'),
      costQ:g('wiz-costQ'),pctUtility:g('wiz-pctUtility'),
      pricePublic:g('wiz-pricePublic'),priceMajor:g('wiz-priceMajor'),
      priceSpecial:g('wiz-priceSpecial'),priceOffer:g('wiz-priceOffer'),
    });
  }
  const total = wizardCtx.unitsPerPres * wizardCtx.numPresentations;
  const box=document.getElementById('wiz-confirm-summary');
  if (!box) return;
  box.innerHTML=`
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
    <div class="card">
      <div class="card-title">📋 Identificación</div>
      <table class="tbl" style="font-size:12px">
        <tr><td style="color:var(--muted);width:130px">Nombre</td><td><strong>${wizardCtx.name||'—'}</strong></td></tr>
        <tr><td style="color:var(--muted)">Código</td><td><span class="prod-code">${wizardCtx.code||'Auto'}</span></td></tr>
        <tr><td style="color:var(--muted)">Código OEM</td><td><span class="prod-code">${wizardCtx.codeOEM||'—'}</span></td></tr>
        <tr><td style="color:var(--muted)">Categoría</td><td>${wizardCtx.category||'—'}</td></tr>
        <tr><td style="color:var(--muted)">Marca</td><td>${wizardCtx.brand||'—'}</td></tr>
        <tr><td style="color:var(--muted)">Clasif. 1</td><td>${wizardCtx.clasif1||'—'}</td></tr>
        <tr><td style="color:var(--muted)">Clasif. 2</td><td>${wizardCtx.clasif2||'—'}</td></tr>
        <tr><td style="color:var(--muted)">Sub-nombre A</td><td>${wizardCtx.subnameA||'—'}</td></tr>
        <tr><td style="color:var(--muted)">Tamaño</td><td>${wizardCtx.size||'—'}</td></tr>
        <tr><td style="color:var(--muted)">IVA</td><td>${wizardCtx.ivaPct}%</td></tr>
        <tr><td style="color:var(--muted)">Desc. máx.</td><td>${wizardCtx.maxDiscount}%</td></tr>
      </table>
    </div>
    <div class="card">
      <div class="card-title">📦 Inventario</div>
      <div class="pres-calc-box" style="margin-bottom:12px">
        <div class="pres-calc-total">${total} uds.</div>
        <div class="pres-calc-detail">${wizardCtx.numPresentations} ${wizardCtx.buyPresentation}(s) × ${wizardCtx.unitsPerPres} uds.</div>
      </div>
      <table class="tbl" style="font-size:12px">
        <tr><td style="color:var(--muted);width:130px">Presentación</td><td><span class="pres-tag">${wizardCtx.buyPresentation||'—'}</span></td></tr>
        <tr><td style="color:var(--muted)">Eq. inventario</td><td class="mono">${wizardCtx.eqInventory}</td></tr>
        <tr><td style="color:var(--muted)">Bodega</td><td><span class="bodega-tag">${wizardCtx.warehouse||'—'}</span></td></tr>
        <tr><td style="color:var(--muted)">Fecha ingreso</td><td class="mono">${wizardCtx.entryDate} ${wizardCtx.entryTime}</td></tr>
      </table>
    </div>
    <div class="card">
      <div class="card-title">🧾 Factura del proveedor</div>
      <table class="tbl" style="font-size:12px">
        <tr><td style="color:var(--muted);width:130px">N° Factura</td><td class="mono">${wizardCtx.invoiceNumber||'—'}</td></tr>
        <tr><td style="color:var(--muted)">Fecha</td><td class="mono">${wizardCtx.invoiceDate||'—'}</td></tr>
        <tr><td style="color:var(--muted)">Proveedor</td><td>${wizardCtx.supplier||'—'}</td></tr>
        <tr><td style="color:var(--muted)">Total pagado</td><td class="mono">${wizardCtx.totalPaid?'Q '+wizardCtx.totalPaid:'—'}</td></tr>
        <tr><td style="color:var(--muted)">Costo unitario</td><td class="mono">${wizardCtx.costQ?'Q '+wizardCtx.costQ:'—'}</td></tr>
      </table>
    </div>
    <div class="card">
      <div class="card-title">💰 Precios de venta</div>
      <table class="tbl" style="font-size:12px">
        <tr><td style="color:var(--muted);width:130px">💵 Público</td><td class="mono">${wizardCtx.pricePublic?'Q '+wizardCtx.pricePublic:'—'}</td></tr>
        <tr><td style="color:var(--muted)">📦 Mayorista</td><td class="mono">${wizardCtx.priceMajor?'Q '+wizardCtx.priceMajor:'—'}</td></tr>
        <tr><td style="color:var(--muted)">⭐ Especial</td><td class="mono">${wizardCtx.priceSpecial?'Q '+wizardCtx.priceSpecial:'—'}</td></tr>
        <tr><td style="color:var(--muted)">🏷️ Oferta</td><td class="mono">${wizardCtx.priceOffer?'Q '+wizardCtx.priceOffer:'—'}</td></tr>
        <tr><td style="color:var(--muted)">% Utilidad</td><td>${wizardCtx.pctUtility||'—'}%</td></tr>
      </table>
    </div>
  </div>
  <div id="wiz-confirm-msg" style="margin-top:12px"></div>`;
}

function updateWizardPresentations() {
  const sel=document.getElementById('wiz-buyPres');
  if (!sel) return;
  const opts=CATEGORY_PRESENTATIONS[wizardCtx.category]||['Caja','Saco','Unidad'];
  sel.innerHTML=opts.map(o=>`<option value="${o}">${o}</option>`).join('');
  updateCalcUnits();
}

function updateCalcUnits() {
  const u=parseInt(document.getElementById('wiz-unitsPerPres')?.value)||0;
  const n=parseInt(document.getElementById('wiz-numPres')?.value)||0;
  const pres=document.getElementById('wiz-buyPres')?.value||'';
  const total=u*n;
  const el=document.getElementById('wiz-calc-total');
  const el2=document.getElementById('wiz-calc-detail');
  if (el)  el.textContent=total+' unidades';
  if (el2) el2.textContent=`${n} ${pres}(s) × ${u} uds. = ${total} en inventario`;
  const sd=document.getElementById('wiz-sell-units');
  if (sd&&pres) sd.innerHTML=(SELL_UNITS[pres]||['Unidad']).map((u,i)=>`<span class="unit-pill ${i===0?'active':''}" onclick="selectUnit(this)">${u}</span>`).join('');
  // Calcular precio sugerido si hay costo
  const cost=parseFloat(document.getElementById('wiz-costQ')?.value)||0;
  const pct=parseFloat(document.getElementById('wiz-pctUtility')?.value)||0;
  if (cost&&pct) {
    const suggested=(cost*(1+pct/100)).toFixed(2);
    const pp=document.getElementById('wiz-pricePublic');
    if (pp&&!pp.value) pp.value=suggested;
  }
}

function onWizardCategoryChange(cat) {
  wizardCtx.category=cat;
  const container=document.getElementById('wiz-dynamic-filters');
  if (!container) return;
  const filters=CATEGORY_FILTERS[cat]||[];
  if (!filters.length){container.innerHTML='<div style="font-size:12px;color:var(--muted)">— Selecciona una categoría para ver atributos —</div>';return;}
  container.innerHTML=filters.map(f=>`
    <div class="erp-field w-md">
      <label>${f.label}</label>
      <select id="${f.id}" onchange="syncWizardFilter('${f.id}','${f.label}')">
        ${f.opts.map(o=>`<option>${o}</option>`).join('')}
      </select>
    </div>`).join('');
}

function syncWizardFilter(id,label) {
  const val=document.getElementById(id)?.value||'';
  if (label==='Color')  { wizardCtx.color=val;  const h=document.getElementById('wiz-color-val');  if(h) h.value=val; }
  if (label==='Tamaño') { wizardCtx.size=val;   }
  if (label==='Diseño') { wizardCtx.design=val; const h=document.getElementById('wiz-design-val'); if(h) h.value=val; }
  if (label==='Tipo')   wizardCtx.subnameA=val;
  if (label==='Peso')   wizardCtx.size=val;
  if (label==='Marca')  wizardCtx.subnameB=val;
}

function calcPriceFromUtility() {
  const cost=parseFloat(document.getElementById('wiz-costQ')?.value)||0;
  const pct=parseFloat(document.getElementById('wiz-pctUtility')?.value)||0;
  if (!cost) return;
  const suggested=(cost*(1+pct/100)).toFixed(2);
  const pp=document.getElementById('wiz-pricePublic');
  if (pp) pp.value=suggested;
}

/* ── INVENTARIO ──────────────────────────────── */
function renderInventoryTable(tbodyId) {
  const tbody=document.getElementById(tbodyId);
  if (!tbody) return;
  tbody.innerHTML=inventory.map(p=>{
    // Presentación principal = primera
    const pres=p.presentations[0];
    const totalUnits=p.presentations.reduce((a,pr)=>a+(pr.unit==='Unidad'||pr.unit==='Libra'?pr.stock:pr.stock*pr.unitsPer),0);
    const stock=pres.stock;
    const status=stock===0?'danger':stock<pres.minStock?'warn':'ok';
    const statusLabel={danger:'🔴 Agotado',warn:'🟡 Bajo',ok:'🟢 OK'}[status];
    const chipClass={danger:'chip-danger',warn:'chip-warn',ok:'chip-ok'}[status];
    const subnames=[p.color,p.size,p.design].filter(Boolean).join(' · ');
    const presList=p.presentations.map(pr=>`<span class="pres-tag" style="margin-right:3px">${pr.unit}</span>`).join('');
    return `<tr>
      <td><span class="prod-code">${p.code}</span>${p.codeOEM?`<div style="font-size:10px;color:var(--muted)">${p.codeOEM}</div>`:''}</td>
      <td><strong>${p.name}</strong>${subnames?`<div style="font-size:11px;color:var(--muted);margin-top:2px">${subnames}</div>`:''}</td>
      <td>${p.category}</td>
      <td>${p.brand||'—'}</td>
      <td>${presList}</td>
      <td class="mono" style="font-size:15px;font-weight:700">${totalUnits}<div style="font-size:10px;color:var(--muted)">uds. totales</div></td>
      <td><span class="bodega-tag">${p.warehouse}</span></td>
      <td class="mono">Q ${pres.pricePublic.toFixed(2)}</td>
      <td><span class="chip ${chipClass}">${statusLabel}</span></td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="openProductDetail('${p.code}')">🔍 Ver</button>
      </td>
    </tr>`;
  }).join('');
}

/* Modal detalle de producto (estilo ERP con tabs) */
function openProductDetail(code) {
  const p=inventory.find(x=>x.code===code);
  if (!p) return;
  const modal=document.getElementById('modal-product-detail');
  const title=document.getElementById('modal-prod-title');
  const body=document.getElementById('modal-prod-body');
  if (!modal||!body) return;

  if (title) title.textContent=`🔍 Consultando — ${p.name}`;

  body.innerHTML=`
  <!-- ERP tabs -->
  <div id="detail-tabs-grp" class="erp-tabs">
    <button class="erp-tab active" onclick="showErpTab('detail-tabs-grp','dtab-caracteristicas',this)">Características</button>
    <button class="erp-tab"        onclick="showErpTab('detail-tabs-grp','dtab-costos',this)">Costos / Precios</button>
    <button class="erp-tab"        onclick="showErpTab('detail-tabs-grp','dtab-otros',this)">Otros datos</button>
  </div>

  <!-- Tab 1: Características -->
  <div class="erp-panel active" id="dtab-caracteristicas">
    <div class="erp-section">
      <div class="erp-section-title">🏷️ Identificación</div>
      <div class="erp-row">
        <div class="erp-field w-md"><label>Código</label><input value="${p.code}" readonly></div>
        <div class="erp-field w-md"><label>Código OEM</label><input value="${p.codeOEM||''}" readonly></div>
        <div class="erp-field w-xl"><label>Descripción</label><input value="${p.name}" readonly></div>
      </div>
    </div>
    <div class="erp-section">
      <div class="erp-section-title">📊 Clasificaciones y marca</div>
      <div class="erp-row">
        <div class="erp-field w-md"><label>Marca</label><input value="${p.brand||'—'}" readonly></div>
        <div class="erp-field w-md"><label>Clasificación 1</label><input value="${p.clasif1||'SIN CLASIFICACIÓN'}" readonly></div>
        <div class="erp-field w-md"><label>Clasificación 2</label><input value="${p.clasif2||'SIN CLASIFICACIÓN'}" readonly></div>
        <div class="erp-field w-md"><label>Clasificación 3</label><input value="${p.clasif3||'SIN CLASIFICACIÓN'}" readonly></div>
      </div>
    </div>
    <div class="erp-section">
      <div class="erp-section-title">📦 Presentaciones y existencias</div>
      <table class="tbl" style="margin-bottom:10px">
        <thead><tr><th>Unidad de medida</th><th>Eq. inventario</th><th>Stock</th><th>Mín.</th><th>Precio público</th><th>Precio especial</th><th>Costo Q</th></tr></thead>
        <tbody>
          ${p.presentations.map(pr=>`<tr>
            <td><span class="pres-tag">${pr.unit}</span></td>
            <td class="mono">${pr.unitsPer}</td>
            <td class="mono" style="font-weight:700">${pr.stock}</td>
            <td class="mono">${pr.minStock}</td>
            <td class="mono">Q ${pr.pricePublic.toFixed(2)}</td>
            <td class="mono">Q ${pr.priceSpecial.toFixed(2)}</td>
            <td class="mono">Q ${pr.costQ.toFixed(2)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
      <div class="erp-row">
        <div class="erp-field w-md"><label>Bodega</label><input value="${p.warehouse}" readonly></div>
        <div class="erp-field w-md"><label>Tamaño / Peso</label><input value="${p.size||'—'}" readonly></div>
        ${p.color?`<div class="erp-field w-md"><label>Color</label><input value="${p.color}" readonly></div>`:''}
        ${p.design?`<div class="erp-field w-md"><label>Diseño</label><input value="${p.design}" readonly></div>`:''}
      </div>
    </div>
  </div>

  <!-- Tab 2: Costos / Precios -->
  <div class="erp-panel" id="dtab-costos">
    <div class="erp-section">
      <div class="erp-section-title">💵 Precios por unidad de medida</div>
      ${p.presentations.map(pr=>`
      <div style="border:1px solid var(--border);border-radius:8px;padding:12px 14px;margin-bottom:10px">
        <div style="font-size:12px;font-weight:700;color:var(--owner-mid);margin-bottom:10px">📦 ${pr.unit} — Eq. ${pr.unitsPer}</div>
        <div class="erp-row">
          <div class="erp-field w-md"><label>Costo Q</label><input value="${pr.costQ.toFixed(2)}" readonly></div>
          <div class="erp-field w-md"><label>💵 Precio público</label><input value="${pr.pricePublic.toFixed(2)}" readonly></div>
          <div class="erp-field w-md"><label>📦 Precio mayorista</label><input value="${pr.priceMajor.toFixed(2)}" readonly></div>
          <div class="erp-field w-md"><label>⭐ Precio especial</label><input value="${pr.priceSpecial.toFixed(2)}" readonly></div>
          <div class="erp-field w-md"><label>% Utilidad</label><input value="${pr.costQ>0?((pr.pricePublic/pr.costQ-1)*100).toFixed(1)+'%':'—'}" readonly></div>
        </div>
      </div>`).join('')}
    </div>
  </div>

  <!-- Tab 3: Otros datos -->
  <div class="erp-panel" id="dtab-otros">
    <div class="erp-section">
      <div class="erp-section-title">⚙️ Configuración</div>
      <div class="erp-row">
        <div class="erp-field w-md"><label>% IVA</label><input value="${p.ivaPct}%" readonly></div>
        <div class="erp-field w-md"><label>% Máx. descuento</label><input value="${p.maxDiscount}%" readonly></div>
        <div class="erp-field w-md"><label>Categoría</label><input value="${p.category}" readonly></div>
      </div>
    </div>
    <div class="erp-section">
      <div class="erp-section-title">🔍 Tecla de búsqueda</div>
      <div class="erp-row">
        <div class="erp-field w-xl"><label>Sub-nombre A (búsqueda)</label><input value="${p.name}" readonly></div>
        ${p.design?`<div class="erp-field w-md"><label>Sub-nombre diseño</label><input value="${p.design}" readonly></div>`:''}
      </div>
    </div>
  </div>`;

  modal.classList.add('open');
}

/* ── FACTURACIÓN ─────────────────────────────── */

function updateInvoiceHeader() {
  const numEl=document.getElementById('inv-num');
  if (numEl) numEl.textContent=invoiceNumber;
}

/* Búsqueda de productos para factura */
function renderProdSearchTable(query) {
  const tbody=document.getElementById('prod-search-tbody');
  if (!tbody) return;
  const q=query.toLowerCase().trim();
  const results=inventory.flatMap(p=>
    p.presentations.map(pr=>({ p, pr }))
  ).filter(({p,pr})=>{
    if (!q) return true;
    const search=[p.name,p.code,p.codeOEM,p.brand,p.clasif1,p.clasif2,p.design,p.color,p.size,pr.unit]
      .filter(Boolean).join(' ').toLowerCase();
    // Búsqueda compuesta: cada término debe aparecer
    return q.split(' ').every(term=>search.includes(term));
  });

  if (!results.length) {
    tbody.innerHTML=`<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:20px">Sin resultados para "${query}"</td></tr>`;
    return;
  }

  tbody.innerHTML=results.map(({p,pr},i)=>`
    <tr onclick="selectProductForInvoice('${p.code}','${pr.unit}')" style="cursor:pointer">
      <td><span class="prod-code">${p.code}</span></td>
      <td>${p.name}${p.color?` · <span style="font-size:11px;color:var(--muted)">${p.color}</span>`:''}</td>
      <td><span class="pres-tag">${pr.unit}</span></td>
      <td class="mono">Q ${pr.pricePublic.toFixed(2)}</td>
      <td class="mono" style="${pr.stock===0?'color:var(--danger)':pr.stock<pr.minStock?'color:var(--warn)':'color:var(--ok)'}">${pr.stock}</td>
    </tr>`).join('');
}

function selectProductForInvoice(code, unit) {
  const p=inventory.find(x=>x.code===code);
  const pr=p?.presentations.find(x=>x.unit===unit);
  if (!p||!pr) return;

  // Si ya está en el carrito, aumentar qty
  const existing=invoiceItems.find(i=>i.code===code&&i.unit===unit);
  if (existing) { existing.qty++; existing.subtotal=existing.qty*existing.unitPrice; }
  else {
    invoiceItems.push({
      code, unit, name:p.name, color:p.color, design:p.design,
      qty:1, unitPrice:pr.pricePublic, subtotal:pr.pricePublic, stock:pr.stock,
    });
  }
  renderInvoiceItems();
  closeModal('modal-prod-search');
  // Limpiar búsqueda
  const inp=document.getElementById('inv-search-input');
  if (inp) inp.value='';
}

function renderInvoiceItems() {
  const tbody=document.getElementById('invoice-items-body');
  if (!tbody) return;

  if (!invoiceItems.length) {
    tbody.innerHTML=`<div class="invoice-item-row" style="color:var(--muted);font-size:13px;grid-template-columns:1fr">Sin productos. Usa el buscador para agregar.</div>`;
    updateInvoiceTotals();
    return;
  }

  tbody.innerHTML=invoiceItems.map((item,i)=>`
    <div class="invoice-item-row">
      <div>
        <strong>${item.name}</strong>
        ${item.color||item.design?`<div style="font-size:11px;color:var(--muted)">${[item.color,item.design].filter(Boolean).join(' · ')}</div>`:''}
        <span class="pres-tag" style="margin-top:3px;display:inline-block">${item.unit}</span>
      </div>
      <input type="number" value="${item.qty}" min="1" max="${item.stock}"
        style="width:70px;border:1px solid var(--border);border-radius:6px;padding:5px 8px;font-family:'DM Mono',monospace;text-align:center"
        onchange="updateItemQty(${i},this.value)">
      <input type="number" value="${item.unitPrice.toFixed(2)}" step="0.01"
        style="width:85px;border:1px solid var(--border);border-radius:6px;padding:5px 8px;font-family:'DM Mono',monospace;text-align:right"
        onchange="updateItemPrice(${i},this.value)">
      <div class="mono" style="text-align:right;font-weight:700">Q ${item.subtotal.toFixed(2)}</div>
      <button onclick="removeInvoiceItem(${i})" style="background:none;border:none;cursor:pointer;font-size:16px;color:var(--danger);justify-self:center">🗑</button>
    </div>`).join('');

  updateInvoiceTotals();
}

function updateItemQty(i,val) {
  const q=Math.max(1,parseInt(val)||1);
  invoiceItems[i].qty=q;
  invoiceItems[i].subtotal=q*invoiceItems[i].unitPrice;
  renderInvoiceItems();
}
function updateItemPrice(i,val) {
  const v=parseFloat(val)||0;
  invoiceItems[i].unitPrice=v;
  invoiceItems[i].subtotal=invoiceItems[i].qty*v;
  renderInvoiceItems();
}
function removeInvoiceItem(i) {
  invoiceItems.splice(i,1);
  renderInvoiceItems();
}

function updateInvoiceTotals() {
  const subtotal=invoiceItems.reduce((a,i)=>a+i.subtotal,0);
  const iva=subtotal*0.12;
  const total=subtotal; // IVA incluido en precios base en este prototipo

  const setEl=(id,val)=>{ const e=document.getElementById(id); if(e) e.textContent=val; };
  setEl('inv-subtotal',   'Q '+subtotal.toFixed(2));
  setEl('inv-iva',        'Q '+iva.toFixed(2));
  setEl('inv-total',      'Q '+subtotal.toFixed(2));
  setEl('pay-total-val',  'Q '+subtotal.toFixed(2));

  // Recalcular vuelto/pendiente si hay monto pagado
  recalcPayment();
}

/* Formas de pago */
function selectPaymentMethod(method, el) {
  selectedPaymentMethod=method;
  document.querySelectorAll('.payment-method').forEach(b=>b.classList.remove('selected'));
  el.classList.add('selected');
  const amtInput=document.getElementById('pay-amount-input');
  if (amtInput) amtInput.focus();
}

function recalcPayment() {
  const subtotal=invoiceItems.reduce((a,i)=>a+i.subtotal,0);
  const paid=parseFloat(document.getElementById('pay-amount-input')?.value)||0;
  const change=paid-subtotal;
  const setEl=(id,val,color)=>{
    const e=document.getElementById(id);
    if(e){e.textContent=val; if(color) e.style.color=color;}
  };
  setEl('pay-change-val', change>=0?'Q '+change.toFixed(2):'Q 0.00', change>=0?'var(--warn)':'var(--muted)');
  setEl('pay-pending-val', change<0?'Q '+Math.abs(change).toFixed(2):'Q 0.00', change<0?'var(--danger)':'var(--ok)');
}

function confirmInvoice() {
  const subtotal=invoiceItems.reduce((a,i)=>a+i.subtotal,0);
  if (!invoiceItems.length) { alert('Agrega al menos un producto.'); return; }
  if (!selectedPaymentMethod) { alert('Selecciona una forma de pago.'); return; }
  const paid=parseFloat(document.getElementById('pay-amount-input')?.value)||0;
  if (paid<subtotal) { alert('El monto pagado es insuficiente.'); return; }

  // Descontar del inventario
  invoiceItems.forEach(item=>{
    const p=inventory.find(x=>x.code===item.code);
    const pr=p?.presentations.find(x=>x.unit===item.unit);
    if (pr) pr.stock=Math.max(0,pr.stock-item.qty);
  });

  invoiceNumber++;
  const btn=document.getElementById('confirm-invoice-btn');
  if (btn){btn.textContent='✅ Factura #'+invoiceNumber+' emitida'; btn.disabled=true;}

  setTimeout(()=>{
    invoiceItems=[]; selectedPaymentMethod=null;
    renderInvoiceItems();
    renderInventoryTable('inv-table-body');
    renderInventoryTable('emp-inv-table-body');
    updateInvoiceHeader();
    const pi=document.getElementById('pay-amount-input');
    if(pi) pi.value='';
    const pmethods=document.querySelectorAll('.payment-method');
    pmethods.forEach(m=>m.classList.remove('selected'));
    if(btn){btn.textContent='✅ Confirmar y emitir factura'; btn.disabled=false;}
    recalcPayment();
  },2000);
}

/* ── CATEGORÍAS DINÁMICAS ────────────────────── */
function onCategoryFilterChange(selectEl, targetContainerId) {
  const cat=selectEl.value;
  const container=document.getElementById(targetContainerId);
  if (!container) return;
  const filters=CATEGORY_FILTERS[cat]||[];
  if (!filters.length){
    container.innerHTML='<div style="font-size:12px;color:var(--muted);padding:6px 0">Selecciona una categoría para ver filtros adicionales.</div>';
    return;
  }
  container.innerHTML=filters.map(f=>`
    <div class="erp-field w-md">
      <label>${f.label}</label>
      <select>${f.opts.map(o=>`<option>${o}</option>`).join('')}</select>
    </div>`).join('');
}

/* ── HELPERS ─────────────────────────────────── */
function setDateRange(range,el){
  document.querySelectorAll('.quick-range-btn').forEach(b=>b.classList.remove('active'));
  if(el) el.classList.add('active');
}
function savePrice(btnEl){
  const orig=btnEl.textContent;
  btnEl.textContent='✅'; btnEl.disabled=true;
  setTimeout(()=>{btnEl.textContent=orig;btnEl.disabled=false;},1600);
}
function sendEmailConfirm(){
  const btn=document.getElementById('btn-send-email');
  if(!btn) return;
  btn.textContent='⏳ Enviando…'; btn.disabled=true;
  setTimeout(()=>{
    btn.textContent='✅ Enviado'; btn.classList.remove('btn-owner'); btn.classList.add('btn-outline');
    setTimeout(()=>closeModal('modal-email'),1400);
  },1200);
}
function selectUnit(pill){
  pill.closest('.unit-pills').querySelectorAll('.unit-pill').forEach(p=>p.classList.remove('active'));
  pill.classList.add('active');
}
function exportKardex(format){
  const btn=event.target;
  const orig=btn.textContent;
  btn.textContent='⏳…'; btn.disabled=true;
  setTimeout(()=>{btn.textContent='✅ '+format.toUpperCase(); setTimeout(()=>{btn.textContent=orig;btn.disabled=false;},1800);},1000);
}
function openPresBreakdown(code){
  const p=inventory.find(x=>x.code===code);
  if(!p) return;
  openProductDetail(code);
}

document.addEventListener('DOMContentLoaded',()=>{
  for(let i=1;i<=4;i++){
    const p=document.getElementById('wiz-panel-'+i);
    if(p) p.style.display=i===1?'block':'none';
  }
  wizardReset();
});