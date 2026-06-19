function $qs(sel){return document.querySelector(sel)}
const loginForm = $qs('#loginForm');
const toast = $qs('#toast');

function showToast(msg){
  toast.textContent = msg; toast.style.display = 'block';
  setTimeout(()=>{toast.style.display='none'},3000);
}

loginForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const email = loginForm.email.value.trim();
  const pass = loginForm.password.value;
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ showToast('Enter a valid email'); return }
  if(!pass){ showToast('Enter your password'); return }

  // Simulate authentication: store minimal session and redirect to dashboard
  sessionStorage.setItem('user', JSON.stringify({email, name: email.split('@')[0]}));
  // preserve ref if present
  const p = new URLSearchParams(location.search);
  const ref = p.get('ref');
  const target = ref ? `dashboard.html?ref=${encodeURIComponent(ref)}` : 'dashboard.html';
  showToast('Login simulated — redirecting...');
  setTimeout(()=> location.href = target, 800);
});
