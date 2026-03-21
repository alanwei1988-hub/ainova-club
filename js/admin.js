// AINova Admin Dashboard JavaScript

const SUPABASE_URL = 'https://rpxskfxuaqgzrfpbsgzn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_eCKBX0TP4ykyL7UXiVxb_g_st316sRi';

document.addEventListener('DOMContentLoaded', function() {
  console.log('🔧 Admin dashboard loading...');
  
  if (typeof window.supabase === 'undefined') {
    console.error('❌ Supabase library not loaded!');
    return;
  }
  
  // Initialize Supabase with persistent auth
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  });
  
  console.log('✅ Supabase initialized with persistent auth');
  
  let currentUser = null;

  // Check authentication
  async function checkAuth() {
    try {
      console.log('🔍 Checking auth session...');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth error:', error);
        return;
      }
      
      if (session) {
        console.log('✅ Session found:', session.user.email);
        currentUser = session.user;
        showDashboard();
      } else {
        console.log('ℹ️ No active session - showing login');
        const loginScreen = document.getElementById('loginScreen');
        const dashboard = document.getElementById('dashboard');
        if (loginScreen) loginScreen.classList.remove('hidden');
        if (dashboard) dashboard.classList.add('hidden');
      }
    } catch (err) {
      console.error('❌ Auth check error:', err);
    }
  }

  // Login handler
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const errorEl = document.getElementById('loginError');
      
      console.log('🔐 Login attempt:', email);
      
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
          console.error('Login error:', error);
          if (errorEl) {
            errorEl.textContent = '登录失败：' + error.message;
            errorEl.classList.remove('hidden');
          }
          return;
        }
        
        console.log('✅ Login successful:', data.user.email);
        currentUser = data.user;
        
        if (errorEl) errorEl.classList.add('hidden');
        showDashboard();
        
      } catch (err) {
        console.error('❌ Login exception:', err);
        if (errorEl) {
          errorEl.textContent = '登录异常：' + err.message;
          errorEl.classList.remove('hidden');
        }
      }
    });
  }

  // Logout
  window.logout = async function() {
    console.log('👋 Logging out...');
    await supabase.auth.signOut();
    currentUser = null;
    
    const loginScreen = document.getElementById('loginScreen');
    const dashboard = document.getElementById('dashboard');
    if (loginScreen) loginScreen.classList.remove('hidden');
    if (dashboard) dashboard.classList.add('hidden');
    
    console.log('✅ Logged out');
  };

  // Show dashboard
  function showDashboard() {
    console.log('📊 Showing dashboard...');
    
    const loginScreen = document.getElementById('loginScreen');
    if (loginScreen) loginScreen.classList.add('hidden');
    
    const dashboard = document.getElementById('dashboard');
    if (dashboard) dashboard.classList.remove('hidden');
    
    const modals = ['eventModal', 'photoModal'];
    modals.forEach(modalId => {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add('hidden');
        console.log('🔒 Closed modal:', modalId);
      }
    });
    
    document.querySelectorAll('.fixed.inset-0').forEach(el => {
      if (el.id !== 'dashboard' && el.id !== 'loginScreen') {
        el.classList.add('hidden');
      }
    });
    
    console.log('✅ Dashboard shown, all modals closed');
    loadEvents();
  }

  // Tab navigation
  window.showTab = function(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
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
      if (!eventsList) return;
      
      if (events.length === 0) {
        eventsList.innerHTML = '<p class="text-gray-400 text-center py-8">暂无活动，点击右上角新建</p>';
        return;
      }
      
      eventsList.innerHTML = events.map(event => `
        <div class="glass-card rounded-xl p-6">
          <div class="flex justify-between items-start flex-wrap gap-4">
            <div class="flex-1 min-w-0">
              <h3 class="text-xl font-bold mb-2">${event.title}</h3>
              <p class="text-gray-400 mb-4 text-sm">${event.description}</p>
              <div class="flex flex-wrap gap-4 text-xs text-gray-500">
                <span>📅 ${new Date(event.event_date).toLocaleString('zh-CN')}</span>
                <span>📍 ${event.location}</span>
                <span>👥 ${event.capacity}人</span>
                <span class="${event.status === 'upcoming' ? 'text-green-400' : 'text-gray-400'}">${event.status}</span>
              </div>
            </div>
            <div class="flex gap-2 flex-shrink-0">
              <button onclick="editEvent('${event.id}')" class="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors text-sm">编辑</button>
              <button onclick="viewRegistrations('${event.id}')" class="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors text-sm">查看报名</button>
            </div>
          </div>
        </div>
      `).join('');
      
      const eventFilter = document.getElementById('eventFilter');
      if (eventFilter) {
        eventFilter.innerHTML = '<option value="">全部活动</option>' + 
          events.map(event => `<option value="${event.id}">${event.title}</option>`).join('');
      }
      
    } catch (err) {
      console.error('❌ Load events error:', err);
    }
  };

  // Open create modal
  window.openCreateModal = function() {
    console.log('📝 Opening create modal');
    document.getElementById('modalTitle').textContent = '新建活动';
    document.getElementById('eventForm').reset();
    document.getElementById('eventId').value = '';
    document.getElementById('deleteBtn').classList.add('hidden');
    document.getElementById('eventModal').classList.remove('hidden');
  };

  // Close event modal
  window.closeEventModal = function() {
    console.log('❌ Closing event modal');
    document.getElementById('eventModal').classList.add('hidden');
  };

  // Edit event
  window.editEvent = async function(eventId) {
    try {
      const { data: event, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();
      
      if (error) throw error;
      
      document.getElementById('modalTitle').textContent = '编辑活动';
      document.getElementById('eventId').value = event.id;
      document.getElementById('eventTitle').value = event.title;
      document.getElementById('eventDescription').value = event.description;
      document.getElementById('eventLocation').value = event.location;
      document.getElementById('eventCapacity').value = event.capacity;
      document.getElementById('organizerEmail').value = event.organizer_email || '';
      
      const date = new Date(event.event_date);
      const localISO = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
      document.getElementById('eventDate').value = localISO;
      
      document.getElementById('deleteBtn').classList.remove('hidden');
      document.getElementById('eventModal').classList.remove('hidden');
      
    } catch (err) {
      console.error('❌ Load event error:', err);
      alert('加载活动信息失败');
    }
  };

  // Save event (create or update)
  const eventForm = document.getElementById('eventForm');
  if (eventForm) {
    eventForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const eventId = document.getElementById('eventId').value;
      const eventData = {
        title: document.getElementById('eventTitle').value.trim(),
        description: document.getElementById('eventDescription').value.trim(),
        location: document.getElementById('eventLocation').value.trim(),
        capacity: parseInt(document.getElementById('eventCapacity').value),
        event_date: new Date(document.getElementById('eventDate').value).toISOString(),
        organizer_email: document.getElementById('organizerEmail').value.trim(),
        updated_at: new Date().toISOString()
      };
      
      try {
        if (eventId) {
          const { error } = await supabase
            .from('events')
            .update(eventData)
            .eq('id', eventId);
          
          if (error) throw error;
          console.log('✅ Event updated');
          
        } else {
          eventData.status = 'upcoming';
          const { error } = await supabase
            .from('events')
            .insert([eventData]);
          
          if (error) throw error;
          console.log('✅ Event created');
        }
        
        closeEventModal();
        loadEvents();
        alert('活动保存成功！');
        
      } catch (err) {
        console.error('❌ Save event error:', err);
        alert('保存失败：' + err.message);
      }
    });
  }

  // Delete event
  window.deleteEvent = async function() {
    const eventId = document.getElementById('eventId').value;
    if (!eventId) return;
    
    if (!confirm('确定要删除这个活动吗？相关报名数据也会被删除。')) return;
    
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);
      
      if (error) throw error;
      
      console.log('✅ Event deleted');
      closeEventModal();
      loadEvents();
      alert('活动已删除');
      
    } catch (err) {
      console.error('❌ Delete error:', err);
      alert('删除失败：' + err.message);
    }
  };

  // View registrations
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

  // =============================================
  // 照片管理（修复：编辑和删除功能）
  // =============================================

  // Load gallery
  window.loadGallery = async function() {
    try {
      const { data: photos, error } = await supabase
        .from('gallery_photos')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const galleryList = document.getElementById('galleryList');
      if (!galleryList) return;
      
      if (photos.length === 0) {
        galleryList.innerHTML = '<p class="text-gray-400 col-span-3 text-center py-8">暂无照片</p>';
        return;
      }
      
      // 修复：给每张照片的按钮绑定正确的 id 和数据
      galleryList.innerHTML = photos.map(photo => `
        <div class="glass-card rounded-xl overflow-hidden">
          <img src="${photo.image_url}" alt="${photo.caption || ''}" class="w-full h-48 object-cover">
          <div class="p-4">
            <p class="text-sm text-gray-400 mb-3">${photo.caption || '无描述'}</p>
            <div class="flex gap-2">
              <button
                onclick="editPhoto('${photo.id}', '${(photo.caption || '').replace(/'/g, "\\'")}', ${photo.display_order || 0})"
                class="flex-1 px-3 py-2 bg-cyan-500/20 text-cyan-400 rounded text-xs hover:bg-cyan-500/30 transition-colors">
                编辑
              </button>
              <button
                onclick="deletePhoto('${photo.id}', '${(photo.image_url || '').replace(/'/g, "\\'")}')"
                class="flex-1 px-3 py-2 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30 transition-colors">
                删除
              </button>
            </div>
          </div>
        </div>
      `).join('');
      
    } catch (err) {
      console.error('❌ Load gallery error:', err);
    }
  };

  // 编辑照片：弹窗确认后更新描述和排序
  window.editPhoto = async function(photoId, currentCaption, currentOrder) {
    const newCaption = prompt('请输入新的照片描述：', currentCaption);
    if (newCaption === null) return; // 用户点了取消

    const newOrderInput = prompt('请输入显示顺序（数字越小越靠前）：', currentOrder);
    if (newOrderInput === null) return; // 用户点了取消

    const newOrder = parseInt(newOrderInput);
    if (isNaN(newOrder)) {
      alert('显示顺序必须是数字，请重试');
      return;
    }

    if (!confirm(`确定要保存以下修改吗？\n\n描述：${newCaption}\n顺序：${newOrder}`)) return;

    try {
      const { error } = await supabase
        .from('gallery_photos')
        .update({
          caption: newCaption.trim() || null,
          display_order: newOrder
        })
        .eq('id', photoId);

      if (error) throw error;

      console.log('✅ Photo updated');
      alert('照片信息已更新！');
      loadGallery();

    } catch (err) {
      console.error('❌ Edit photo error:', err);
      alert('更新失败：' + err.message);
    }
  };

  // 删除照片：弹窗确认后同时删除数据库记录和存储文件
  window.deletePhoto = async function(photoId, imageUrl) {
    if (!confirm('确定要删除这张照片吗？此操作不可撤销。')) return;

    try {
      // 从 URL 中提取文件名，用于删除存储桶中的文件
      const fileName = imageUrl.split('/').pop().split('?')[0];

      // 先删除数据库记录
      const { error: dbError } = await supabase
        .from('gallery_photos')
        .delete()
        .eq('id', photoId);

      if (dbError) throw dbError;

      // 再删除存储桶中的图片文件（即使失败也不影响主流程）
      await supabase.storage
        .from('gallery-photos')
        .remove([fileName]);

      console.log('✅ Photo deleted');
      alert('照片已删除！');
      loadGallery();

    } catch (err) {
      console.error('❌ Delete photo error:', err);
      alert('删除失败：' + err.message);
    }
  };

  // Open photo upload modal
  window.openPhotoModal = async function() {
    try {
      const { data: events } = await supabase
        .from('events')
        .select('id, title')
        .order('event_date', { ascending: false });
      
      const photoEvent = document.getElementById('photoEvent');
      if (photoEvent && events) {
        photoEvent.innerHTML = '<option value="">不关联活动</option>' + 
          events.map(e => `<option value="${e.id}">${e.title}</option>`).join('');
      }
    } catch (err) {
      console.error('Load events error:', err);
    }
    
    document.getElementById('photoForm').reset();
    document.getElementById('photoModal').classList.remove('hidden');
  };

  // Close photo modal
  window.closePhotoModal = function() {
    document.getElementById('photoModal').classList.add('hidden');
  };

  // Handle photo upload
  const photoForm = document.getElementById('photoForm');
  if (photoForm) {
    photoForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const fileInput = document.getElementById('photoFile');
      const caption = document.getElementById('photoCaption').value.trim();
      const eventId = document.getElementById('photoEvent').value;
      const displayOrder = parseInt(document.getElementById('photoOrder').value) || 0;
      
      if (!fileInput.files || fileInput.files.length === 0) {
        alert('请选择照片');
        return;
      }
      
      const file = fileInput.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('gallery-photos')
          .upload(fileName, file);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('gallery-photos')
          .getPublicUrl(fileName);
        
        const { error: dbError } = await supabase
          .from('gallery_photos')
          .insert([{
            image_url: publicUrl,
            caption: caption || null,
            event_id: eventId || null,
            display_order: displayOrder
          }]);
        
        if (dbError) throw dbError;
        
        console.log('✅ Photo uploaded');
        closePhotoModal();
        loadGallery();
        alert('照片上传成功！');
        
      } catch (err) {
        console.error('❌ Upload error:', err);
        alert('上传失败：' + err.message);
      }
    });
  }

  // Initialize
  console.log('🚀 Initializing admin dashboard...');
  checkAuth();
});
