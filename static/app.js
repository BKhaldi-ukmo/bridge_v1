let currentUser = null;
let currentSessionData = null;

// Initialize app - restore session if available
function initializeApp() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            // Check if user session is still valid
            if (currentUser.type === 'parent') {
                showScreen('parentDashboard');
                loadParentDashboard();
            } else if (currentUser.type === 'specialist') {
                showScreen('specialistDashboard');
                loadSpecialistDashboard();
            }
        } catch (e) {
            localStorage.removeItem('currentUser');
            showScreen('selectionScreen');
        }
    } else {
        showScreen('selectionScreen');
    }
}

// Save user to localStorage
function saveUserSession(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

// Remove user from localStorage
function clearUserSession() {
    localStorage.removeItem('currentUser');
}

// Translation mapping for folder names
const folderTranslations = {
    // Main categories
    'clothes': 'الملابس',
    'vegetables': 'الخضروات',
    'animals': 'الحيوانات',
    
    // Clothes subcategories
    'shorts': 'شورت',
    'tshirts': 'قمصان',
    'pants': 'بنطال',
    'dress': 'فستان',
    'hats': 'قبعات',
    'jackets': 'سترات',
    'sweaters': 'كنزات',
    
    // Vegetables subcategories
    'potatoes': 'بطاطس',
    'tomatoes': 'طماطم',
    'carrots': 'جزر',
    
    // Animals subcategories
    'dogs': 'كلاب',
    'cats': 'قطط',
    'birds': 'طيور'
};

// Function to get Arabic translation for folder names
function getArabicName(englishName) {
    return folderTranslations[englishName] || englishName;
}

function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    // Show target screen
    document.getElementById(screenId).classList.add('active');
}

function handleSelection(type) {
    if (type === 'specialist') {
        showScreen('specialistLoginScreen');
    } else if (type === 'parent') {
        showScreen('parentLoginScreen');
    }
}

function showParentLogin() {
    showScreen('parentLoginScreen');
}

function showParentReg() {
    showScreen('parentRegScreen');
}

function showSpecialistLogin() {
    showScreen('specialistLoginScreen');
}

function showSpecialistReg() {
    showScreen('specialistRegScreen');
}

function goBack() {
    showScreen('selectionScreen');
}

function handleLogout() {
    if (confirm('هل تريد تسجيل الخروج؟')) {
        currentUser = null;
        clearUserSession();
        showScreen('selectionScreen');
    }
}

function showStartSessionModal() {
    document.getElementById('startSessionModal').classList.add('active');
}

function closeStartSessionModal() {
    document.getElementById('startSessionModal').classList.remove('active');
    document.getElementById('startSessionForm').reset();
    document.getElementById('sessionMsg').textContent = '';
    document.getElementById('itemGroup').style.display = 'none';
    document.getElementById('tertiaryGroup').style.display = 'none';
}

// Dimension and Item data structure
const sessionData = {
    'المجموعات الضمنية': {
        'الملابس': ['قميص', 'شورت', 'فستان'],
        'الخضار': ['طماطم', 'جزر', 'بطاطس'],
        'النقود': ['10', '20', '50', '100', '200', '500']
    },
    'اللغة الاستقبالية': {},
    'اللغة التعبيرية': {}
};

function handleDimensionChange() {
    const dimension = document.getElementById('dimensionSelect').value;
    const itemGroup = document.getElementById('itemGroup');
    const itemSelect = document.getElementById('itemSelect');
    const tertiaryGroup = document.getElementById('tertiaryGroup');
    
    // Reset tertiary and items
    itemSelect.innerHTML = '<option value="">البند</option>';
    tertiaryGroup.style.display = 'none';
    
    if (!dimension) {
        itemGroup.style.display = 'none';
        return;
    }
    
    // Only load from API if it's "المجموعات الضمنية"
    if (dimension === 'المجموعات الضمنية') {
        // Fetch categories from API
        fetch('/api/categories')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success' && data.categories.length > 0) {
                    // Populate item dropdown with categories
                    itemSelect.innerHTML = '<option value="">اختر الفئة</option>';
                    data.categories.forEach(category => {
                        const option = document.createElement('option');
                        option.value = category;
                        const arabicName = getArabicName(category);
                        option.textContent = arabicName;
                        console.log('Adding option:', { value: category, textContent: arabicName });
                        itemSelect.appendChild(option);
                    });
                    itemGroup.style.display = 'block';
                } else {
                    itemGroup.style.display = 'none';
                }
            })
            .catch(err => console.error('Error fetching categories:', err));
    } else {
        // For other dimensions, use static data
        const items = Object.keys(sessionData[dimension] || {});
        
        if (items.length === 0) {
            itemGroup.style.display = 'none';
            return;
        }
        
        // Populate item dropdown
        itemSelect.innerHTML = '<option value="">البند</option>';
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            itemSelect.appendChild(option);
        });
        
        itemGroup.style.display = 'block';
    }
}

function handleItemChange() {
    const dimension = document.getElementById('dimensionSelect').value;
    const item = document.getElementById('itemSelect').value;
    const tertiarySelect = document.getElementById('tertiarySelect');
    const tertiaryGroup = document.getElementById('tertiaryGroup');
    
    console.log('handleItemChange called:', { dimension, item });
    
    if (!item) {
        console.log('No item selected');
        tertiaryGroup.style.display = 'none';
        return;
    }
    
    // If it's المجموعات الضمنية, fetch subcategories from the selected category
    if (dimension === 'المجموعات الضمنية') {
        const apiUrl = `/api/items/${item}`;
        console.log('Fetching subcategories from:', apiUrl);
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                console.log('API response:', data);
                if (data.status === 'success' && data.items && data.items.length > 0) {
                    // Populate tertiary dropdown with subcategories
                    tertiarySelect.innerHTML = '<option value="">اختر العنصر</option>';
                    data.items.forEach(itemObj => {
                        const option = document.createElement('option');
                        option.value = itemObj.name;
                        const arabicName = getArabicName(itemObj.name);
                        option.textContent = arabicName;
                        console.log('Adding tertiary option:', { value: itemObj.name, textContent: arabicName });
                        tertiarySelect.appendChild(option);
                    });
                    console.log('Showing tertiary group with', data.items.length, 'items');
                    tertiaryGroup.style.display = 'block';
                } else {
                    console.log('No items returned or error');
                    tertiaryGroup.style.display = 'none';
                }
            })
            .catch(err => console.error('Error fetching items:', err));
    } else {
        // For other dimensions, use static data
        if (!sessionData[dimension] || !sessionData[dimension][item]) {
            tertiaryGroup.style.display = 'none';
            return;
        }
        
        const options = sessionData[dimension][item];
        
        // Populate tertiary dropdown
        tertiarySelect.innerHTML = '<option value="">التفاصيل</option>';
        options.forEach(option => {
            const optionEl = document.createElement('option');
            optionEl.value = option;
            optionEl.textContent = option;
            tertiarySelect.appendChild(optionEl);
        });
        
        tertiaryGroup.style.display = 'block';
    }
}

function handleStartSession(event) {
    event.preventDefault();
    const dimension = document.getElementById('dimensionSelect').value;
    const item = document.getElementById('itemSelect').value;
    const tertiary = document.getElementById('tertiarySelect').value;
    const msgEl = document.getElementById('sessionMsg');
    msgEl.textContent = '';

    if (!currentUser || currentUser.type !== 'parent') {
        msgEl.textContent = 'خطأ: لم يتم العثور على بيانات المستخدم';
        msgEl.className = 'message error';
        return;
    }

    if (!dimension) {
        msgEl.textContent = 'يرجى اختيار البعد';
        msgEl.className = 'message error';
        return;
    }

    // For المجموعات الضمنية, both category and item must be selected
    if (dimension === 'المجموعات الضمنية') {
        if (!item) {
            msgEl.textContent = 'يرجى اختيار الفئة (الملابس، الخضروات، الحيوانات)';
            msgEl.className = 'message error';
            return;
        }
        if (!tertiary) {
            msgEl.textContent = 'يرجى اختيار العنصر من الفئة المختارة';
            msgEl.className = 'message error';
            return;
        }
    }

    // Store session data locally (don't save to database yet)
    const sessionData = {
        dimension: dimension,
        item: item,
        tertiary: tertiary,
        parent_id: currentUser.id,
        category: dimension === 'المجموعات الضمنية' ? item : null,
        selectedWord: dimension === 'المجموعات الضمنية' ? tertiary : tertiary
    };
    
    closeStartSessionModal();
    displaySessionScreen(sessionData);
}

function displaySessionScreen(sessionData) {
    // Store session data for use in training
    currentSessionData = sessionData;
    
    // Also save to localStorage so training page can access it
    localStorage.setItem('currentSessionData', JSON.stringify(sessionData));
    
    // Display dimension/topic in Arabic
    document.getElementById('sessionTopicText').textContent = sessionData.dimension;
    
    // Display item if exists - in Arabic
    const itemDiv = document.getElementById('itemDetailDiv');
    if (sessionData.item) {
        document.getElementById('itemDetailValue').textContent = getArabicName(sessionData.item);
        itemDiv.style.display = 'block';
    } else {
        itemDiv.style.display = 'none';
    }
    
    // Display tertiary if exists - in Arabic
    const tertiaryDiv = document.getElementById('tertiaryDetailDiv');
    if (sessionData.tertiary) {
        document.getElementById('tertiaryDetailValue').textContent = getArabicName(sessionData.tertiary);
        tertiaryDiv.style.display = 'block';
    } else {
        tertiaryDiv.style.display = 'none';
    }
    
    showScreen('sessionScreen');
}

function startTraining() {
    // Use the stored session data from displaySessionScreen
    if (!currentSessionData) {
        alert('يرجى اختيار موضوع التدريب أولاً');
        return;
    }
    
    // Session data is already stored in localStorage, just redirect to training page
    if (currentSessionData.tertiary || currentSessionData.item || currentSessionData.dimension) {
        // Redirect to training page without URL parameters (data comes from localStorage)
        window.location.href = `/bridge/training`;
    } else {
        alert('يرجى اختيار موضوع التدريب أولاً');
    }
}

function endSession() {
    showScreen('parentDashboardScreen');
    loadParentChildren();
    loadParentSessions();
}

function loadParentSessions() {
    if (!currentUser || currentUser.type !== 'parent') return;

    fetch(`/api/training/parent/${currentUser.id}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                displayParentSessions(data.sessions);
            }
        })
        .catch(error => console.error('Error loading sessions:', error));
}

function loadParentChildren() {
    if (!currentUser || currentUser.type !== 'parent') return;

    fetch(`/api/parent/${currentUser.id}/children`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                displayParentChildren(data.children);
            }
        })
        .catch(error => console.error('Error loading children:', error));
}

function displayParentChildren(children) {
    const childrenList = document.getElementById('parentChildrenList');
    
    if (!childrenList) return;
    
    if (children.length === 0) {
        childrenList.innerHTML = '<p style="color: #999; text-align: center;">لم تضف أطفالك بعد</p>';
        return;
    }

    childrenList.innerHTML = children.map(child => `
        <div class="child-card">
            ${child.photo_url ? `<img src="${child.photo_url}" class="child-avatar" alt="${child.name}">` : '<div class="child-avatar-placeholder"></div>'}
            <div class="child-info">
                <h4>${child.name}</h4>
                <p>المختص: <strong>${child.specialist_name}</strong></p>
                ${child.gender ? `<p>الجنس: <strong>${child.gender}</strong></p>` : ''}
                ${child.iq_level ? `<p>درجة الذكاء: <strong>${child.iq_level}</strong></p>` : ''}
            </div>
        </div>
    `).join('');
}

function showAddChildModal() {
    document.getElementById('addChildModal').classList.add('active');
    loadSpecialists();
    // Reset file input and preview
    document.getElementById('childPhotoInput').value = '';
    document.getElementById('avatarPreview').style.display = 'none';
    document.getElementById('avatarIcon').style.display = 'block';
}

function closeAddChildModal() {
    document.getElementById('addChildModal').classList.remove('active');
    document.getElementById('addChildForm').reset();
    document.getElementById('addChildMsg').textContent = '';
    document.getElementById('childPhotoInput').value = '';
    document.getElementById('avatarPreview').style.display = 'none';
    document.getElementById('avatarIcon').style.display = 'block';
}

// Handle photo file selection
document.addEventListener('DOMContentLoaded', function() {
    // Initialize app - restore session if available
    initializeApp();
    
    const photoInput = document.getElementById('childPhotoInput');
    if (photoInput) {
        photoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const preview = document.getElementById('avatarPreview');
                    const icon = document.getElementById('avatarIcon');
                    preview.src = event.target.result;
                    preview.style.display = 'block';
                    icon.style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        });
    }
});

function loadSpecialists() {
    fetch('/api/specialists')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const select = document.getElementById('specialistSelect');
                select.innerHTML = '<option value="">-- اختر المختص --</option>';
                data.specialists.forEach(specialist => {
                    const option = document.createElement('option');
                    option.value = specialist.id;
                    option.textContent = `${specialist.full_name} (${specialist.clinic_name})`;
                    select.appendChild(option);
                });
            }
        })
        .catch(error => console.error('Error loading specialists:', error));
}

function handleAddChild(event) {
    event.preventDefault();
    const childName = document.getElementById('childName').value;
    const gender = document.getElementById('genderSelect').value;
    const iqLevel = document.getElementById('iqLevelSelect').value;
    const dateOfBirth = document.getElementById('dateOfBirthInput').value;
    const startDate = document.getElementById('startDateInput').value;
    const specialistId = document.getElementById('specialistSelect').value;
    const photoInput = document.getElementById('childPhotoInput');
    const msgEl = document.getElementById('addChildMsg');
    msgEl.textContent = '';

    if (!currentUser || currentUser.type !== 'parent') {
        msgEl.textContent = 'خطأ: لم يتم العثور على بيانات المستخدم';
        msgEl.className = 'message error';
        return;
    }

    if (!specialistId) {
        msgEl.textContent = 'يرجى اختيار مختص';
        msgEl.className = 'message error';
        return;
    }

    // Handle file upload if a photo is selected
    if (photoInput.files.length > 0) {
        const file = photoInput.files[0];
        const reader = new FileReader();
        reader.onload = function(event) {
            sendChildData(childName, gender, iqLevel, dateOfBirth, startDate, specialistId, event.target.result);
        };
        reader.readAsDataURL(file);
    } else {
        sendChildData(childName, gender, iqLevel, dateOfBirth, startDate, specialistId, null);
    }
}

function sendChildData(childName, gender, iqLevel, dateOfBirth, startDate, specialistId, photoBase64) {
    const msgEl = document.getElementById('addChildMsg');
    const childData = {
        parent_id: currentUser.id,
        name: childName,
        gender: gender,
        iq_level: iqLevel,
        date_of_birth: dateOfBirth,
        start_date: startDate,
        specialist_id: parseInt(specialistId)
    };

    if (photoBase64) {
        childData.photo_base64 = photoBase64;
    }

    fetch('/api/child/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(childData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            msgEl.textContent = 'تم إضافة الطفل بنجاح!';
            msgEl.className = 'message success';
            setTimeout(() => {
                closeAddChildModal();
                loadParentChildren();
            }, 1000);
        } else {
            msgEl.textContent = data.message || 'خطأ في إضافة الطفل';
            msgEl.className = 'message error';
        }
    })
    .catch(error => {
        msgEl.textContent = 'حدث خطأ في الاتصال بالخادم';
        msgEl.className = 'message error';
    });
}

function displayParentSessions(sessions) {
    const sessionsList = document.getElementById('parentSessionsList');
    
    if (!sessionsList) return;
    
    if (sessions.length === 0) {
        sessionsList.innerHTML = '<p style="color: #999; text-align: center;">لا توجد جلسات حتى الآن</p>';
        return;
    }

    sessionsList.innerHTML = sessions.map(session => `
        <div class="session-card">
            <div class="session-info">
                <h4>${session.title}</h4>
                <p>${session.description || '-'}</p>
                <div class="session-meta">
                    <span class="session-status ${session.status}">${session.status === 'active' ? 'جارية' : session.status === 'paused' ? 'موقوفة' : 'مكتملة'}</span>
                    ${session.duration ? `<span class="session-duration">${session.duration} دقيقة</span>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function handleParentLogin(event) {
    event.preventDefault();
    const username = event.target.querySelector('input[type="text"]').value;
    const password = event.target.querySelector('input[type="password"]').value;
    const msgEl = document.getElementById('parentLoginMsg');
    msgEl.textContent = '';

    fetch('/api/parent/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            msgEl.textContent = 'تم الدخول بنجاح!';
            msgEl.className = 'message success';
            currentUser = { type: 'parent', ...data.parent };
            saveUserSession(currentUser);
            // Display parent info on dashboard
            document.getElementById('parentName').textContent = data.parent.username;
            document.getElementById('parentPhone').textContent = data.parent.phone || '-';
            // Navigate to dashboard after 1 second
            setTimeout(() => {
                showScreen('parentDashboardScreen');
                loadParentChildren();
                loadParentSessions();
            }, 1000);
        } else {
            msgEl.textContent = data.message || 'خطأ في الدخول';
            msgEl.className = 'message error';
        }
    })
    .catch(error => {
        msgEl.textContent = 'حدث خطأ في الاتصال بالخادم';
        msgEl.className = 'message error';
    });
}

function handleParentReg(event) {
    event.preventDefault();
    const inputs = event.target.querySelectorAll('input');
    const username = inputs[0].value;
    const password = inputs[1].value;
    const phone = inputs[2].value;
    const msgEl = document.getElementById('parentRegMsg');
    msgEl.textContent = '';

    fetch('/api/parent/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, phone })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            msgEl.textContent = 'تم إنشاء الحساب بنجاح!';
            msgEl.className = 'message success';
            setTimeout(() => showParentLogin(), 1500);
        } else {
            msgEl.textContent = data.message || 'خطأ في التسجيل';
            msgEl.className = 'message error';
        }
    })
    .catch(error => {
        msgEl.textContent = 'حدث خطأ في الاتصال بالخادم';
        msgEl.className = 'message error';
    });
}

function handleSpecialistLogin(event) {
    event.preventDefault();
    const email = event.target.querySelector('input[type="email"]').value;
    const password = event.target.querySelector('input[type="password"]').value;
    const msgEl = document.getElementById('specialistLoginMsg');
    msgEl.textContent = '';

    fetch('/api/specialist/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            msgEl.textContent = 'تم الدخول بنجاح!';
            msgEl.className = 'message success';
            currentUser = { type: 'specialist', ...data.specialist };
            saveUserSession(currentUser);
            // Display specialist info on dashboard
            document.getElementById('specialistName').textContent = data.specialist.full_name;
            document.getElementById('clinicName').textContent = data.specialist.clinic_name;
            document.getElementById('specialistEmail').textContent = data.specialist.email;
            document.getElementById('specialistPhone').textContent = data.specialist.phone;
            // Navigate to dashboard after 1 second
            setTimeout(() => showScreen('specialistDashboardScreen'), 1000);
        } else {
            msgEl.textContent = data.message || 'خطأ في الدخول';
            msgEl.className = 'message error';
        }
    })
    .catch(error => {
        msgEl.textContent = 'حدث خطأ في الاتصال بالخادم';
        msgEl.className = 'message error';
    });
}

function handleSpecialistReg(event) {
    event.preventDefault();
    const inputs = event.target.querySelectorAll('input');
    const fullName = inputs[0].value;
    const email = inputs[1].value;
    const password = inputs[2].value;
    const phone = inputs[3].value;
    const clinicName = inputs[4].value;
    const msgEl = document.getElementById('specialistRegMsg');
    msgEl.textContent = '';

    fetch('/api/specialist/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            full_name: fullName,
            email: email,
            password: password,
            phone: phone,
            clinic_name: clinicName
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            msgEl.textContent = 'تم إنشاء الحساب بنجاح!';
            msgEl.className = 'message success';
            setTimeout(() => showSpecialistLogin(), 1500);
        } else {
            msgEl.textContent = data.message || 'خطأ في التسجيل';
            msgEl.className = 'message error';
        }
    })
    .catch(error => {
        msgEl.textContent = 'حدث خطأ في الاتصال بالخادم';
        msgEl.className = 'message error';
    });
}

// Show selection screen after 3 seconds
setTimeout(() => {
    showScreen('selectionScreen');
}, 3000);
