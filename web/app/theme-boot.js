// Preferences only; no credentials or session data are read or persisted here.
try{const preference=localStorage.getItem('tomitrack-theme')||'system';const dark=preference==='dark'||(preference==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=dark?'dark':'light';document.documentElement.style.colorScheme=dark?'dark':'light'}catch{}
