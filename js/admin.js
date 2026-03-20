// AINova Admin Dashboard JavaScript

const SUPABASE_URL = 'https://rpxskfxuaqgzrfpbsgzn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_eCKBX0TP4ykyL7UXiVxb_g_st316sRi';

// Wait for DOM and Supabase library
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔧 Admin dashboard loading...');
  
  // Check if Supabase is loaded
  if (typeof window.supabase === 'undefined') {
    console.error('❌ Supabase library not loaded!');
    const errorEl = document.getElementById('loginError');
    if (errorEl) {
      errorEl.textContent = 'Supabase 库未加载，请刷新页面';
      errorEl.classList.remove('hidden');
    }
    return;
  }
  
  // Initialize Supabase client
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('✅ Supabase initialized');
  
  let currentUser = null;

  // Check authentication status
  async function checkAuth() {
    try {
      console.log('🔍 Checking auth session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session) {
        console.log('✅ Session found:', session.user.email);
        currentUser = session.user;
        showDashboard();
      } else {
        console.log('ℹ️ No active session');
      }
    } catch (err) {
      console.error('❌ Auth check error:', err);
    }
  }

  // Handle login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const errorEl = document.getElementById('loginError');
      
      console.log('🔐 Login attempt:', email);
      
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });
        
        if (error) throw error;
        
        console.log('✅ Login successful:', data.user.email);
        currentUser = data.user;
        
        if (errorEl) errorEl.classList.add('hidden');
        showDashboard();
        
      } catch (err) {
        console.error('❌ Login error:', err);
        if (errorEl) {
          errorEl.textContent = '登录失败：' + err.message;
          errorEl.classList.remove('hidden');
        }
      }
    });
  }

  // Logout function
  window.logout = async function() {
    console.log('👋 Logging out...');
    try {
      await supabase.auth.signOut();
      currentUser = null;
      document.getElementById('loginScreen').classList.remove('hidden');
      document.getElementById('dashboard').classList.add('hidden');
      console.log('✅ Logged out');
    } catch (err) {
      console.error('❌ Logout error:', err);
    }
  };

  // Show dashboard
  function showDashboard() {
    console.log('📊 Showing dashboard...');
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    loadEvents();
  }

  // Tab navigation
  window.showTab = function(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.classList.add('hidden');
    });
    document.getElementById(tabName + 'Tab').classList.remove('hidden');
    
    if (tabName === 'events') loadEvents();
    if (tabName === 'registrations') loadRegistrations();
    if (tabName === 'gallery') loadGallery();
  };

  // Load events
  window.loadEvents = async function() {
    try {
      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false });
      
      if (error) throw error;
      
      const eventsList = document.getElementById('eventsList');
      if (!eventsList || events.length === 0) {
        if (eventsList) eventsList.innerHTML = '<p class="text-gray-400">暂无活动</p>';
        return;
      }
      
      eventsList.innerHTML = events.map(event => `
        <div class="glass-card rounded-xl p-6">
          <div class="flex justify-between items-start flex-wrap gap-4">
            <div class="flex-1 min-w-0">
              <h3 class="text-xl font-bold mb-2 truncate">${event.title}</h3>
              <p class="text-gray-400 mb-4 text-sm">${event.description}</p>
              <div class="flex flex-wrap gap-4 text-xs text-gray-500">
                <span>📅 ${new Date(event.event_date).toLocaleString('zh-CN')}</span>
                <span>📍 ${event.location}</span>
                <span>👥 ${event.capacity}人</span>
                <span class="${event.status === 'upcoming' ? 'text-green-400' : 'text-gray-400'}">${event.status}</span>
              </div>
            </div>
            <div class="flex gap-2 flex-shrink-0">
              <button onclick="alert('编辑功能开发中')" class="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors text-sm">编辑</button>
              <button onclick="viewRegistrations('${event.id}')" class="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors text-sm">查看报名</button>
            </div>
          </div>
        </div>
      `).join('');
      
      // Update event filter
      const eventFilter = document.getElementById('eventFilter');
      if (eventFilter) {
        eventFilter.innerHTML = '<option value="">全部活动</option>' + 
          events.map(event => `<option value="${event.id}">${event.title}</option>`).join('');
      }
      
    } catch (err) {
      console.error('❌ Load events error:', err);
    }
  };

  // View registrations for specific event
  window.viewRegistrations = function(eventId) {
    showTab('registrations');
    const eventFilter = document.getElementById('eventFilter');
    if (eventFilter) eventFilter.value = eventId;
    loadRegistrations();
  };

  // Load registrations
  window.loadRegistrations = async function() {
    try {
      const eventId = document.getElementById('eventFilter')?.value;
      
      let query = supabase
        .from('registrations')
        .select('*, events(title)')
        .order('created_at', { ascending: false });
      
      if (eventId) {
        query = query.eq('event_id', eventId);
      }
      
      const { data: registrations, error } = await query;
      
      if (error) throw error;
      
      const registrationsList = document.getElementById('registrationsList');
      if (!registrationsList) return;
      
      if (registrations.length === 0) {
        registrationsList.innerHTML = '<tr><td colspan="7" class="px-6 py-8 text-center text-gray-400">暂无报名数据</td></tr>';
        return;
      }
      
      registrationsList.innerHTML = registrations.map(reg => `
        <tr class="hover:bg-white/5 transition-colors">
          <td class="px-6 py-4">${reg.name || '-'}</td>
          <td class="px-6 py-4 font-mono text-sm">${reg.phone || '-'}</td>
          <td class="px-6 py-4">${reg.school || '-'}</td>
          <td class="px-6 py-4">${reg.major || '-'}</td>
          <td class="px-6 py-4">${reg.grade || '-'}</td>
          <td class="px-6 py-4 text-sm">${reg.events?.title || '-'}</td>
          <td class="px-6 py-4 text-xs text-gray-500">${new Date(reg.created_at).toLocaleDateString('zh-CN')}</td>
        </tr>
      `).join('');
      
    } catch (err) {
      console.error('❌ Load registrations error:', err);
    }
  };

  // Load gallery
  window.loadGallery = async function() {
    try {
      const { data: photos, error } = await supabase
        .from('gallery_photos')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      
      const galleryList = document.getElementById('galleryList');
      if (!galleryList) return;
      
      if (photos.length === 0) {
        galleryList.innerHTML = '<p class="text-gray-400 col-span-3 text-center py-8">暂无照片</p>';
        return;
      }
      
      galleryList.innerHTML = photos.map(photo => `
        <div class="glass-card rounded-xl overflow-hidden group">
          <img src="${photo.image_url}" alt="${photo.caption}" class="w-full h-48 object-cover" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'200\'%3E%3Crect fill=\'%23333\' width=\'400\' height=\'200\'/%3E%3Ctext fill=\'%23999\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\'%3EImage not found%3C/text%3E%3C/svg%3E'">
          <div class="p-4">
            <p class="text-sm text-gray-400 mb-3">${photo.caption || '无描述'}</p>
            <div class="flex gap-2">
              <button class="flex-1 px-3 py-2 bg-cyan-500/20 text-cyan-400 rounded text-xs hover:bg-cyan-500/30 transition-colors">编辑</button>
              <button class="flex-1 px-3 py-2 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30 transition-colors">删除</button>
            </div>
          </div>
        </div>
      `).join('');
      
    } catch (err) {
      console.error('❌ Load gallery error:', err);
    }
  };

  // Open photo modal
  window.openPhotoModal = function() {
    alert('照片上传功能开发中！');
  };

  // Initialize
  console.log('🚀 Initializing admin dashboard...');
  checkAuth();
});
