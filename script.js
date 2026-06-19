function $qs(sel){return document.querySelector(sel)}
const form = $qs('#registerForm');
const refInput = $qs('#ref');
const toast = $qs('#toast');

// Parse ?ref= from URL and populate referral field
const params = new URLSearchParams(location.search);
if(params.has('ref')){
  refInput.value = params.get('ref');
}
// Set login links to preserve ref when present
const footerLogin = $qs('#footerLogin');
const loginBtnLink = $qs('#loginBtnLink');
if(footerLogin){
  const ref = params.get('ref');
  footerLogin.href = ref ? `login.html?ref=${encodeURIComponent(ref)}` : 'login.html';
}
if(loginBtnLink){
  const ref = params.get('ref');
  loginBtnLink.href = ref ? `login.html?ref=${encodeURIComponent(ref)}` : 'login.html';
}

function showToast(msg){
  toast.textContent = msg; toast.style.display = 'block';
  setTimeout(()=>{toast.style.display='none'},3000);
}

form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const pass = form.password.value;
  const agree = form.agree.checked;

  if(!name){ showToast('Please enter your full name'); return }
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ showToast('Enter a valid email'); return }
  if(pass.length < 6){ showToast('Password must be at least 6 characters'); return }
  if(!agree){ showToast('You must agree to the Terms'); return }

  // Frontend-only demo: show success, log data and redirect to login
  const refVal = form.ref.value || (params.has('ref') ? params.get('ref') : '');
  showToast('Registration simulated — redirecting to login');
  console.log('Simulated registration:', {name, email, ref: refVal});
  setTimeout(()=>{
    form.reset();
    if(params.has('ref')) refInput.value = params.get('ref');
    const target = refVal ? `login.html?ref=${encodeURIComponent(refVal)}` : 'login.html';
    location.href = target;
  }, 800);
});
