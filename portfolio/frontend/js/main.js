// ── Config ───────────────────────────────────────────────────────────────────
// Change this to your deployed backend URL after hosting
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : '/api';  // same domain when deployed together

// ── DOM Ready ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  checkAPIHealth();
  loadProjects();
  initPhotoUpload();
  initScrollReveal();
  initHamburger();
  initContactForm();
  initAddProjectModal();
});

// ── API Health Check ─────────────────────────────────────────────────────────
async function checkAPIHealth() {
  const badge = document.getElementById('api-status');
  badge.textContent = '⏳ Connecting...';
  badge.className = 'checking';
  try {
    const res = await fetch(`${API_BASE}/health`);
    const data = await res.json();
    if (data.success) {
      badge.textContent = '🟢 Database Connected';
      badge.className = 'connected';
      setTimeout(() => badge.style.opacity = '0', 4000);
    }
  } catch {
    badge.textContent = '🔴 Backend Offline';
    badge.className = 'disconnected';
  }
}

// ── Load Projects from MongoDB ───────────────────────────────────────────────
async function loadProjects() {
  const grid = document.getElementById('projects-grid');

  // Show skeletons
  grid.innerHTML = `
    <div class="skeleton skeleton-card"></div>
    <div class="skeleton skeleton-card"></div>
    <div class="skeleton skeleton-card"></div>
  `;

  try {
    const res  = await fetch(`${API_BASE}/projects`);
    const data = await res.json();

    if (!data.success || !data.data.length) {
      grid.innerHTML = '<p style="color:var(--muted);font-size:14px;">No projects found.</p>';
      return;
    }

    grid.innerHTML = data.data.map(p => `
      <div class="project-card reveal" data-id="${p._id}">
        <div class="project-num">Project ${p.number || '—'}</div>
        <div class="project-title">${p.title}</div>
        <p class="project-desc">${p.description}</p>
        <div class="skill-tags">
          ${(p.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}
        </div>
        <div class="project-links">
          ${p.githubLink ? `<a href="${p.githubLink}" target="_blank">⭐ GitHub</a>` : ''}
          ${p.liveLink   ? `<a href="${p.liveLink}"   target="_blank">🔗 Live Demo</a>` : ''}
        </div>
      </div>
    `).join('');

    // Re-run reveal on newly added cards
    initScrollReveal();
  } catch (err) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;color:var(--muted);padding:40px;">
        <p style="font-size:16px;">⚠️ Could not load projects from database.</p>
        <p style="font-size:13px;margin-top:8px;">Make sure the backend server is running.</p>
      </div>`;
  }
}

// ── Add Project Modal ────────────────────────────────────────────────────────
function initAddProjectModal() {
  const overlay    = document.getElementById('add-project-modal');
  const openBtn    = document.getElementById('open-add-project');
  const closeBtn   = document.getElementById('modal-close');
  const form       = document.getElementById('add-project-form');
  const alertEl    = document.getElementById('modal-alert');

  openBtn.addEventListener('click', () => overlay.classList.add('open'));
  closeBtn.addEventListener('click', () => overlay.classList.remove('open'));
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('open'); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertEl.style.display = 'none';

    const payload = {
      number:      document.getElementById('p-number').value,
      title:       document.getElementById('p-title').value,
      description: document.getElementById('p-desc').value,
      tags:        document.getElementById('p-tags').value.split(',').map(t => t.trim()).filter(Boolean),
      githubLink:  document.getElementById('p-github').value,
      liveLink:    document.getElementById('p-live').value
    };

    try {
      const res  = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        showAlert(alertEl, 'success', '✅ Project added successfully!');
        form.reset();
        setTimeout(() => { overlay.classList.remove('open'); loadProjects(); }, 1200);
      } else {
        showAlert(alertEl, 'error', '❌ ' + data.message);
      }
    } catch {
      showAlert(alertEl, 'error', '❌ Server error. Is the backend running?');
    }
  });
}

// ── Contact Form ─────────────────────────────────────────────────────────────
function initContactForm() {
  const form = document.getElementById('contact-form');
  const msg  = document.getElementById('contact-msg');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.style.display = 'none';

    const payload = {
      name:    document.getElementById('cf-name').value,
      email:   document.getElementById('cf-email').value,
      message: document.getElementById('cf-message').value
    };

    try {
      const res  = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      msg.textContent    = data.success ? '✅ ' + data.message : '❌ ' + data.message;
      msg.style.display  = 'block';
      if (data.success) form.reset();
    } catch {
      msg.textContent   = '❌ Server error. Please email me directly.';
      msg.style.display = 'block';
    }
  });
}

// ── Photo Upload ─────────────────────────────────────────────────────────────
function initPhotoUpload() {
  const slot        = document.getElementById('photo-slot');
  const input       = document.getElementById('photo-input');
  const img         = document.getElementById('profile-photo');
  const placeholder = document.getElementById('photo-placeholder');

  slot.addEventListener('click', () => input.click());

  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      img.src = ev.target.result;
      img.classList.add('loaded');
      placeholder.style.display = 'none';
    };
    reader.readAsDataURL(file);
  });
}

// ── Scroll Reveal ────────────────────────────────────────────────────────────
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal:not(.visible)');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
  reveals.forEach(el => observer.observe(el));
}

// ── Hamburger Menu ────────────────────────────────────────────────────────────
function initHamburger() {
  const btn   = document.getElementById('hamburger');
  const links = document.getElementById('nav-links');
  if (!btn) return;
  btn.addEventListener('click', () => links.classList.toggle('open'));
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => links.classList.remove('open'));
  });
}

// ── Util: show alert inside modal ────────────────────────────────────────────
function showAlert(el, type, text) {
  el.textContent   = text;
  el.className     = `alert ${type}`;
  el.style.display = 'block';
}
