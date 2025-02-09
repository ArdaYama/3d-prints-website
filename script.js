// Mobile Menu Toggle
const mobileMenu = document.querySelector('.mobile-menu');
const navLinks = document.querySelector('.nav-links');

mobileMenu.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Initialize website content
document.addEventListener('DOMContentLoaded', () => {
    initializeProducts();
    initializeAbout();
    initializeContact();
});

// Products Section
function initializeProducts() {
    // Initialize category filter
    const categorySelect = document.getElementById('categorySelect');
    websiteConfig.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });

    // Load all products initially
    displayProducts('Tümü');
}

function displayProducts(category) {
    const productGrid = document.querySelector('.product-grid');
    productGrid.innerHTML = '';

    const filteredProducts = category === 'Tümü' 
        ? websiteConfig.products 
        : websiteConfig.products.filter(product => product.category === category);

    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" onclick="showProductDetails(${product.id})">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <span class="price">${product.price.toFixed(2)} ₺</span>
            <button class="buy-button" onclick="showProductDetails(${product.id})">Detayları Gör</button>
        `;
        productGrid.appendChild(productCard);
    });
}

function filterProducts() {
    const category = document.getElementById('categorySelect').value;
    displayProducts(category);
}

function showProductDetails(productId) {
    const product = websiteConfig.products.find(p => p.id === productId);
    const modalContent = document.getElementById('productModalContent');
    
    modalContent.innerHTML = `
        <div class="product-detail">
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
                <h2>${product.name}</h2>
                <p class="price">${product.price.toFixed(2)} ₺</p>
                <p class="description">${product.description}</p>
                <div class="features">
                    <h3>Özellikler:</h3>
                    <ul>
                        ${product.features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                </div>
                <button class="buy-button">Sepete Ekle</button>
            </div>
        </div>
    `;

    document.getElementById('productModal').style.display = 'flex';
}

function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
}

// About Section
function initializeAbout() {
    const aboutText = document.querySelector('.about-text');
    aboutText.innerHTML = websiteConfig.about.description
        .map(paragraph => `<p>${paragraph}</p>`)
        .join('');

    const featuresGrid = document.querySelector('.features-grid');
    featuresGrid.innerHTML = websiteConfig.about.features
        .map(feature => `
            <div class="feature-card">
                <i class="fas fa-check-circle"></i>
                <p>${feature}</p>
            </div>
        `)
        .join('');
}

// Contact Section
function initializeContact() {
    const contactInfo = document.querySelector('.contact-info');
    contactInfo.innerHTML = `
        <div class="info-item">
            <i class="fas fa-envelope"></i>
            <p>${websiteConfig.contactInfo.email}</p>
        </div>
        <div class="info-item">
            <i class="fas fa-phone"></i>
            <p>${websiteConfig.contactInfo.phone}</p>
        </div>
        <div class="info-item">
            <i class="fas fa-map-marker-alt"></i>
            <p>${websiteConfig.contactInfo.address}</p>
        </div>
    `;
}

// Contact Form Handler
const contactForm = document.querySelector('.contact-form');
contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = this.querySelector('input[type="text"]').value;
    const email = this.querySelector('input[type="email"]').value;
    const message = this.querySelector('textarea').value;
    
    console.log('Form gönderildi:', { name, email, message });
    
    alert('Mesajınız için teşekkürler! En kısa sürede size dönüş yapacağız.');
    this.reset();
});

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Product Cards Animation
const productCards = document.querySelectorAll('.product-card');
productCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// Buy Button Click Handler
const buyButtons = document.querySelectorAll('.buy-button');
buyButtons.forEach(button => {
    button.addEventListener('click', function() {
        const productName = this.parentElement.querySelector('h3').textContent;
        const price = this.parentElement.querySelector('.price').textContent;
        
        alert(`${productName} ürünü için ilginize teşekkürler!\nFiyat: ${price}\nSepete ekleme özelliği yakında aktif olacak.`);
    });
});

// API URL
const API_URL = 'https://engineeringo-backend.onrender.com/api';

// Auth state
let currentUser = null;
let authToken = localStorage.getItem('authToken');

// Check if user is logged in
async function checkAuth() {
    if (authToken) {
        try {
            const response = await fetch(`${API_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                currentUser = data.data.user;
                updateAuthUI();
            } else {
                localStorage.removeItem('authToken');
                authToken = null;
                updateAuthUI();
            }
        } catch (error) {
            console.error('Kimlik doğrulama hatası:', error);
            localStorage.removeItem('authToken');
            authToken = null;
            updateAuthUI();
        }
    }
}

// Update UI based on auth state
function updateAuthUI() {
    const authButtons = document.querySelector('.auth-buttons');
    if (currentUser) {
        authButtons.innerHTML = `
            <span class="user-name">Merhaba, ${currentUser.fullName}</span>
            <button class="logout-btn" onclick="logout()">Çıkış Yap</button>
        `;
    } else {
        authButtons.innerHTML = `
            <button class="login-btn" onclick="openLoginModal()">Giriş Yap</button>
            <button class="signup-btn" onclick="openSignupModal()">Kayıt Ol</button>
        `;
    }
}

// Handle Login Form Submission
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = this.querySelector('input[type="email"]').value;
    const password = this.querySelector('input[type="password"]').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            currentUser = data.data.user;
            updateAuthUI();
            closeLoginModal();
            alert('Giriş başarılı!');
        } else {
            alert(data.message || 'Giriş başarısız. E-posta veya şifre hatalı.');
        }
    } catch (error) {
        console.error('Giriş hatası:', error);
        alert('Giriş işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    }

    this.reset();
});

// Handle Signup Form Submission
document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        fullName: this.querySelector('input[type="text"]').value,
        email: this.querySelector('input[type="email"]').value,
        password: this.querySelectorAll('input[type="password"]')[0].value,
        confirmPassword: this.querySelectorAll('input[type="password"]')[1].value
    };

    if (formData.password !== formData.confirmPassword) {
        alert('Şifreler eşleşmiyor!');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            currentUser = data.data.user;
            updateAuthUI();
            closeSignupModal();
            alert('Kayıt başarılı! Hoş geldiniz.');
        } else {
            alert(data.message || 'Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.');
        }
    } catch (error) {
        console.error('Kayıt hatası:', error);
        alert('Kayıt işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    }

    this.reset();
});

// Logout function
function logout() {
    localStorage.removeItem('authToken');
    authToken = null;
    currentUser = null;
    updateAuthUI();
    alert('Başarıyla çıkış yaptınız!');
}

// Check auth status when page loads
document.addEventListener('DOMContentLoaded', checkAuth);

// Auth Modal Functions
function openLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

function openSignupModal() {
    document.getElementById('signupModal').style.display = 'flex';
}

function closeSignupModal() {
    document.getElementById('signupModal').style.display = 'none';
}

function switchToSignup() {
    closeLoginModal();
    openSignupModal();
}

function switchToLogin() {
    closeSignupModal();
    openLoginModal();
}

// Close modals when clicking outside
window.onclick = function(event) {
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const productModal = document.getElementById('productModal');
    if (event.target === loginModal) {
        closeLoginModal();
    }
    if (event.target === signupModal) {
        closeSignupModal();
    }
    if (event.target === productModal) {
        closeProductModal();
    }
} 