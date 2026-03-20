'use strict';

const form = document.getElementById('rdv-form');
if (!form) { /* page sans formulaire, on sort */ }
else {

  const rules = {
    fname:   { required: true, min: 2,  label: 'Nom' },
    fphone:  { required: true, pattern: /^[\d\s+\-().]{8,}$/, label: 'Téléphone' },
    femail:  { required: false, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, label: 'Email' },
    fvtype:  { required: true, label: 'Type de véhicule' },
    fmsg:    { required: true, min: 10, label: 'Message' },
  };

  function validate(name, value) {
    const r = rules[name];
    if (!r) return null;
    if (r.required && !value.trim()) return `${r.label} est requis`;
    if (r.min && value.trim().length < r.min) return `${r.label} : minimum ${r.min} caractères`;
    if (r.pattern && value.trim() && !r.pattern.test(value.trim())) return `${r.label} invalide`;
    return null;
  }

  function setError(field, msg) {
    clearState(field);
    field.classList.add('input-error');
    const err = document.createElement('span');
    err.className = 'form-error-msg';
    err.textContent = msg;
    field.parentNode.appendChild(err);
  }

  function setOk(field) {
    clearState(field);
    field.classList.add('input-ok');
  }

  function clearState(field) {
    field.classList.remove('input-error', 'input-ok');
    const prev = field.parentNode.querySelector('.form-error-msg');
    if (prev) prev.remove();
  }

  Object.keys(rules).forEach(name => {
    const field = form.elements[name];
    if (!field) return;
    field.addEventListener('blur', () => {
      const err = validate(name, field.value);
      err ? setError(field, err) : setOk(field);
    });
    field.addEventListener('input', () => clearState(field));
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    Object.keys(rules).forEach(name => {
      const field = form.elements[name];
      if (!field) return;
      const err = validate(name, field.value);
      if (err) { setError(field, err); ok = false; }
      else setOk(field);
    });
    if (!ok) {
      form.querySelector('.input-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const btn = form.querySelector('[type=submit]');
    btn.disabled = true;
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin .8s linear infinite"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> Envoi…`;

    setTimeout(() => {
      form.style.display = 'none';
      document.getElementById('form-ok').classList.add('show');
    }, 1400);
  });
}

/* spin keyframe */
const s = document.createElement('style');
s.textContent = '@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}';
document.head.appendChild(s);
