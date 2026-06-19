function $qs(sel){return document.querySelector(sel)}
const params = new URLSearchParams(location.search);
const planId = params.get('plan');
const price = params.get('price');
const dailyParam = params.get('daily');
const planNameEl = $qs('#planName');
const planPriceEl = $qs('#planPrice');
const planDailyEl = $qs('#planDaily');
const paymentRef = $qs('#paymentRef');
const paidBtn = $qs('#paidBtn');
const statusMsg = $qs('#statusMsg');

const PLANS = {
  mini:'Mini Plan', starter:'Starter Plan', growth:'Growth Plan', premium:'Premium Plan', pro:'Pro Plan', enterprise:'Enterprise Plan'
};

if(planId && PLANS[planId]){
  planNameEl.textContent = PLANS[planId];
} else {
  planNameEl.textContent = planId || 'Unknown';
}
planPriceEl.textContent = price ? `₦${Number(price).toFixed(2)}` : '—';
if(planDailyEl) planDailyEl.textContent = dailyParam ? `₦${Number(dailyParam).toFixed(2)}` : '—';
paymentRef.textContent = sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')).email : 'your email';

function showToast(msg){ const t = $qs('#toast'); t.textContent = msg; t.style.display='block'; setTimeout(()=>t.style.display='none',2500); }

paidBtn.addEventListener('click', ()=>{
  // Simulate confirmation: record purchase and redirect to dashboard
  const purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
  const dailyAmt = dailyParam ? Number(dailyParam) : 0;
  purchases.push({plan:planId, price: price ? Number(price) : 0, daily: dailyAmt, at: new Date().toISOString()});
  localStorage.setItem('purchases', JSON.stringify(purchases));
  // Deduct from available balance
  try{
    const BALANCE_KEY = 'availableBalance';
    const currentRaw = localStorage.getItem(BALANCE_KEY);
    const current = parseFloat(String(currentRaw).replace(/[^0-9.-]+/g,'')) || 0;
    const deduction = price ? Number(price) : 0;
    const updated = Math.max(0, current - deduction);
    // store as formatted currency so dashboard shows exact amount purchased clearly
    localStorage.setItem(BALANCE_KEY, '₦' + updated.toFixed(2));
  }catch(e){/* ignore */}
  // Record referral bonus (5% of purchase) under 'referralEarnings' for the ref identifier
  try{
    const ref = params.get('ref');
    if(ref){
      const bonus = (price ? Number(price) : 0) * 0.05;
      const key = 'referralEarnings';
      const map = JSON.parse(localStorage.getItem(key) || '{}');
      map[ref] = (Number(map[ref]) || 0) + Number(bonus.toFixed(2));
      localStorage.setItem(key, JSON.stringify(map));
    }
  }catch(e){console.debug('Referral credit failed', e)}
  statusMsg.textContent = 'Payment noted (simulated). Returning to dashboard...';
  showToast('Payment recorded (simulated)');
  setTimeout(()=> location.href = 'dashboard.html', 1200);
});
