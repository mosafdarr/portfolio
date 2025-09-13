// Hashir Shoaib Portfolio - Enhanced Smooth Scrolling & Animations
document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ===========================
    // UTILITY FUNCTIONS
    // ===========================
    
    const throttle = (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    };

    const debounce = (func, wait, immediate) => {
        let timeout;
        return function executedFunction() {
            const context = this;
            const args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };

    // Easing functions for smooth scrolling
    const easeInOutCubic = (t) => {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    };

    // ===========================
    // ENHANCED SMOOTH SCROLLING
    // ===========================
    
    function smoothScrollTo(targetPosition, duration = 2000) {
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            const ease = easeInOutCubic(progress);
            window.scrollTo(0, startPosition + (distance * ease));
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }
        
        requestAnimationFrame(animation);
    }
    
    function initSmoothScrolling() {
        const navLinks = document.querySelectorAll('nav a[href^="#"], .smooth-scroll');
        
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - headerHeight - 40;
                    
                    // Use enhanced smooth scrolling with 2.5 second duration
                    smoothScrollTo(targetPosition, 2500);
                    
                    // Close mobile menu if open
                    closeMobileMenu();
                }
            });
        });

        // Also handle CTA buttons
        const ctaButtons = document.querySelectorAll('a[href="#contact"]');
        ctaButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = contactSection.getBoundingClientRect().top + window.pageYOffset - headerHeight - 40;
                    smoothScrollTo(targetPosition, 2500);
                }
            });
        });
    }

    // ===========================
    // HEADER SCROLL EFFECTS
    // ===========================
    
    function initHeaderEffects() {
        const header = document.querySelector('header');
        
        const handleScroll = throttle(() => {
            const scrolled = window.scrollY > 50;
            
            if (scrolled) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }, 16);
        
        window.addEventListener('scroll', handleScroll);
    }

    // ===========================
    // MOBILE MENU
    // ===========================
    
    window.toggleMobileMenu = function() {
        const mobileMenu = document.getElementById('mobile-menu');
        const isHidden = mobileMenu.classList.contains('hidden');
        
        if (isHidden) {
            mobileMenu.classList.remove('hidden');
            mobileMenu.classList.add('show');
            document.body.style.overflow = 'hidden';
        } else {
            closeMobileMenu();
        }
    };

    function closeMobileMenu() {
        const mobileMenu = document.getElementById('mobile-menu');
        mobileMenu.classList.remove('show');
        setTimeout(() => {
            mobileMenu.classList.add('hidden');
            document.body.style.overflow = '';
        }, 300);
    }

    // ===========================
    // INTERSECTION OBSERVER ANIMATIONS
    // ===========================
    
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Add stagger animation for grid items
                    if (entry.target.classList.contains('stagger-animation')) {
                        const children = entry.target.children;
                        Array.from(children).forEach((child, index) => {
                            setTimeout(() => {
                                child.style.opacity = '1';
                                child.style.transform = 'translateY(0)';
                            }, index * 150);
                        });
                    }
                }
            });
        }, observerOptions);
        
        // Observe elements for animation
        const animatedElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .scale-in, .stagger-animation');
        animatedElements.forEach(el => observer.observe(el));
        
        // Add animation classes to elements
        setTimeout(() => {
            addAnimationClasses();
        }, 200);
    }
    
    function addAnimationClasses() {
        // Ensure text visibility
        document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(el => {
            if (!el.style.color) {
                el.style.color = 'var(--text-primary)';
            }
        });
        
        document.querySelectorAll('p, span').forEach(el => {
            if (!el.style.color && !el.classList.contains('text-blue-primary')) {
                el.style.color = 'var(--text-secondary)';
            }
        });
        
        // Hero section elements
        const heroElements = document.querySelectorAll('section:first-of-type h1, section:first-of-type p, section:first-of-type .flex');
        heroElements.forEach((el, index) => {
            el.classList.add('fade-in');
            el.style.animationDelay = `${index * 0.3}s`;
        });
        
        // Services/Pricing grid
        const servicesGrid = document.querySelector('#services .grid');
        if (servicesGrid) {
            servicesGrid.classList.add('stagger-animation');
        }
        
        // Testimonials
        const testimonialsGrid = document.querySelector('#testimonials .grid');
        if (testimonialsGrid) {
            testimonialsGrid.classList.add('stagger-animation');
        }
        
        // Process steps
        const processSteps = document.querySelectorAll('#process .space-y-8 > div');
        processSteps.forEach((step, index) => {
            step.classList.add('fade-in-left');
            step.style.animationDelay = `${index * 0.2}s`;
        });
        
        // Portfolio projects
        const portfolioProjects = document.querySelectorAll('#portfolio .space-y-16 > div');
        portfolioProjects.forEach((project, index) => {
            project.classList.add('fade-in');
            project.style.animationDelay = `${index * 0.2}s`;
        });

        // About section
        const aboutElements = document.querySelectorAll('#about h2, #about h3, #about p, #about button');
        aboutElements.forEach((el, index) => {
            el.classList.add('fade-in-left');
            el.style.animationDelay = `${index * 0.1}s`;
        });
    }

    // ===========================
    // PARALLAX EFFECTS
    // ===========================
    
    function initParallaxEffects() {
        const parallaxElements = document.querySelectorAll('.parallax');
        
        const handleScroll = throttle(() => {
            const scrollTop = window.pageYOffset;
            
            parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                const yPos = -(scrollTop * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        }, 16);
        
        window.addEventListener('scroll', handleScroll);
    }

    // ===========================
    // INTERACTIVE ELEMENTS
    // ===========================
    
    function initInteractiveElements() {
        // Add hover effects to pricing cards
        const pricingCards = document.querySelectorAll('#services .bg-dark-card');
        pricingCards.forEach(card => {
            card.classList.add('pricing-card');
            
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-12px) scale(1.02)';
                this.style.boxShadow = '0 25px 50px rgba(79, 142, 255, 0.2)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
                this.style.boxShadow = '';
            });
        });

        // Add hover effects to testimonial cards
        const testimonialCards = document.querySelectorAll('#testimonials .bg-dark-card');
        testimonialCards.forEach(card => {
            card.classList.add('testimonial-card');
        });

        // Add hover effects to portfolio projects
        const portfolioProjects = document.querySelectorAll('#portfolio .grid');
        portfolioProjects.forEach(project => {
            project.classList.add('portfolio-project');
        });

        // Add process step hover effects
        const processSteps = document.querySelectorAll('#process .flex');
        processSteps.forEach(step => {
            step.classList.add('process-step');
            
            const stepNumber = step.querySelector('.w-12');
            if (stepNumber) {
                stepNumber.classList.add('step-number');
            }
        });
        
        // Add ripple effect to buttons
        const buttons = document.querySelectorAll('button, .bg-blue-primary');
        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                    pointer-events: none;
                `;
                
                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
    }

    // ===========================
    // PARTICLE BACKGROUND
    // ===========================
    
    function initParticleBackground() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '-1';
        canvas.style.opacity = '0.03';
        
        document.body.appendChild(canvas);
        
        let particles = [];
        const particleCount = 30;
        
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        
        function createParticle() {
            return {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                radius: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2
            };
        }
        
        function initParticles() {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(createParticle());
            }
        }
        
        function updateParticles() {
            particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
            });
        }
        
        function drawParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(79, 142, 255, ${particle.opacity})`;
                ctx.fill();
            });
            
            // Draw connections
            particles.forEach((particle, i) => {
                particles.slice(i + 1).forEach(otherParticle => {
                    const distance = Math.sqrt(
                        Math.pow(particle.x - otherParticle.x, 2) +
                        Math.pow(particle.y - otherParticle.y, 2)
                    );
                    
                    if (distance < 150) {
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(otherParticle.x, otherParticle.y);
                        ctx.strokeStyle = `rgba(79, 142, 255, ${0.1 * (1 - distance / 150)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                });
            });
        }
        
        function animate() {
            updateParticles();
            drawParticles();
            requestAnimationFrame(animate);
        }
        
        resizeCanvas();
        initParticles();
        animate();
        
        window.addEventListener('resize', debounce(() => {
            resizeCanvas();
            initParticles();
        }, 250));
    }

    // ===========================
    // FORM HANDLING
    // ===========================
    
    function initFormHandling() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const formData = new FormData(this);
                const data = Object.fromEntries(formData);
                
                console.log('Form submitted:', data);
                showNotification('Thank you! Your message has been sent.', 'success');
            });
        });
    }
    
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg text-white z-50 transition-all duration-500 transform translate-x-full`;
        notification.style.backgroundColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#4F8EFF';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    // ===========================
    // ACCESSIBILITY ENHANCEMENTS
    // ===========================
    
    function initAccessibility() {
        // Add keyboard navigation for mobile menu
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeMobileMenu();
            }
        });
        
        // Reduce motion for users who prefer it
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (prefersReducedMotion.matches) {
            document.documentElement.style.scrollBehavior = 'auto';
            
            // Disable complex animations
            const style = document.createElement('style');
            style.textContent = `
                *, *::before, *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // ===========================
    // PERFORMANCE MONITORING
    // ===========================
    
    function initPerformanceMonitoring() {
        // Monitor page load performance
        window.addEventListener('load', function() {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log(`🚀 Page load time: ${loadTime}ms`);
        });
    }

    // ===========================
    // INITIALIZATION
    // ===========================
    
    function init() {
        console.log('🌟 Hashir Shoaib Portfolio - Initializing...');
        
        // Initialize all features
        initSmoothScrolling();
        initHeaderEffects();
        initScrollAnimations();
        initParallaxEffects();
        initInteractiveElements();
        initParticleBackground();
        initFormHandling();
        initAccessibility();
        initPerformanceMonitoring();
        
        // Force text visibility after load
        setTimeout(() => {
            document.querySelectorAll('*').forEach(el => {
                if (getComputedStyle(el).opacity === '0' && !el.classList.contains('fade-in')) {
                    el.style.opacity = '1';
                }
            });
        }, 1000);
        
        console.log('✅ Portfolio fully loaded with enhanced smooth scrolling and fixed text visibility!');
    }

    // Start initialization
    init();

    // ===========================
    // CSS ANIMATION STYLES
    // ===========================
    
    // Add ripple animation style
    if (!document.querySelector('#ripple-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-style';
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // ===========================
    // ERROR HANDLING
    // ===========================
    
    window.addEventListener('error', function(e) {
        console.error('JavaScript error:', e.error);
    });
    
    window.addEventListener('unhandledrejection', function(e) {
        console.error('Unhandled promise rejection:', e.reason);
    });
});

// ===========================
// GLOBAL UTILITIES
// ===========================

window.HashirShoaib = {
    scrollTo: function(elementId, duration = 2500) {
        const element = document.getElementById(elementId);
        if (element) {
            const headerHeight = document.querySelector('header').offsetHeight;
            const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - headerHeight - 40;
            
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition;
            let startTime = null;

            function animation(currentTime) {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const progress = Math.min(timeElapsed / duration, 1);
                
                const ease = progress < 0.5 ? 4 * progress * progress * progress : (progress - 1) * (2 * progress - 2) * (2 * progress - 2) + 1;
                window.scrollTo(0, startPosition + (distance * ease));
                
                if (timeElapsed < duration) {
                    requestAnimationFrame(animation);
                }
            }
            
            requestAnimationFrame(animation);
        }
    }
};