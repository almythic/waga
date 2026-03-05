(function() {
  const toast = document.getElementById('copyToast');
  let timeout;

  function showToast(hex) {
    clearTimeout(timeout);
    toast.textContent = 'Copied ' + hex;
    toast.classList.add('visible');
    timeout = setTimeout(() => toast.classList.remove('visible'), 1500);
  }

  function copyHex(el) {
    const hexEl = el.querySelector('.swatch-hex');
    if (!hexEl) return;
    const hex = hexEl.textContent.trim();
    navigator.clipboard.writeText(hex).then(() => showToast(hex));
  }

  document.querySelectorAll('.swatch, .brand-swatch').forEach(el => {
    el.addEventListener('click', () => copyHex(el));
  });
})();
