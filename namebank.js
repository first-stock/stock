function $qs(sel){return document.querySelector(sel)}
const params = new URLSearchParams(location.search);
const id = params.get('plan');
const planTitle = $qs('#planTitle');
const planTag = $qs('#planTag');
const planDesc = $qs('#planDesc');
const planPrice = $qs('#planPrice');
const buyBtn = $qs('#buyBtn');
const toast = $qs('#toast');
const urlPrice = params.get('price');
const urlDaily = params.get('daily');

function showToast(msg){ toast.textContent = msg; toast.style.display='block'; setTimeout(()=>toast.style.display='none',2500) }

const PLANS = {
  mini:{title:'Mini Plan', tag:'Try it out', desc:'0.5 share — trial', price:2000.00},
  starter:{title:'Starter Plan', tag:'Good for beginners', desc:'Includes 1 share and basic support.', price:4000.00},
  growth:{title:'Growth Plan', tag:'Most popular', desc:'Includes 5 shares and priority support.', price:8000.00},
  premium:{title:'Premium Plan', tag:'Enhanced', desc:'Includes 10 shares and enhanced rewards.', price:12000.00},
  pro:{title:'Pro Plan', tag:'For power users', desc:'Includes 20 shares and dedicated manager.', price:16000.00},
  enterprise:{title:'Enterprise Plan', tag:'Custom', desc:'Custom allocation & manager.', price:20000.00}
};

if(!id || !PLANS[id]){
  planTitle.textContent = 'Unknown Plan';
  planDesc.textContent = 'The requested plan was not found.';
  buyBtn.disabled = true;
} else {
  const p = PLANS[id];
  planTitle.textContent = p.title;
  planTag.textContent = p.tag;
  planDesc.textContent = p.desc;
  if(urlPrice){
    planPrice.textContent = `₦${Number(urlPrice).toFixed(2)}`;
  } else {
    planPrice.textContent = `₦${p.price.toFixed(2)}`;
  }
  // show daily payout if provided
  const planDailyEl = $qs('#planDaily');
  if(planDailyEl){
    if(urlDaily) planDailyEl.textContent = `₦${Number(urlDaily).toFixed(2)}`;
    else planDailyEl.textContent = `₦${p.daily.toFixed(2)}`;
  }
}

buyBtn.addEventListener('click', ()=>{
  if(!id || !PLANS[id]) return;
  const p = PLANS[id];
  const priceToSend = urlPrice ? Number(urlPrice) : p.price;
  const dailyToSend = urlDaily ? Number(urlDaily) : p.daily;
  const ref = params.get('ref');
  const base = `bank.html?plan=${encodeURIComponent(id)}&price=${encodeURIComponent(priceToSend)}&daily=${encodeURIComponent(dailyToSend)}`;
  const target = ref ? `${base}&ref=${encodeURIComponent(ref)}` : base;
  // Redirect to bank details page where payment is completed
  location.href = target;
});
