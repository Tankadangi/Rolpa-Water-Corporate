// Navbar scroll effect
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Current Year for Footer
const yearEl = document.getElementById('year');
if(yearEl) yearEl.textContent = new Date().getFullYear();

// Scroll Animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.scroll-animate').forEach(el => {
    observer.observe(el);
});

// Form Submission handling
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        // e.preventDefault(); // Removed to allow Formspree to actually process it
    });
}

// ==========================================
// Dynamic i18n & CMS Logic
// ==========================================

let currentLang = localStorage.getItem('rolpaLang') || 'en';
let siteData = null;
let siteSettings = null;

async function loadCMSData() {
    try {
        const [langRes, setRes] = await Promise.all([
            fetch('data.json'),
            fetch('settings.json')
        ]);
        
        if (!langRes.ok || !setRes.ok) {
            throw new Error("HTTP error during fetch");
        }
        siteData = await langRes.json();
        siteSettings = await setRes.json();
        
        // Apply Global Settings
        document.querySelectorAll('.logo').forEach(el => {
            el.textContent = siteSettings.brand.company_name;
        });

        // Initialize Dynamic Team
        const teamContainer = document.getElementById('team-container');
        if (teamContainer && siteSettings.team) {
            teamContainer.innerHTML = '';
            siteSettings.team.forEach((member, index) => {
                const memberCard = document.createElement('div');
                memberCard.className = `team-member scroll-animate delay-${index % 3}`;
                memberCard.innerHTML = `
                    <div class="team-quote-box">
                        <div class="quote-icon">"</div>
                        <p class="team-quote">${member.quote}</p>
                        <div class="team-info">
                            <h4>${member.name}</h4>
                            <span class="team-role">${member.role}</span>
                        </div>
                    </div>
                    <div class="team-photo-wrapper">
                        <img src="${member.photo}" alt="${member.name}" class="team-photo">
                    </div>
                `;
                teamContainer.appendChild(memberCard);
            });
        }
        
        // Init translations
        setLanguage(currentLang);
    } catch (error) {
        console.error("Failed to load CMS data. Local file:// protocols may block fetch. Please run a local server or deploy.", error);
    }
}

function setLanguage(lang) {
    if (!siteData) return;
    
    currentLang = lang;
    localStorage.setItem('rolpaLang', lang);
    
    const translations = siteData.translations[lang];
    
    // Update text elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations && translations[key]) {
            el.innerHTML = translations[key]; 
        }
    });

    // Update buttons UI
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.style.fontWeight = btn.getAttribute('data-lang') === lang ? 'bold' : 'normal';
        btn.style.opacity = btn.getAttribute('data-lang') === lang ? '1' : '0.6';
    });
}

// Bind events when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = e.target.getAttribute('data-lang');
            setLanguage(lang);
        });
    });
    
    // Fetch data and init
    loadCMSData();
});
