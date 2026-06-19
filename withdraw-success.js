const paramsSuccess = new URLSearchParams(location.search);
const amountSuccess = paramsSuccess.get('amount');
const msg = document.getElementById('msg');
const amountText = document.getElementById('amountText');

if(amountSuccess){
  amountText.textContent = `Amount withdrawn: ₦${Number(amountSuccess).toFixed(2)}`;
} else {
  amountText.textContent = '';
}

// Record the withdrawal locally
const record = {amount: amountSuccess ? Number(amountSuccess) : 0, at: new Date().toISOString()};
const withdrawals = JSON.parse(localStorage.getItem('withdrawals') || '[]');
withdrawals.push(record);
localStorage.setItem('withdrawals', JSON.stringify(withdrawals));
