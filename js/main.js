// AINova Club - Main JavaScript

// Binary Wave Animation
const canvas = document.getElementById('binaryCanvas');
const ctx = canvas.getContext('2d');
let width, height;
let particles = [];
const binaryChars = ['0', '1'];
const fontSize = 14;
const columns = [];
let drops = [];

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  const columnCount = Math.floor(width / fontSize);
  drops = [];
  for (let i = 0; i < columnCount; i++) {
    drops[i] = Math.random() * -100;
  }
}

function draw() {
  ctx.fillStyle = 'rgba(5, 5, 5, 0.05)';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#00f5ff';
  ctx.font = fontSize + 'px JetBrains Mono';
  for (let i = 0; i < drops.length; i++) {
    const text = binaryChars[Math.floor(Math.random() * binaryChars.length)];
    ctx.globalAlpha = Math.random() * 0.5 + 0.1;
    ctx.fillText(text, i * fontSize, drops[i] * fontSize);
    if (drops[i] * fontSize > height && Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i]++;
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(draw);
}

resize();
window.addEventListener('resize', resize);
draw();

// Create floating binary particles
const particlesContainer = document.getElementById('binaryParticles');
for (let i = 0; i < 20; i++) {
  const particle = document.createElement('div');
  particle.className = 'binary-rain';
  particle.textContent = Math.random() > 0.5 ? '01010' : '10101';
  particle.style.left = Math.random() * 100 + '%';
  particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
  particle.style.animationDelay = Math.random() * 5 + 's';
  particlesContainer.appendChild(particle);
}

// Intersection Observer for scroll animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe all cards
document.querySelectorAll('.glass-card, .photo-item').forEach((el) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// Glitch text randomization
setInterval(() => {
  const glitchElements = document.querySelectorAll('.glitch');
  glitchElements.forEach(el => {
    if (Math.random() > 0.95) {
      el.style.animation = 'none';
      setTimeout(() => {
        el.style.animation = '';
      }, 100);
    }
  });
}, 3000);

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      // Close mobile menu after clicking
      if (mobileMenu) {
        mobileMenu.classList.add('hidden');
      }
    }
  });
});

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });
}

// Register Modal Functions
function openRegisterModal() {
  const modal = document.getElementById('registerModal');
  const modalContent = document.getElementById('modalContent');
  
  modal.classList.remove('hidden');
  
  // Animate modal content (radial expansion effect)
  setTimeout(() => {
    modalContent.classList.remove('scale-95', 'opacity-0');
    modalContent.classList.add('scale-100', 'opacity-100');
  }, 10);
  
  // Prevent body scroll
  document.body.style.overflow = 'hidden';
}

function closeRegisterModal() {
  const modal = document.getElementById('registerModal');
  const modalContent = document.getElementById('modalContent');
  
  // Animate modal close
  modalContent.classList.remove('scale-100', 'opacity-100');
  modalContent.classList.add('scale-95', 'opacity-0');
  
  setTimeout(() => {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }, 300);
}

// Handle form submission
document.getElementById('registerForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());
  
  // Get event ID from URL or default to first upcoming event
  const eventId = new URLSearchParams(window.location.search).get('event') || 'default';
  
  try {
    // Submit to Supabase
    const { error } = await window.ainova.supabase
      .from('registrations')
      .insert({
        event_id: eventId,
        name: data.name,
        phone: data.phone,
        school: data.school || null,
        major: data.major || null,
        grade: data.grade || null,
        nickname: data.nickname || null
      });
    
    if (error) throw error;
    
    // Show success message
    alert('🎉 报名成功！\n\n姓名：' + data.name + '\n学校：' + (data.school || '未填写') + '\n\n我们会尽快联系你！');
    
    closeRegisterModal();
    this.reset();
    
  } catch (error) {
    console.error('Registration error:', error);
    alert('❌ 报名失败：' + error.message + '\n\n请稍后重试或联系我们。');
  }
});

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeRegisterModal();
  }
});
