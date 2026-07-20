document.addEventListener('DOMContentLoaded', () => {

    // SPLASH PRELOADER: only runs on pages that include the #preloader element
    const preloader = document.getElementById('preloader');
    const brandLogo = document.getElementById('brandLogo');

    if (preloader) {
        document.body.classList.add('is-loading');

        const revealPage = () => {
            preloader.classList.add('hidden');
            if (brandLogo) brandLogo.classList.add('revealed');
            document.body.classList.remove('is-loading');
        };

        if (document.readyState === 'complete') {
            setTimeout(revealPage, 1200);
        } else {
            window.addEventListener('load', () => setTimeout(revealPage, 1200));
        }
    } else if (brandLogo) {
        requestAnimationFrame(() => brandLogo.classList.add('revealed'));
    }

    // BRAND LOGO: toggle 'scrolled' class when page scrolls down past 40px
    const dockThreshold = 40;

    const updateLogoDock = () => {
        document.body.classList.toggle('scrolled', window.scrollY > dockThreshold);
    };

    updateLogoDock();
    window.addEventListener('scroll', updateLogoDock);

    // SOCIAL LINKS DROPDOWN (@ NAV BUTTON)
    const socialToggle = document.querySelector('.social-toggle-btn');
    const socialDropdown = document.querySelector('.social-dropdown');

    if (socialToggle && socialDropdown) {
        const icon = socialToggle.querySelector('i');

        const closeSocialMenu = () => {
            socialDropdown.classList.remove('open');
            socialToggle.setAttribute('aria-expanded', 'false');
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-at');
        };

        socialToggle.addEventListener('click', (event) => {
            event.stopPropagation();
            const isOpen = socialDropdown.classList.toggle('open');
            socialToggle.setAttribute('aria-expanded', String(isOpen));
            icon.classList.toggle('fa-at', !isOpen);
            icon.classList.toggle('fa-xmark', isOpen);
        });

        document.addEventListener('click', (event) => {
            if (!socialDropdown.contains(event.target) && !socialToggle.contains(event.target)) {
                closeSocialMenu();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') closeSocialMenu();
        });
    }

    // SKILL BARS: ANIMATE FROM 0% TO TARGET % WHEN SCROLLED INTO VIEW
    const skillBarsContainer = document.querySelector('.skill-bars');
    let animateSkillBars = () => {};

    if (skillBarsContainer) {
        const skillItems = skillBarsContainer.querySelectorAll('.skill-bar-item');
        let hasAnimated = false;

        animateSkillBars = () => {
            if (hasAnimated) return;
            hasAnimated = true;

            skillItems.forEach((item, index) => {
                const fillEl = item.querySelector('.skill-bar-fill');
                const percentEl = item.querySelector('.skill-bar-percent');
                const targetPercent = parseInt(fillEl.getAttribute('data-percent'), 10) || 0;

                setTimeout(() => {
                    fillEl.style.width = `${targetPercent}%`;

                    const duration = 1400;
                    const startTime = performance.now();

                    const tick = (now) => {
                        const elapsed = now - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        const currentValue = Math.round(eased * targetPercent);

                        percentEl.textContent = `${currentValue}%`;

                        if (progress < 1) requestAnimationFrame(tick);
                    };

                    requestAnimationFrame(tick);
                }, index * 120);
            });
        };

        const skillBarsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateSkillBars();
                    skillBarsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        skillBarsObserver.observe(skillBarsContainer);
    }

    // TAB MECHANICS FOR THE ABOUT ME PANEL
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTabId = button.getAttribute('data-tab');

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));

            button.classList.add('active');
            document.getElementById(targetTabId).classList.add('active');

            if (targetTabId === 'skills') {
                animateSkillBars();
            }
        });
    });

    // ACTIVE NAVIGATION LINKS HIGHLIGHT ON SCROLL DETECT
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-item');

    window.addEventListener('scroll', () => {
        let currentSectionId = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= (sectionTop - 200)) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${currentSectionId}`) {
                item.classList.add('active');
            }
        });
    });

    // PROJECT GALLERY SUBNAV SCROLL HIGHLIGHT
    const projectCategories = document.querySelectorAll('.project-category');
    const subnavItems = document.querySelectorAll('.subnav-item');

    if (projectCategories.length && subnavItems.length) {
        window.addEventListener('scroll', () => {
            let currentCategoryId = '';

            projectCategories.forEach(category => {
                const categoryTop = category.offsetTop;
                if (window.scrollY >= (categoryTop - 220)) {
                    currentCategoryId = category.getAttribute('id');
                }
            });

            subnavItems.forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('href') === `#${currentCategoryId}`) {
                    item.classList.add('active');
                }
            });
        });
    }
});


// EDITORIAL, VIDEO, & IMAGE LIGHTBOX POPUP FUNCTIONALITY
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('mediaModal');
    const modalBody = document.getElementById('modalBody');
    const modalClose = document.querySelector('.modal-close');
    const editorialCards = document.querySelectorAll('.editorial-card');
    const videoCards = document.querySelectorAll('.video-modal-card');
    const imageCards = document.querySelectorAll('.image-modal-card');

    if (modal && modalBody) {
        
        // Function to handle opening modal
        const openModalWithContent = (htmlContent) => {
            modalBody.innerHTML = htmlContent;
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
        };

        // 1. Editorial cards trigger (PDF & Images)
        editorialCards.forEach(card => {
            card.addEventListener('click', () => {
                const pdfUrl = card.getAttribute('data-pdf');
                const imgUrl = card.getAttribute('data-full-img');

                if (pdfUrl) {
                    openModalWithContent(`<object data="${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0" type="application/pdf" width="100%" height="100%"><p>PDF Preview Not Available</p></object>`);
                } else if (imgUrl) {
                    openModalWithContent(`<img src="${imgUrl}" alt="Full View">`);
                }
            });
        });

        // 2. Video cards click listener (YouTube Embeds)
        videoCards.forEach(card => {
            card.addEventListener('click', () => {
                const youtubeUrl = card.getAttribute('data-youtube');
                
                if (youtubeUrl) {
                    openModalWithContent(`
                        <iframe 
                            src="${youtubeUrl}?autoplay=1" 
                            width="100%" 
                            height="100%" 
                            title="YouTube video player" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            allowfullscreen>
                        </iframe>
                    `);
                }
            });
        });

        // NEW FIXED: MIIEX Specific Certificate/Award Viewer Action (Matches Editorial System)
        const certButtons = document.querySelectorAll('.cert-modal-btn');
        certButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Stop click bubbling from triggering the YouTube video card
                const pdfUrl = btn.getAttribute('data-pdf');
                if (pdfUrl) {
                    openModalWithContent(`
                        <object data="${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1" type="application/pdf" width="100%" height="100%">
                            <iframe src="${pdfUrl}" width="100%" height="100%" style="border:none;">
                                <p>Your browser does not support viewing PDFs inline. <a href="${pdfUrl}" target="_blank">Click here to download the certificate instead.</a></p>
                            </iframe>
                        </object>
                    `);
                }
            });
        });

        // 3. Designs & 3Ds Image cards click listener
        imageCards.forEach(card => {
            card.addEventListener('click', () => {
                const imgUrl = card.getAttribute('data-full-img');
                if (imgUrl) {
                    openModalWithContent(`<img src="${imgUrl}" alt="Full View Layout Preview">`);
                }
            });
        });

        // Close functions
        const closeModal = () => {
            modal.classList.remove('open');
            modalBody.innerHTML = '';
            document.body.style.overflow = '';
        };

        if (modalClose) modalClose.addEventListener('click', closeModal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
        });
    }
});

// HERO VIDEO RESUME COMPONENT ACTIVATOR
document.addEventListener('DOMContentLoaded', () => {
    const heroVideoBtn = document.getElementById('heroVideoBtn');
    const modal = document.getElementById('mediaModal');
    const modalBody = document.getElementById('modalBody');

    if (heroVideoBtn && modal && modalBody) {
        heroVideoBtn.addEventListener('click', () => {
            const youtubeUrl = heroVideoBtn.getAttribute('data-youtube');
            if (youtubeUrl) {
                modalBody.innerHTML = `
                    <iframe 
                        src="${youtubeUrl}?autoplay=1" 
                        width="100%" 
                        height="100%" 
                        title="YouTube video player" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        allowfullscreen>
                    </iframe>
                `;
                modal.classList.add('open');
                document.body.style.overflow = 'hidden';
            }
        });
    }
});