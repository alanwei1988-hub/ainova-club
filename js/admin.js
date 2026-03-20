// AINova Admin Dashboard JavaScript

const SUPABASE_URL = 'https://rpxskfxuaqgzrfpbsgzn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_eCKBX0TP4ykyL7UXiVxb_g_st316sRi';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;

// ============================================
// Authentication
// ============================================

// Check if already logged in
async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    currentUser = session.user;
    showDashboard();
  }
}

// Login
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error) {
    document.getElementById('loginError').textContent = error.message;
    document.getElementById('loginError').classList.remove('hidden');
  } else {
    currentUser = data.user;
    showDashboard();
  }
});

// Logout
async function logout() {
  await supabase.auth.signOut();
  currentUser = null;
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('dashboard').classList.add('hidden');
}

// Show dashboard
function showDashboard() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  loadEvents();
}

// ============================================
// Tab Navigation
// ============================================

function showTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
  document.getElementById(tabName + 'Tab').classList.remove('hidden');
  
  if (tabName === 'events') loadEvents();
  if (tabName === 'registrations') loadRegistrations();
  if (tabName === 'gallery') loadGallery();
}

// ============================================
// Events Management
// ============================================

async function loadEvents() {
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: false });
  
  if (error) {
    console.error('Error loading events:', error);
    return;
  }
  
  const eventsList = document.getElementById('eventsList');
  eventsList.innerHTML = events.map(event => `
    <div class="glass-card rounded-xl p-6">
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <h3 class="text-xl font-bold mb-2">${event.title}</h3>
          <p class="text-gray-400 mb-4">${event.description}</p>
          <div class="flex gap-6 text-sm text-gray-500">
            <span>📅 ${new Date(event.event_date).toLocaleString('zh-CN')}</span>
            <span>📍 ${event.location}</span>
            <span>👥 ${event.capacity}人</span>
            <span class="${event.status === 'upcoming' ? 'text-green-400' : 'text-gray-400'}">${event.status}</span>
          </div>
        </div>
        <div class="flex gap-2">
          <button onclick="editEvent('${event.id}')" class="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors">编辑</button>
          <button onclick="viewRegistrations('${event.id}')" class="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors">查看报名</button>
          <button onclick="deleteEvent('${event.id}')" class="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">删除</button>
        </div>
      </div>
    </div>
  `).join('');
  
  // Update event filter dropdown
  const eventFilter = document.getElementById('eventFilter');
  eventFilter.innerHTML = '<option value="">全部活动</option>' + 
    events.map(event => `<option value="${event.id}">${event.title}</option>`).join('');
}

function openEventModal() {
  // TODO: Implement event creation modal
  alert('创建活动功能即将上线！');
}

function editEvent(eventId) {
  // TODO: Implement event editing
  alert('编辑活动功能即将上线！');
}

function deleteEvent(eventId) {
  if (confirm('确定要删除这个活动吗？')) {
    // TODO: Implement event deletion
  }
}

function viewRegistrations(eventId) {
  showTab('registrations');
  document.getElementById('eventFilter').value = eventId;
  loadRegistrations();
}

// ============================================
// Registrations Management
// ============================================

async function loadRegistrations() {
  const eventId = document.getElementById('eventFilter').value;
  
  let query = supabase
    .from('registrations')
    .select('*, events(title)')
    .order('created_at', { ascending: false });
  
  if (eventId) {
    query = query.eq('event_id', eventId);
  }
  
  const { data: registrations, error } = await query;
  
  if (error) {
    console.error('Error loading registrations:', error);
    return;
  }
  
  const registrationsList = document.getElementById('registrationsList');
  registrationsList.innerHTML = registrations.map(reg => `
    <tr class="hover:bg-white/5 transition-colors">
      <td class="px-6 py-4">${reg.name}</td>
      <td class="px-6 py-4 font-mono text-sm">${reg.phone}</td>
      <td class="px-6 py-4">${reg.school || '-'}</td>
      <td class="px-6 py-4">${reg.major || '-'}</td>
      <td class="px-6 py-4">${reg.grade || '-'}</td>
      <td class="px-6 py-4">${reg.events?.title || '-'}</td>
      <td class="px-6 py-4 text-sm text-gray-500">${new Date(reg.created_at).toLocaleDateString('zh-CN')}</td>
    </tr>
  `).join('');
}

// ============================================
// Gallery Management
// ============================================

async function loadGallery() {
  const { data: photos, error } = await supabase
    .from('gallery_photos')
    .select('*')
    .order('display_order', { ascending: true });
  
  if (error) {
    console.error('Error loading gallery:', error);
    return;
  }
  
  const galleryList = document.getElementById('galleryList');
  galleryList.innerHTML = photos.map(photo => `
    <div class="glass-card rounded-xl overflow-hidden group">
      <img src="${photo.image_url}" alt="${photo.caption}" class="w-full h-48 object-cover">
      <div class="p-4">
        <p class="text-sm text-gray-400 mb-2">${photo.caption || '无描述'}</p>
        <div class="flex gap-2">
          <button class="flex-1 px-3 py-2 bg-cyan-500/20 text-cyan-400 rounded text-sm hover:bg-cyan-500/30 transition-colors">编辑</button>
          <button class="flex-1 px-3 py-2 bg-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/30 transition-colors">删除</button>
        </div>
      </div>
    </div>
  `).join('');
}

function openPhotoModal() {
  // TODO: Implement photo upload modal
  alert('上传照片功能即将上线！');
}

// ============================================
// Initialize
// ============================================

checkAuth();
