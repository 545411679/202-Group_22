const API_BASE = '/api';

let currentUser = null;
let currentUserId = null;

$(document).ready(function() {
    initApp();
});

function initApp() {
    checkAuth();
    setupEventListeners();
    loadExpertiseOptions();
}

function checkAuth() {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        currentUserId = currentUser.id;
        updateNavForLoggedInUser();
    }
}

function updateNavForLoggedInUser() {
    $('#nav-login').hide();
    $('#nav-user').show();
    $('#user-name').text(currentUser.fullName);
    
    if (currentUser.role === 'SPECIALIST' || currentUser.role === 'ADMIN') {
        $('.nav-links').append('<a href="#" class="nav-link" data-page="specialist-panel">专家面板</a>');
    }
}

function setupEventListeners() {
    $('.nav-link').click(function(e) {
        e.preventDefault();
        const page = $(this).data('page');
        if (page) {
            if (page === 'login') {
                showLoginForm();
            } else {
                showPage(page);
            }
        }
    });

    $('.tab-btn').click(function() {
        const tab = $(this).data('tab');
        $('.tab-btn').removeClass('active');
        $(this).addClass('active');
        if (tab === 'login') {
            $('#form-login').show();
            $('#form-register').hide();
        } else {
            $('#form-login').hide();
            $('#form-register').show();
        }
    });

    $('#form-login').submit(function(e) {
        e.preventDefault();
        login();
    });

    $('#form-register').submit(function(e) {
        e.preventDefault();
        register();
    });

    $('#btn-logout').click(logout);

    $('#filter-expertise, #filter-level').change(function() {
        loadSpecialists();
    });

    $('#filter-level').change(function() {
        loadSpecialists();
    });

    $('.filter-btn').click(function() {
        $('.filter-btn').removeClass('active');
        $(this).addClass('active');
        loadBookings($(this).data('status'));
    });

    $('#form-add-slot').submit(function(e) {
        e.preventDefault();
        addTimeSlot();
    });

    $('#form-booking').submit(function(e) {
        e.preventDefault();
        createBooking();
    });

    $('.modal-close, .modal').click(function(e) {
        if (e.target === this) {
            closeModal();
        }
    });

    $('#form-add-slot input[name="startTime"], #form-add-slot input[name="endTime"]').each(function() {
        $(this).attr('type', 'datetime-local');
    });
}

function showPage(page) {
    $('.page').hide();
    if (page === 'login') {
        $('#page-login').show();
    } else {
        $(`#page-${page}`).show();
    }
    $('.nav-link').removeClass('active');
    $(`.nav-link[data-page="${page}"]`).addClass('active');

    switch(page) {
        case 'home': break;
        case 'specialists': loadSpecialists(); break;
        case 'my-bookings': loadBookings('all'); break;
        case 'specialist-panel': loadSpecialistPanel(); break;
    }
}

function showLoginForm() {
    $('#page-login').hide();
    $('#page-login-form').show();
}

function showRegisterForm() {
    $('#page-login-form').hide();
    $('#page-login').show();
}

function login() {
    const data = {
        username: $('#form-login input[name="username"]').val(),
        password: $('#form-login input[name="password"]').val()
    };

    $.ajax({
        url: `${API_BASE}/auth/login`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function(res) {
            if (res.success) {
                currentUser = res.data;
                currentUserId = currentUser.id;
                localStorage.setItem('user', JSON.stringify(currentUser));
                updateNavForLoggedInUser();
                showToast('登录成功', 'success');
                showPage('home');
            } else {
                showToast(res.message, 'error');
            }
        },
        error: function() {
            showToast('登录失败，请检查用户名和密码', 'error');
        }
    });
}

function register() {
    const data = {
        username: $('#form-register input[name="username"]').val(),
        password: $('#form-register input[name="password"]').val(),
        fullName: $('#form-register input[name="fullName"]').val(),
        email: $('#form-register input[name="email"]').val(),
        phone: $('#form-register input[name="phone"]').val(),
        role: $('#form-register select[name="role"]').val()
    };

    $.ajax({
        url: `${API_BASE}/auth/register`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function(res) {
            if (res.success) {
                showToast('注册成功，请登录', 'success');
                $('.tab-btn[data-tab="login"]').click();
            } else {
                showToast(res.message, 'error');
            }
        },
        error: function(xhr) {
            const res = xhr.responseJSON;
            showToast(res?.message || '注册失败', 'error');
        }
    });
}

function logout() {
    currentUser = null;
    currentUserId = null;
    localStorage.removeItem('user');
    $('#nav-login').show();
    $('#nav-user').hide();
    $('.nav-link[data-page="specialist-panel"]').remove();
    showPage('home');
    showToast('已退出登录', 'success');
}

function loadExpertiseOptions() {
    $.ajax({
        url: `${API_BASE}/expertise/active`,
        success: function(res) {
            if (res.success) {
                let options = '<option value="">全部专业</option>';
                res.data.forEach(e => {
                    options += `<option value="${e.id}">${e.name}</option>`;
                });
                $('#filter-expertise').html(options);
            }
        }
    });
}

function loadSpecialists() {
    const expertise = $('#filter-expertise').val();
    const level = $('#filter-level').val();
    
    let url = `${API_BASE}/specialists/active`;
    const params = [];
    if (expertise) params.push(`expertise=${encodeURIComponent(expertise)}`);
    if (level) params.push(`level=${level}`);
    if (params.length) url += '?' + params.join('&');

    $.ajax({
        url: url,
        success: function(res) {
            if (res.success) {
                renderSpecialists(res.data);
            }
        }
    });
}

function renderSpecialists(specialists) {
    let html = '';
    specialists.forEach(s => {
        html += `
            <div class="specialist-card" onclick="showSpecialistDetail(${s.id})">
                <div class="name">${s.name}</div>
                <div class="expertise">${s.expertise?.name || '未分类'}</div>
                <div class="meta">
                    <span class="level-badge level-${s.level}">${getLevelText(s.level)}</span>
                    <span>¥${s.feePerHour}/小时</span>
                </div>
            </div>
        `;
    });
    if (!html) {
        html = '<p style="text-align:center;color:#999;">暂无专家</p>';
    }
    $('#specialists-list').html(html);
}

function getLevelText(level) {
    const map = { JUNIOR: '初级', SENIOR: '高级', EXPERT: '专家' };
    return map[level] || level;
}

function showSpecialistDetail(id) {
    $.ajax({
        url: `${API_BASE}/specialists/${id}`,
        success: function(res) {
            if (res.success) {
                renderSpecialistDetail(res.data);
            }
        }
    });
}

function renderSpecialistDetail(specialist) {
    let html = `
        <div class="detail-header">
            <h2>${specialist.name}</h2>
            <p class="expertise">${specialist.expertise?.name || '未分类'}</p>
            <p class="meta">
                <span class="level-badge level-${specialist.level}">${getLevelText(specialist.level)}</span>
                <span>费用: ¥${specialist.feePerHour}/小时</span>
            </p>
        </div>
        <h3>可用时段</h3>
    `;
    $('#specialist-detail-content').html(html);

    loadAvailableSlots(specialist.id);
    showPage('specialist-detail');
}

function loadAvailableSlots(specialistId) {
    $.ajax({
        url: `${API_BASE}/slots/available?specialistId=${specialistId}`,
        success: function(res) {
            if (res.success) {
                renderSlots(res.data);
            }
        }
    });
}

function renderSlots(slots) {
    let html = '<div class="slots-grid">';
    slots.forEach(s => {
        const start = new Date(s.startTime).toLocaleString('zh-CN');
        const end = new Date(s.endTime).toLocaleTimeString('zh-CN');
        html += `
            <div class="slot-card" onclick="${currentUser ? `selectSlot(${s.id}, '${s.specialistName}', '${start}', ${s.feePerHour || 0})` : 'showToast(\'请先登录\', \'error\')`}">
                <div>${start}</div>
                <div>至 ${end}</div>
            </div>
        `;
    });
    html += '</div>';
    if (!slots.length) {
        html = '<p style="text-align:center;color:#999;">暂无可用时段</p>';
    }
    $('#specialist-detail-content').append(html);
}

function selectSlot(slotId, specialistName, time, feePerHour) {
    $('#booking-slot-id').val(slotId);
    $('#selected-slot-info').html(`<strong>专家:</strong> ${specialistName}<br><strong>时间:</strong> ${time}`);
    $('#price-info').html(`预计费用: ¥${feePerHour}/小时`);
    openModal('modal-booking');
}

function closeModal() {
    $('.modal').removeClass('show');
}

function openModal(id) {
    $(`#${id}`).addClass('show');
}

function createBooking() {
    if (!currentUserId) {
        showToast('请先登录', 'error');
        return;
    }

    const data = {
        specialistId: parseInt($('#booking-specialist-id').val()) || 
            parseInt($('#specialist-detail-content').find('.specialist-card').data('id')) || 1,
        timeSlotId: parseInt($('#booking-slot-id').val()),
        topic: $('#form-booking input[name="topic"]').val(),
        notes: $('#form-booking textarea[name="notes"]').val()
    };

    $.ajax({
        url: `${API_BASE}/bookings?customerId=${currentUserId}`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function(res) {
            if (res.success) {
                showToast('预约成功', 'success');
                closeModal();
                showPage('my-bookings');
            } else {
                showToast(res.message, 'error');
            }
        },
        error: function(xhr) {
            const res = xhr.responseJSON;
            showToast(res?.message || '预约失败', 'error');
        }
    });
}

function loadBookings(status) {
    if (!currentUserId) {
        showToast('请先登录', 'error');
        showPage('login');
        return;
    }

    let url = `${API_BASE}/bookings?customerId=${currentUserId}`;
    
    $.ajax({
        url: url,
        success: function(res) {
            if (res.success) {
                let bookings = res.data;
                if (status !== 'all') {
                    bookings = bookings.filter(b => b.status === status);
                }
                renderBookings(bookings);
            }
        }
    });
}

function renderBookings(bookings) {
    let html = '';
    bookings.forEach(b => {
        const start = new Date(b.startTime).toLocaleString('zh-CN');
        html += `
            <div class="booking-card">
                <div class="header">
                    <span class="specialist">${b.specialistName}</span>
                    <span class="status-badge status-${b.status}">${getStatusText(b.status)}</span>
                </div>
                <div class="time">${start}</div>
                <div><strong>主题:</strong> ${b.topic || '-'}</div>
                <div><strong>费用:</strong> ¥${b.amount || 0}</div>
                <div class="actions">
                    ${getBookingActions(b)}
                </div>
            </div>
        `;
    });
    if (!html) {
        html = '<p style="text-align:center;color:#999;">暂无预约记录</p>';
    }
    $('#bookings-list').html(html);
}

function getStatusText(status) {
    const map = {
        PENDING: '待确认',
        CONFIRMED: '已确认',
        COMPLETED: '已完成',
        CANCELLED: '已取消',
        REJECTED: '已拒绝'
    };
    return map[status] || status;
}

function getBookingActions(booking) {
    let actions = '';
    if (booking.status === 'PENDING') {
        actions += `<button class="btn btn-danger" onclick="cancelBooking(${booking.id})">取消</button>`;
    }
    if (booking.status === 'CONFIRMED') {
        actions += `<button class="btn btn-secondary" onclick="rescheduleBooking(${booking.id})">改签</button>`;
        actions += `<button class="btn btn-danger" onclick="cancelBooking(${booking.id})">取消</button>`;
    }
    return actions;
}

function cancelBooking(id) {
    if (!confirm('确定要取消这个预约吗？')) return;

    $.ajax({
        url: `${API_BASE}/bookings/${id}/cancel`,
        method: 'PUT',
        success: function(res) {
            if (res.success) {
                showToast('预约已取消', 'success');
                loadBookings($('.filter-btn.active').data('status'));
            } else {
                showToast(res.message, 'error');
            }
        }
    });
}

function rescheduleBooking(id) {
    showToast('请选择新的时间段', 'success');
}

function loadSpecialistPanel() {
    if (!currentUser || (currentUser.role !== 'SPECIALIST' && currentUser.role !== 'ADMIN')) {
        showToast('无权限访问', 'error');
        showPage('home');
        return;
    }

    loadMySlots();
    loadSpecialistBookings();
}

function loadMySlots() {
    $.ajax({
        url: `${API_BASE}/slots?specialistId=${currentUserId}`,
        success: function(res) {
            if (res.success) {
                let html = '';
                res.data.forEach(s => {
                    const time = new Date(s.startTime).toLocaleString('zh-CN');
                    html += `<span class="slot-item">${time} ${s.available ? '(可用)' : '(已预约)'}</span>`;
                });
                if (!html) html = '<p style="color:#999;">暂无时段</p>';
                $('#my-slots').html(html);
            }
        }
    });
}

function addTimeSlot() {
    const startTime = $('#form-add-slot input[name="startTime"]').val();
    const endTime = $('#form-add-slot input[name="endTime"]').val();

    if (!startTime || !endTime) {
        showToast('请填写完整时间', 'error');
        return;
    }

    $.ajax({
        url: `${API_BASE}/slots?specialistId=${currentUserId}&startTime=${startTime}&endTime=${endTime}`,
        method: 'POST',
        success: function(res) {
            if (res.success) {
                showToast('时段添加成功', 'success');
                $('#form-add-slot')[0].reset();
                loadMySlots();
            } else {
                showToast(res.message, 'error');
            }
        }
    });
}

function loadSpecialistBookings() {
    $.ajax({
        url: `${API_BASE}/bookings?specialistId=${currentUserId}`,
        success: function(res) {
            if (res.success) {
                let html = '';
                res.data.forEach(b => {
                    const time = new Date(b.startTime).toLocaleString('zh-CN');
                    html += `
                        <div class="booking-card">
                            <div class="header">
                                <span>客户: ${b.customerName}</span>
                                <span class="status-badge status-${b.status}">${getStatusText(b.status)}</span>
                            </div>
                            <div>主题: ${b.topic || '-'}</div>
                            <div>时间: ${time}</div>
                            <div>费用: ¥${b.amount || 0}</div>
                            <div class="actions">
                                ${getSpecialistActions(b)}
                            </div>
                        </div>
                    `;
                });
                if (!html) html = '<p style="color:#999;">暂无预约</p>';
                $('#specialist-bookings').html(html);
            }
        }
    });
}

function getSpecialistActions(booking) {
    let actions = '';
    if (booking.status === 'PENDING') {
        actions += `<button class="btn btn-success" onclick="confirmBooking(${booking.id})">确认</button>`;
        actions += `<button class="btn btn-danger" onclick="rejectBooking(${booking.id})">拒绝</button>`;
    }
    if (booking.status === 'CONFIRMED') {
        actions += `<button class="btn btn-primary" onclick="completeBooking(${booking.id})">完成</button>`;
    }
    return actions;
}

function confirmBooking(id) {
    $.ajax({
        url: `${API_BASE}/bookings/${id}/confirm`,
        method: 'PUT',
        success: function(res) {
            if (res.success) {
                showToast('预约已确认', 'success');
                loadSpecialistBookings();
            }
        }
    });
}

function rejectBooking(id) {
    $.ajax({
        url: `${API_BASE}/bookings/${id}/reject`,
        method: 'PUT',
        success: function(res) {
            if (res.success) {
                showToast('预约已拒绝', 'success');
                loadSpecialistBookings();
            }
        }
    });
}

function completeBooking(id) {
    $.ajax({
        url: `${API_BASE}/bookings/${id}/complete`,
        method: 'PUT',
        success: function(res) {
            if (res.success) {
                showToast('预约已完成', 'success');
                loadSpecialistBookings();
            }
        }
    });
}

function showToast(message, type) {
    const toast = $('#toast');
    toast.text(message).removeClass('success error').addClass(type).addClass('show');
    setTimeout(() => toast.removeClass('show'), 3000);
}
