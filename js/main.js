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

// Load events from Supabase
async function loadEvents() {
  const eventsList = document.getElementById('eventsList');
  if (!eventsList) return;
  
  try {
    const { data: events, error } = await window.ainova.supabase
      .from('events')
      .select('*')
      .eq('status', 'upcoming')
      .order('event_date', { ascending: true });
    
    if (error) throw error;
    
    if (events.length === 0) {
      eventsList.innerHTML = '<div class="text-center text-gray-400 py-8"><p>暂无即将开始的活动</p></div>';
      return;
    }
    
    eventsList.innerHTML = events.map(event => {
      const date = new Date(event.event_date);
      const day = date.getDate().toString().padStart(2, '0');
      const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const year = date.getFullYear();
      const startTime = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      
      return `
        <div class="glass-card event-pulse p-8 rounded-lg border-l-4 border-cyan-400 flex flex-col md:flex-row gap-8 items-center">
          <div class="md:w-1/4 text-center md:text-left">
            <div class="text-5xl font-bold font-mono text-cyan-400">${day}</div>
            <div class="text-xl text-gray-400 font-mono">${month} ${year}</div>
            <div class="text-sm text-gray-600 mt-2 font-mono">${startTime}</div>
          </div>
          <div class="md:w-2/4">
            <h3 class="text-2xl font-bold mb-2">${event.title}</h3>
            <p class="text-gray-400 mb-4">${event.description}</p>
            <div class="flex flex-wrap gap-2">
              <span class="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-mono rounded">AI</span>
              <span class="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-mono rounded">Hands-on</span>
              <span class="px-3 py-1 bg-pink-500/20 text-pink-400 text-xs font-mono rounded">Limited: ${event.capacity}人</span>
            </div>
          </div>
          <div class="md:w-1/4 flex justify-end">
            <button onclick="openRegisterModal('${event.id}')" class="w-full md:w-auto px-6 py-3 bg-white/10 hover:bg-cyan-500 hover:text-black border border-white/20 transition-all font-mono font-bold rounded cursor-pointer">
              REGISTER_
            </button>
          </div>
        </div>
      `;
    }).join('');
    
  } catch (err) {
    console.error('❌ Load events error:', err);
    eventsList.innerHTML = '<div class="text-center text-red-400 py-8"><p>加载活动失败，请刷新页面</p></div>';
  }
}

// Load events when page loads
window.addEventListener('DOMContentLoaded', function() {
  // Wait for Supabase to be available
  if (typeof window.ainova !== 'undefined') {
    loadEvents();
  } else {
    // Wait a bit for supabase.js to load
    setTimeout(function() {
      if (typeof window.ainova !== 'undefined') {
        loadEvents();
      } else {
        console.error('❌ Supabase not initialized');
      }
    }, 500);
  }
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

// Current selected event ID
let currentEventId = null;

// Open register modal with event ID
window.openRegisterModal = function(eventId) {
  currentEventId = eventId;
  const modal = document.getElementById('registerModal');
  const modalContent = document.getElementById('modalContent');
  
  modal.classList.remove('hidden');
  
  setTimeout(() => {
    modalContent.classList.remove('scale-95', 'opacity-0');
    modalContent.classList.add('scale-100', 'opacity-100');
  }, 10);
  
  document.body.style.overflow = 'hidden';
};

// Handle form submission
document.getElementById('registerForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());
  
  if (!currentEventId) {
    alert('❌ 活动信息丢失，请刷新页面重试');
    return;
  }
  
  try {
    // Submit to Supabase
    const { error } = await window.ainova.supabase
      .from('registrations')
      .insert({
        event_id: currentEventId,
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
    
    // Reload events to refresh UI
    loadEvents();
    
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
