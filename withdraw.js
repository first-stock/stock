const params = new URLSearchParams(location.search);
const max = params.get('max');
const form = document.getElementById('withdrawForm');
const amountInput = document.getElementById('amount');

const MIN_WITHDRAW = 1000;

// Prefill with max if provided
if(max && amountInput){
  amountInput.value = Number(max).toFixed(2);
  amountInput.max = Number(max).toFixed(2);
}
// enforce minimum and set input min attribute
if(amountInput){
  amountInput.min = MIN_WITHDRAW;
}
function showToast(msg){ const t = document.getElementById('toast'); t.textContent = msg; t.style.display='block'; setTimeout(()=>t.style.display='none',2500); }

form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const val = parseFloat(amountInput.value || '0');
  const maxVal = parseFloat(max || '0');
  if(isNaN(val) || val <= 0){ showToast('Enter a valid amount'); return }
  if(val < MIN_WITHDRAW){ showToast('Minimum withdrawal is ₦1,000'); return }
  if(max && val > maxVal){ showToast('Amount exceeds available balance'); return }

  // Proceed to success page and record withdrawal there
  const ref = params.get('ref');
  const target = ref ? `withdraw-success.html?amount=${encodeURIComponent(val)}&ref=${encodeURIComponent(ref)}` : `withdraw-success.html?amount=${encodeURIComponent(val)}`;
  location.href = target;
});

// Load user's saved bank details (if any) and display under the form
try{
  const userBank = JSON.parse(localStorage.getItem('userBank') || 'null');
  const noBankMsg = document.getElementById('noBankMsg');
  const bankDetailsEl = document.getElementById('bankDetails');
  if(userBank && userBank.accountName){
    const accName = document.getElementById('accountName');
    const accNo = document.getElementById('accountNumber');
    const bankName = document.getElementById('bankName');
    if(accName) accName.textContent = userBank.accountName || accName.textContent;
    if(accNo) accNo.textContent = userBank.accountNumber || accNo.textContent;
    if(bankName) bankName.textContent = userBank.bankName || bankName.textContent;
    if(noBankMsg) noBankMsg.style.display = 'none';
    if(bankDetailsEl) bankDetailsEl.style.display = 'block';
  } else {
    if(noBankMsg) noBankMsg.textContent = 'No bank details saved — add them to receive withdrawals.';
    if(bankDetailsEl) bankDetailsEl.style.display = 'none';
  }
}catch(e){/* ignore */}
