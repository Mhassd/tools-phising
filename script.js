// Initialize global variables
let hobbies = [];
let currentHobbyId = null;
let currentSkillLevel = "Pemula";

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadHobbies();
    setupEventListeners();
    updateCurrentDate();
    updateVisitorCount();
    setDefaultData();
    
    // Check for saved theme
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        document.querySelector('.theme-toggle i').className = 'fas fa-sun';
    }
});

// Setup event listeners
function setupEventListeners() {
    // Skill level buttons
    document.querySelectorAll('.skill-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.skill-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentSkillLevel = this.dataset.level;
        });
    });
    
    // Set first skill button as active
    document.querySelector('.skill-btn').classList.add('active');
    
    // Enter key in form
    document.getElementById('hobbyName').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addHobby();
    });
}

// Add new hobby
function addHobby() {
    const name = document.getElementById('hobbyName').value.trim();
    const desc = document.getElementById('hobbyDesc').value.trim();
    const category = document.getElementById('hobbyCategory').value;
    const image = document.getElementById('hobbyImage').value.trim();
    
    // Validation
    if (!name || !desc || !category) {
        alert('Harap isi semua field yang wajib!');
        return;
    }
    
    if (desc.length < 20) {
        alert('Deskripsi minimal 20 karakter!');
        return;
    }
    
    // Create new hobby object
    const newHobby = {
        id: Date.now(),
        name: name,
        description: desc,
        category: category,
        image: image || getDefaultImage(category),
        skillLevel: currentSkillLevel,
        likes: 0,
        createdAt: new Date().toISOString(),
        createdBy: "User"
    };
    
    // Add to array
    hobbies.push(newHobby);
    
    // Save to localStorage
    saveHobbies();
    
    // Clear form
    document.getElementById('hobbyName').value = '';
    document.getElementById('hobbyDesc').value = '';
    document.getElementById('hobbyCategory').value = '';
    document.getElementById('hobbyImage').value = '';
    
    // Reload display
    loadHobbies();
    
    // Show success message
    showNotification(`Hobi "${name}" berhasil ditambahkan!`, 'success');
}

// Load hobbies from localStorage
function loadHobbies() {
    const saved = localStorage.getItem('hobbies');
    hobbies = saved ? JSON.parse(saved) : [];
    
    // Update stats
    updateStats();
    
    // Display hobbies
    displayHobbies();
}

// Save hobbies to localStorage
function saveHobbies() {
    localStorage.setItem('hobbies', JSON.stringify(hobbies));
}

// Display all hobbies
function displayHobbies() {
    const container = document.getElementById('hobbiesContainer');
    
    if (hobbies.length === 0) {
        container.innerHTML = `
            <div class="no-hobbies">
                <i class="fas fa-inbox"></i>
                <h3>Belum ada hobi</h3>
                <p>Tambahkan hobi pertama kamu menggunakan form di atas!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = hobbies.map(hobby => `
        <div class="hobby-card" data-id="${hobby.id}">
            <div class="hobby-image">
                ${hobby.image.startsWith('http') ? 
                    `<img src="${hobby.image}" alt="${hobby.name}">` : 
                    `<i class="${hobby.image}"></i>`
                }
            </div>
            <div class="hobby-content">
                <div class="hobby-title">
                    <h3>${hobby.name}</h3>
                    <span class="hobby-category">${hobby.category}</span>
                </div>
                <p class="hobby-desc">${hobby.description}</p>
                <div class="hobby-meta">
                    <span class="skill-level-badge skill-${hobby.skillLevel.toLowerCase()}">
                        ${hobby.skillLevel}
                    </span>
                    <span class="hobby-date">${formatDate(hobby.createdAt)}</span>
                </div>
                <div class="hobby-actions">
                    <div class="like-section">
                        <button class="like-btn ${hobby.liked ? 'liked' : ''}" 
                                onclick="likeHobby(${hobby.id})">
                            <i class="fas fa-heart"></i>
                        </button>
                        <span class="like-count">${hobby.likes} Likes</span>
                    </div>
                    <div class="edit-btns">
                        <button class="edit-btn" onclick="editHobby(${hobby.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="delete-btn" onclick="deleteHobby(${hobby.id})">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Update statistics
function updateStats() {
    document.getElementById('totalHobbies').textContent = hobbies.length;
    
    const totalLikes = hobbies.reduce((sum, hobby) => sum + hobby.likes, 0);
    document.getElementById('totalLikes').textContent = totalLikes;
}

// Like a hobby
function likeHobby(id) {
    const hobby = hobbies.find(h => h.id === id);
    if (hobby) {
        hobby.likes++;
        saveHobbies();
        loadHobbies();
        
        // Animation
        const likeBtn = document.querySelector(`.hobby-card[data-id="${id}"] .like-btn`);
        likeBtn.classList.add('liked');
        setTimeout(() => {
            likeBtn.classList.remove('liked');
        }, 300);
    }
}

// Edit hobby
function editHobby(id) {
    const hobby = hobbies.find(h => h.id === id);
    if (!hobby) return;
    
    currentHobbyId = id;
    
    // Fill modal with data
    document.getElementById('editName').value = hobby.name;
    document.getElementById('editDesc').value = hobby.description;
    document.getElementById('editCategory').value = hobby.category;
    
    // Show modal
    document.getElementById('editModal').style.display = 'flex';
}

// Save edit
function saveEdit() {
    if (!currentHobbyId) return;
    
    const hobby = hobbies.find(h => h.id === currentHobbyId);
    if (hobby) {
        hobby.name = document.getElementById('editName').value;
        hobby.description = document.getElementById('editDesc').value;
        hobby.category = document.getElementById('editCategory').value;
        
        saveHobbies();
        loadHobbies();
        closeModal();
        
        showNotification('Hobi berhasil diperbarui!', 'success');
    }
}

// Close modal
function closeModal() {
    document.getElementById('editModal').style.display = 'none';
    currentHobbyId = null;
}

// Delete hobby
function deleteHobby(id) {
    if (confirm('Apakah kamu yakin ingin menghapus hobi ini?')) {
        hobbies = hobbies.filter(h => h.id !== id);
        saveHobbies();
        loadHobbies();
        
        showNotification('Hobi berhasil dihapus!', 'warning');
    }
}

// Search hobbies
function searchHobbies() {
    const searchTerm = document.getElementById('searchHobby').value.toLowerCase();
    const filtered = hobbies.filter(hobby => 
        hobby.name.toLowerCase().includes(searchTerm) || 
        hobby.description.toLowerCase().includes(searchTerm) ||
        hobby.category.toLowerCase().includes(searchTerm)
    );
    
    displayFilteredHobbies(filtered);
}

// Filter by category
function filterByCategory() {
    const category = document.getElementById('filterCategory').value;
    
    if (category === 'all') {
        displayHobbies();
        return;
    }
    
    const filtered = hobbies.filter(hobby => hobby.category === category);
    displayFilteredHobbies(filtered);
}

// Sort hobbies
function sortHobbies() {
    const sortBy = document.getElementById('sortBy').value;
    
    let sorted = [...hobbies];
    
    switch(sortBy) {
        case 'newest':
            sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'oldest':
            sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
        case 'mostLikes':
            sorted.sort((a, b) => b.likes - a.likes);
            break;
    }
    
    displayFilteredHobbies(sorted);
}

// Display filtered hobbies
function displayFilteredHobbies(filteredHobbies) {
    const container = document.getElementById('hobbiesContainer');
    
    if (filteredHobbies.length === 0) {
        container.innerHTML = `
            <div class="no-hobbies">
                <i class="fas fa-search"></i>
                <h3>Tidak ditemukan</h3>
                <p>Tidak ada hobi yang sesuai dengan filter pencarian</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredHobbies.map(hobby => `
        <div class="hobby-card" data-id="${hobby.id}">
            <div class="hobby-image">
                ${hobby.image.startsWith('http') ? 
                    `<img src="${hobby.image}" alt="${hobby.name}">` : 
                    `<i class="${hobby.image}"></i>`
                }
            </div>
            <div class="hobby-content">
                <div class="hobby-title">
                    <h3>${hobby.name}</h3>
                    <span class="hobby-category">${hobby.category}</span>
                </div>
                <p class="hobby-desc">${hobby.description}</p>
                <div class="hobby-meta">
                    <span class="skill-level-badge skill-${hobby.skillLevel.toLowerCase()}">
                        ${hobby.skillLevel}
                    </span>
                    <span class="hobby-date">${formatDate(hobby.createdAt)}</span>
                </div>
                <div class="hobby-actions">
                    <div class="like-section">
                        <button class="like-btn" onclick="likeHobby(${hobby.id})">
                            <i class="fas fa-heart"></i>
                        </button>
                        <span class="like-count">${hobby.likes} Likes</span>
                    </div>
                    <div class="edit-btns">
                        <button class="edit-btn" onclick="editHobby(${hobby.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="delete-btn" onclick="deleteHobby(${hobby.id})">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Toggle dark/light mode
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const icon = document.querySelector('.theme-toggle i');
    
    if (document.body.classList.contains('dark-mode')) {
        icon.className = 'fas fa-sun';
        localStorage.setItem('darkMode', 'true');
    } else {
        icon.className = 'fas fa-moon';
        localStorage.setItem('darkMode', 'false');
    }
}

// Update current date in footer
function updateCurrentDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    document.getElementById('currentDate').textContent = 
        now.toLocaleDateString('id-ID', options);
}

// Update visitor count
function updateVisitorCount() {
    let count = localStorage.getItem('visitorCount') || 0;
    count = parseInt(count) + 1;
    localStorage.setItem('visitorCount', count);
    document.getElementById('visitorCount').textContent = count;
}

// Show notification
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add some default data if empty
function setDefaultData() {
    if (hobbies.length === 0) {
        hobbies = [
            {
                id: 1,
                name: "Valorant",
                description: "Game FPS tactical 5v5 dengan karakter unik dan kemampuan khusus. Memerlukan teamwork dan strategi.",
                category: "Gaming",
                image: "fas fa-crosshairs",
                skillLevel: "Expert",
                likes: 15,
                createdAt: "2024-01-10T10:30:00Z"
            },
            {
                id: 2,
                name: "Fotografi",
                description: "Seni mengambil gambar dengan kamera. Mempelajari komposisi, pencahayaan, dan editing foto.",
                category: "Seni",
                image: "fas fa-camera",
                skillLevel: "Menengah",
                likes: 8,
                createdAt: "2024-01-12T14:20:00Z"
            },
            {
                id: 3,
                name: "Basket",
                description: "Olahraga tim dengan 5 pemain per tim. Membutuhkan kecepatan, ketangkasan, dan kerja sama.",
                category: "Olahraga",
                image: "fas fa-basketball-ball",
                skillLevel: "Pemula",
                likes: 5,
                createdAt: "2024-01-15T09:15:00Z"
            }
        ];
        saveHobbies();
        loadHobbies();
    }
}

// Get default image based on category
function getDefaultImage(category) {
    const icons = {
        "Gaming": "fas fa-gamepad",
        "Olahraga": "fas fa-running",
        "Seni": "fas fa-palette",
        "Musik": "fas fa-music",
        "Teknologi": "fas fa-laptop-code",
        "Lainnya": "fas fa-star"
    };
    return icons[category] || "fas fa-heart";
}

// Format date to Indonesian format
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// Add CSS for notifications
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 15px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        border-left: 5px solid #4CAF50;
    }
    
    .dark-mode .notification {
        background: #16213e;
        color: white;
    }
    
    .notification.warning {
        border-left-color: #ff9800;
    }
    
    .notification i {
        font-size: 1.5rem;
    }
    
    .notification.success i {
        color: #4CAF50;
    }
    
    .notification.warning i {
        color: #ff9800;
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .fade-out {
        animation: fadeOut 0.3s ease forwards;
    }
    
    @keyframes fadeOut {
        to { opacity: 0; transform: translateX(100%); }
    }
    
    .no-hobbies {
        grid-column: 1 / -1;
        text-align: center;
        padding: 60px 20px;
        color: #666;
    }
    
    .no-hobbies i {
        font-size: 4rem;
        color: #ddd;
        margin-bottom: 20px;
    }
    
    .no-hobbies h3 {
        margin-bottom: 10px;
        color: #444;
    }
    
    .dark-mode .no-hobbies {
        color: #aaa;
    }
    
    .dark-mode .no-hobbies h3 {
        color: #ccc;
    }
`;

// Add notification styles to page
const styleSheet = document.createElement("style");
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);
