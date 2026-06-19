function $qs(sel){return document.querySelector(sel)}
const form = $qs('#bankForm');
const accountNameEl = $qs('#accountName');
const accountNumberEl = $qs('#accountNumber');
const bankNameEl = $qs('#bankName');
const msg = $qs('#msg');
const toast = $qs('#toast');

function showToast(t){ toast.textContent = t; toast.style.display='block'; setTimeout(()=>toast.style.display='none',2500) }

// Load saved bank details if present
try{
  const saved = JSON.parse(localStorage.getItem('userBank') || 'null');
  if(saved){
    accountNameEl.value = saved.accountName || '';
    accountNumberEl.value = saved.accountNumber || '';
    bankNameEl.value = saved.bankName || '';
  }
}catch(e){/* ignore parse errors */}

form.addEventListener('submit', (ev)=>{
  ev.preventDefault();
  const accountName = accountNameEl.value.trim();
  const accountNumber = accountNumberEl.value.trim();
  const bankName = bankNameEl.value.trim();
  if(!accountName || !accountNumber || !bankName){
    msg.textContent = 'All fields are required.'; return;
  }
  const payload = {accountName, accountNumber, bankName};
  localStorage.setItem('userBank', JSON.stringify(payload));
  showToast('Bank details saved');
  msg.textContent = 'Saved — returning to withdraw page...';
  const params = new URLSearchParams(location.search);
  const redirectParam = params.get('redirect');
  const returnTarget = redirectParam || document.referrer || 'withdraw.html';
  setTimeout(()=> location.href = returnTarget, 900);
});
