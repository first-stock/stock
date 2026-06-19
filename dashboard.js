function $qs(sel){return document.querySelector(sel)}
const userEl = $qs('#userName');
const emailEl = $qs('#userEmail');
const refEl = $qs('#refCode');
const toast = $qs('#toast');
const logoutBtn = $qs('#logoutBtn');

function showToast(msg){
  toast.textContent = msg; toast.style.display = 'block';
  setTimeout(()=>{toast.style.display='none'},3000);
}

function formatCurrency(v){
  return '₦' + Number(v).toLocaleString('en-NG', {minimumFractionDigits:2, maximumFractionDigits:2});
}

function generateRefCode(){
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for(let i=0;i<6;i++) out += chars[Math.floor(Math.random()*chars.length)];
  return 'firststock-' + out;
}

// referral landing page and optional custom domain (set to empty string to use current origin)
const REF_LANDING = 'index.html';
const CUSTOM_DOMAIN = ''; // e.g. 'https://example.com/' — leave empty to use current site

const raw = sessionStorage.getItem('user');
if(!raw){
  showToast('No session — redirecting to login');
  setTimeout(()=> location.href = 'login.html', 900);
} else {
  const user = JSON.parse(raw);
  userEl.textContent = user.name || user.email;
  emailEl.textContent = user.email;
  // ensure user has a stable referral code and populate UI
  try{
    const codesKey = 'userRefCodes';
    const codes = JSON.parse(localStorage.getItem(codesKey) || '{}');
    let myCode = codes[user.email];
    if(!myCode){
      myCode = generateRefCode();
      codes[user.email] = myCode;
      localStorage.setItem(codesKey, JSON.stringify(codes));
    }

    const refLinkInput = $qs('#refLink');
    const copyBtn = $qs('#copyRefBtn');
    const emailBtn = $qs('#emailRefBtn');
    const myRefDisplay = $qs('#myRefCodeDisplay');
    if(refLinkInput){
      const landing = REF_LANDING || 'index.html';
      const base = CUSTOM_DOMAIN && CUSTOM_DOMAIN.length ? CUSTOM_DOMAIN : location.href;
      const link = new URL(`${landing}?ref=${encodeURIComponent(myCode)}`, base).href;
      refLinkInput.value = link;
      if(myRefDisplay) myRefDisplay.textContent = 'Your referral code: ' + myCode;
      // make the anchor clickable and keep it in sync
      const anchor = $qs('#refLinkAnchor');
      if(anchor){ anchor.href = link; anchor.textContent = 'Open'; anchor.target = '_blank'; }
      // allow clicking the input to open the link
      refLinkInput.addEventListener('click', ()=>{ window.open(link, '_blank'); });
      if(copyBtn){
        copyBtn.addEventListener('click', async ()=>{
          try{
            if(navigator.clipboard && navigator.clipboard.writeText){
              await navigator.clipboard.writeText(refLinkInput.value);
            } else {
              refLinkInput.select(); document.execCommand('copy');
            }
            showToast('Referral link copied');
          }catch(e){ showToast('Copy failed'); }
        });
      }
      if(emailBtn){
        emailBtn.addEventListener('click', ()=>{
          const subject = encodeURIComponent('Join me on First Stock');
          const body = encodeURIComponent('Hi, join this app and use my referral: ' + refLinkInput.value);
          location.href = `mailto:?subject=${subject}&body=${body}`;
        });
      }
    }
  }catch(e){console.debug('Referral UI init failed', e)}
}

const params = new URLSearchParams(location.search);
if(params.has('ref')){
  refEl.textContent = params.get('ref');
} else {
  refEl.textContent = '—';
}

logoutBtn.addEventListener('click', ()=>{
  sessionStorage.removeItem('user');
  location.href = 'login.html';
});

// Plans available for purchase (expanded)
const PLANS = [
  {id:'mini', name:'Mini Plan', price:2000.00, desc:'0.5 share — try it out', daily:800.00},
  {id:'starter', name:'Starter Plan', price:4000.00, desc:'1 share — basics', daily:1000.00},
  {id:'growth', name:'Growth Plan', price:8000.00, desc:'5 shares — most popular', daily:2000.00},
  {id:'premium', name:'Premium Plan', price:12000.00, desc:'10 shares — enhanced rewards', daily:2500.00},
  {id:'pro', name:'Pro Plan', price:16000.00, desc:'20 shares — dedicated support', daily:5000.00},
  {id:'enterprise', name:'Enterprise Plan', price:20000.00, desc:'Custom allocation & manager', daily:20000.00}
];

function renderPlans(){
  const list = $qs('#plansList');
  if(!list) return;
  list.innerHTML = '';
  PLANS.forEach(p=>{
    const el = document.createElement('div'); el.className='stat';
    el.innerHTML = `<strong>${p.name}</strong><div style="margin-top:6px">${p.desc}</div><div style="margin-top:8px;font-weight:600">₦${p.price.toFixed(2)}</div><div style="margin-top:6px;color:var(--muted)">Daily: ₦${p.daily.toFixed(2)}</div><div style="margin-top:8px"><button class="btn plan-view" data-id="${p.id}" data-price="${p.price}" data-daily="${p.daily}" style="padding:8px 10px">View</button></div>`;
    list.appendChild(el);
  });

  list.querySelectorAll('.plan-view').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.dataset.id;
      const price = btn.dataset.price;
      const daily = btn.dataset.daily;
      const ref = params.get('ref');
      const targetBase = `namebank.html?plan=${encodeURIComponent(id)}&price=${encodeURIComponent(price)}&daily=${encodeURIComponent(daily)}`;
      const target = ref ? `${targetBase}&ref=${encodeURIComponent(ref)}` : targetBase;
      location.href = target;
    });
  });
}

// Render plans and purchases history
renderPlans();
// Render purchases history
function renderPurchases(){
  const list = $qs('#purchasesList');
  if(!list) return;
  const purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
  if(purchases.length === 0){
    list.innerHTML = '<div class="stat">No purchases yet.</div>';
    return;
  }
  list.innerHTML = '';
  // show newest first and compute total daily income
  let totalDaily = 0;
  purchases.slice().reverse().forEach(p=>{
    const el = document.createElement('div'); el.className = 'stat';
    const when = p.at ? new Date(p.at).toLocaleString() : '';
    const price = formatCurrency(p.price || 0);
    const daily = p.daily ? formatCurrency(p.daily) : formatCurrency(0);
    totalDaily += Number(p.daily || 0);
    el.innerHTML = `<strong>${p.plan || 'Unknown Plan'}</strong><div style="margin-top:6px;color:var(--muted)">${when}</div><div style="margin-top:8px;font-weight:600">${price}</div><div style="margin-top:6px;color:var(--muted)">Daily: ${daily}</div>`;
    list.appendChild(el);
  });
  const dailyEl = $qs('#dailyIncome'); if(dailyEl) dailyEl.textContent = formatCurrency(totalDaily);
}
renderPurchases();
// Clear history button: remove stored purchases (and refresh UI)
const clearHistoryBtn = $qs('#clearHistoryBtn');
if(clearHistoryBtn){
  clearHistoryBtn.addEventListener('click', ()=>{
    try{
      const ok = confirm('Clear purchase history? This cannot be undone.');
      if(!ok) return;
      localStorage.removeItem('purchases');
      // also clear withdrawals if you want to remove other records
      // localStorage.removeItem('withdrawals');
      renderPurchases();
      loadAndShowBalance();
      showToast('Purchase history cleared');
    }catch(e){
      console.debug('Clear history failed', e);
      showToast('Failed to clear history');
    }
  });
}
// Ensure available balance is loaded from storage and displayed
const BALANCE_KEY = 'availableBalance';
function loadAndShowBalance(){
  // Read stored value and strip any non-numeric characters (e.g. currency symbols)
  const raw = localStorage.getItem(BALANCE_KEY);
  let available = 0;
  if(raw == null){
    available = 0.00; // default starting balance is zero
    localStorage.setItem(BALANCE_KEY, '₦' + available.toFixed(2));
  } else {
    const cleaned = String(raw).replace(/[^0-9.-]+/g,'');
    available = parseFloat(cleaned);
    if(isNaN(available)){
      available = 0.00;
      localStorage.setItem(BALANCE_KEY, '₦' + available.toFixed(2));
    }
  }

  // compute total daily income from purchases
  const purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
  const totalDaily = purchases.reduce((s,p)=> s + (Number(p.daily) || 0), 0);

  // credit daily income every 24 hours based on last credit timestamp
  try{
    const now = Date.now();
    const msPerDay = 24 * 60 * 60 * 1000;
    const lastRaw = localStorage.getItem('lastDailyCredit');
    if(!lastRaw){
      // first run: set last credit timestamp to now (no retro credit)
      localStorage.setItem('lastDailyCredit', String(now));
    } else {
      const last = parseInt(lastRaw, 10) || now;
      const daysElapsed = Math.floor((now - last) / msPerDay);
      if(daysElapsed > 0 && totalDaily > 0){
        const added = Number((totalDaily * daysElapsed).toFixed(2));
        available = Number((available + added).toFixed(2));
        // store updated balance as formatted currency
        localStorage.setItem(BALANCE_KEY, '₦' + available.toFixed(2));
        // advance last credit forward by the credited days
        localStorage.setItem('lastDailyCredit', String(last + daysElapsed * msPerDay));
        showToast('Daily income credited: ' + formatCurrency(added));
      }
    }
  }catch(e){
    console.debug('Daily crediting failed', e);
  }

  // auto-claim referral earnings for logged-in user (if any) using user's referral code
  try{
    const sessionRaw = sessionStorage.getItem('user');
    if(sessionRaw){
      const user = JSON.parse(sessionRaw);
      const email = user.email;
      if(email){
        const codes = JSON.parse(localStorage.getItem('userRefCodes') || '{}');
        const myCode = codes[email];
        if(myCode){
          const map = JSON.parse(localStorage.getItem('referralEarnings') || '{}');
          const amt = Number(map[myCode] || 0);
          if(amt > 0){
            available = Number((available + amt).toFixed(2));
            // clear referral earnings for this code
            delete map[myCode];
            localStorage.setItem('referralEarnings', JSON.stringify(map));
            localStorage.setItem(BALANCE_KEY, '₦' + available.toFixed(2));
            showToast('Referral bonus credited: ' + formatCurrency(amt));
          }
        }
      }
    }
  }catch(e){console.debug('Referral claiming failed', e)}

  console.debug('Loaded availableBalance raw=', raw, 'parsed=', available, 'totalDaily=', totalDaily);
  const availableEl = $qs('#availableBalance');
  if(availableEl) availableEl.textContent = formatCurrency(available);
  const rawEl = $qs('#storedBalanceRaw');
  if(rawEl) rawEl.textContent = raw === null ? '(none)' : String(raw);
  // show last daily credit timestamp
  try{
    const lastEl = $qs('#lastDailyCreditDisplay');
    const lastTs = localStorage.getItem('lastDailyCredit');
    if(lastEl){
      if(lastTs){
        const t = parseInt(lastTs, 10) || 0;
        lastEl.textContent = 'Last credited: ' + new Date(t).toLocaleString();
      } else {
        lastEl.textContent = 'Last credited: (never)';
      }
    }
  }catch(e){console.debug('lastDailyCredit display failed', e)}
  return available;
}
const currentAvailable = loadAndShowBalance();

// Reset balance button for debugging
const resetBtn = $qs('#resetBalanceBtn');
if(resetBtn){
  resetBtn.addEventListener('click', ()=>{
    localStorage.removeItem(BALANCE_KEY);
    loadAndShowBalance();
    showToast('Balance reset');
    renderPurchases();
  });
}

// Withdraw button behavior: send available balance to withdraw page
const withdrawBtn = $qs('#withdrawBtn');
if(withdrawBtn){
  withdrawBtn.addEventListener('click', ()=>{
    // read numeric available balance from storage (handle formatted currency)
    const raw = localStorage.getItem(BALANCE_KEY);
    let amt = 0;
    if(raw != null){ amt = parseFloat(String(raw).replace(/[^0-9.-]+/g,'')) || 0 }
    const ref = params.get('ref');
    const target = ref ? `withdraw.html?max=${encodeURIComponent(amt)}&ref=${encodeURIComponent(ref)}` : `withdraw.html?max=${encodeURIComponent(amt)}`;
    location.href = target;
  });
}
