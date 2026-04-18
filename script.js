/* ============================================
   Yusuf Düzgün — Portfolio Script
   ============================================ */

(function () {
    'use strict';

    // --- Theme Toggle ---
    const themeToggle = document.getElementById('theme-toggle');
    const themeIconMoon = document.getElementById('theme-icon-moon');
    const themeIconSun = document.getElementById('theme-icon-sun');
    
    function updateThemeIcon() {
        if (document.documentElement.getAttribute('data-theme') === 'dark') {
            themeIconMoon.style.display = 'none';
            themeIconSun.style.display = 'block';
        } else {
            themeIconMoon.style.display = 'block';
            themeIconSun.style.display = 'none';
        }
    }
    
    // Initial check
    updateThemeIcon();

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            if (newTheme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
            } else {
                document.documentElement.removeAttribute('data-theme');
            }
            
            localStorage.setItem('theme', newTheme);
            updateThemeIcon();
        });
    }

    // --- Particle System ---
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: -1000, y: -1000 };

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.4 + 0.1;
            this.targetOpacity = this.opacity;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Mouse interaction
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                const force = (150 - dist) / 150;
                this.x -= dx * force * 0.008;
                this.y -= dy * force * 0.008;
                this.targetOpacity = 0.6;
            } else {
                this.targetOpacity = this.opacity;
            }

            // Smooth opacity
            const currentOp = parseFloat(ctx.globalAlpha) || this.opacity;
            this.opacity += (this.targetOpacity - this.opacity) * 0.05;

            // Wrap
            if (this.x < -10) this.x = canvas.width + 10;
            if (this.x > canvas.width + 10) this.x = -10;
            if (this.y < -10) this.y = canvas.height + 10;
            if (this.y > canvas.height + 10) this.y = -10;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(139, 115, 85, ${this.opacity})`;
            ctx.fill();
        }
    }

    function initParticles() {
        const isMobile = window.innerWidth < 768;
        const maxCount = isMobile ? 30 : 80;
        const count = Math.min(Math.floor((canvas.width * canvas.height) / 12000), maxCount);
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }
    initParticles();

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    const op = (1 - dist / 120) * 0.08;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(139, 115, 85, ${op})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        drawConnections();
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    document.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // --- Navigation scroll effect ---
    const nav = document.getElementById('main-nav');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        lastScroll = scrollY;
    });

    // --- Mobile menu ---
    const toggle = document.getElementById('nav-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileOverlay = document.getElementById('mobile-overlay');

    function openMobileMenu() {
        toggle.classList.add('active');
        mobileMenu.classList.add('open');
        if (mobileOverlay) mobileOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        toggle.classList.remove('active');
        mobileMenu.classList.remove('open');
        if (mobileOverlay) mobileOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    toggle.addEventListener('click', () => {
        if (mobileMenu.classList.contains('open')) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    // Close on overlay tap
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', closeMobileMenu);
    }

    // Close on link tap
    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
            closeMobileMenu();
        }
    });

    // --- Scroll reveal ---
    const revealElements = document.querySelectorAll('.reveal-up');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));

    // --- Stat counter animation ---
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.target);
                animateCounter(el, 0, target, 1200);
                statObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => statObserver.observe(el));

    function animateCounter(el, start, end, duration) {
        const startTime = performance.now();
        function tick(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out quad
            const eased = 1 - (1 - progress) * (1 - progress);
            el.textContent = Math.floor(start + (end - start) * eased);
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    // --- Smooth scroll for anchor links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // --- Contact form ---
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<span>Gönderildi! ✓</span>';
            btn.style.background = '#6B8F71';
            btn.style.borderColor = '#6B8F71';
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
                btn.style.borderColor = '';
                form.reset();
            }, 2500);
        });
    }

    // --- Scroll indicator hide on scroll ---
    const scrollIndicator = document.getElementById('scroll-indicator');
    if (scrollIndicator) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                scrollIndicator.style.opacity = '0';
                scrollIndicator.style.pointerEvents = 'none';
            } else {
                scrollIndicator.style.opacity = '';
                scrollIndicator.style.pointerEvents = '';
            }
        });
    }
    // --- Code Typing Animation (Monitor) ---
    const codeLinesEl = document.getElementById('code-lines');
    if (codeLinesEl) {
        // Code snippets with syntax highlighting tokens
        const codeSnippets = [
            // Snippet 1
            [
                [{t:'kw',v:'const'},{t:'',v:' app '},{t:'op',v:'='},{t:'',v:' '},{t:'fn',v:'createApp'},{t:'',v:'({'}],
                [{t:'',v:'  '},{t:'obj',v:'name'},{t:'op',v:':'},{t:'',v:' '},{t:'str',v:'"Yusuf Portfolio"'},{t:'',v:','}],
                [{t:'',v:'  '},{t:'obj',v:'version'},{t:'op',v:':'},{t:'',v:' '},{t:'str',v:'"2.0.0"'},{t:'',v:','}],
                [{t:'',v:'  '},{t:'fn',v:'setup'},{t:'',v:'() {'}],
                [{t:'',v:'    '},{t:'kw',v:'const'},{t:'',v:' theme '},{t:'op',v:'='},{t:'',v:' '},{t:'fn',v:'reactive'},{t:'',v:'({'}],
                [{t:'',v:'      '},{t:'obj',v:'mode'},{t:'op',v:':'},{t:'',v:' '},{t:'str',v:'"cream"'},{t:'',v:','}],
                [{t:'',v:'      '},{t:'obj',v:'font'},{t:'op',v:':'},{t:'',v:' '},{t:'str',v:'"Book Antiqua"'}],
                [{t:'',v:'    });'}],
                [{t:'',v:'    '},{t:'kw',v:'return'},{t:'',v:' { theme };'}],
                [{t:'',v:'  }'}],
                [{t:'',v:'});'}],
                [],
                [{t:'cm',v:'// Initialize particles'}],
                [{t:'kw',v:'function'},{t:'',v:' '},{t:'fn',v:'initParticles'},{t:'',v:'(canvas) {'}],
                [{t:'',v:'  '},{t:'kw',v:'const'},{t:'',v:' count '},{t:'op',v:'='},{t:'',v:' '},{t:'num',v:'80'},{t:'',v:';'}],
                [{t:'',v:'  '},{t:'kw',v:'for'},{t:'',v:' ('},{t:'kw',v:'let'},{t:'',v:' i '},{t:'op',v:'='},{t:'',v:' '},{t:'num',v:'0'},{t:'',v:'; i '},{t:'op',v:'<'},{t:'',v:' count; i'},{t:'op',v:'++'},{t:'',v:') {'}],
                [{t:'',v:'    particles.'},{t:'fn',v:'push'},{t:'',v:'('},{t:'kw',v:'new'},{t:'',v:' '},{t:'fn',v:'Particle'},{t:'',v:'());'}],
                [{t:'',v:'  }'}],
                [{t:'',v:'}'}],
            ],
            // Snippet 2
            [
                [{t:'cm',v:'// Fetch project data'}],
                [{t:'kw',v:'async'},{t:'',v:' '},{t:'kw',v:'function'},{t:'',v:' '},{t:'fn',v:'getProjects'},{t:'',v:'() {'}],
                [{t:'',v:'  '},{t:'kw',v:'try'},{t:'',v:' {'}],
                [{t:'',v:'    '},{t:'kw',v:'const'},{t:'',v:' res '},{t:'op',v:'='},{t:'',v:' '},{t:'kw',v:'await'},{t:'',v:' '},{t:'fn',v:'fetch'},{t:'',v:'('}],
                [{t:'',v:'      '},{t:'str',v:'"/api/projects"'}],
                [{t:'',v:'    );'}],
                [{t:'',v:'    '},{t:'kw',v:'const'},{t:'',v:' data '},{t:'op',v:'='},{t:'',v:' '},{t:'kw',v:'await'},{t:'',v:' res.'},{t:'fn',v:'json'},{t:'',v:'();'}],
                [{t:'',v:'    '},{t:'kw',v:'return'},{t:'',v:' data.'},{t:'fn',v:'map'},{t:'',v:'(p '},{t:'op',v:'=>'},{t:'',v:' ({'}],
                [{t:'',v:'      '},{t:'obj',v:'title'},{t:'op',v:':'},{t:'',v:' p.name,'}],
                [{t:'',v:'      '},{t:'obj',v:'tags'},{t:'op',v:':'},{t:'',v:' p.stack,'}],
                [{t:'',v:'      '},{t:'obj',v:'url'},{t:'op',v:':'},{t:'',v:' p.demo_url'}],
                [{t:'',v:'    }));'}],
                [{t:'',v:'  } '},{t:'kw',v:'catch'},{t:'',v:' (err) {'}],
                [{t:'',v:'    console.'},{t:'fn',v:'error'},{t:'',v:'(err);'}],
                [{t:'',v:'  }'}],
                [{t:'',v:'}'}],
            ],
            // Snippet 3
            [
                [{t:'cm',v:'// Smooth scroll observer'}],
                [{t:'kw',v:'const'},{t:'',v:' observer '},{t:'op',v:'='},{t:'',v:' '},{t:'kw',v:'new'},{t:'',v:' '},{t:'fn',v:'IntersectionObserver'},{t:'',v:'('}],
                [{t:'',v:'  (entries) '},{t:'op',v:'=>'},{t:'',v:' {'}],
                [{t:'',v:'    entries.'},{t:'fn',v:'forEach'},{t:'',v:'(entry '},{t:'op',v:'=>'},{t:'',v:' {'}],
                [{t:'',v:'      '},{t:'kw',v:'if'},{t:'',v:' (entry.isIntersecting) {'}],
                [{t:'',v:'        entry.target.classList'}],
                [{t:'',v:'          .'},{t:'fn',v:'add'},{t:'',v:'('},{t:'str',v:'"visible"'},{t:'',v:');'}],
                [{t:'',v:'      }'}],
                [{t:'',v:'    });'}],
                [{t:'',v:'  },'}],
                [{t:'',v:'  { '},{t:'obj',v:'threshold'},{t:'op',v:':'},{t:'',v:' '},{t:'num',v:'0.15'},{t:'',v:' }'}],
                [{t:'',v:');'}],
                [],
                [{t:'cm',v:'// Apply to elements'}],
                [{t:'kw',v:'const'},{t:'',v:' els '},{t:'op',v:'='},{t:'',v:' document'}],
                [{t:'',v:'  .'},{t:'fn',v:'querySelectorAll'},{t:'',v:'('},{t:'str',v:'".reveal"'},{t:'',v:');'}],
                [{t:'',v:'els.'},{t:'fn',v:'forEach'},{t:'',v:'(el '},{t:'op',v:'=>'}],
                [{t:'',v:'  observer.'},{t:'fn',v:'observe'},{t:'',v:'(el)'}],
                [{t:'',v:');'}],
            ],
        ];

        let currentSnippet = 0;
        let currentLine = 0;
        let currentChar = 0;
        let lineNumber = 1;
        let typing = true;

        function renderToken(token) {
            if (token.t) {
                return `<span class="${token.t}">${escapeHtml(token.v)}</span>`;
            }
            return escapeHtml(token.v);
        }

        function escapeHtml(str) {
            return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        }

        function getFullLineHtml(tokens) {
            return tokens.map(renderToken).join('');
        }

        function getPartialLineHtml(tokens, charCount) {
            let result = '';
            let remaining = charCount;
            for (const token of tokens) {
                if (remaining <= 0) break;
                const text = token.v;
                const slice = text.substring(0, remaining);
                remaining -= slice.length;
                if (token.t) {
                    result += `<span class="${token.t}">${escapeHtml(slice)}</span>`;
                } else {
                    result += escapeHtml(slice);
                }
            }
            return result;
        }

        function getTotalChars(tokens) {
            return tokens.reduce((sum, t) => sum + t.v.length, 0);
        }

        function addCompleteLine(tokens, ln) {
            const div = document.createElement('div');
            div.className = 'code-line';
            div.innerHTML = `<span class="line-num">${ln}</span>${getFullLineHtml(tokens)}`;
            codeLinesEl.appendChild(div);
        }

        function typeStep() {
            const snippet = codeSnippets[currentSnippet];
            const lineTokens = snippet[currentLine];

            // Empty line
            if (lineTokens.length === 0) {
                addCompleteLine([], lineNumber);
                lineNumber++;
                currentLine++;
                currentChar = 0;
                scrollMonitor();
                if (currentLine >= snippet.length) {
                    nextSnippet();
                    return;
                }
                setTimeout(typeStep, 60);
                return;
            }

            const totalChars = getTotalChars(lineTokens);

            // Get or create current typing line
            let activeLine = codeLinesEl.querySelector('.typing-active');
            if (!activeLine) {
                activeLine = document.createElement('div');
                activeLine.className = 'code-line typing-active';
                codeLinesEl.appendChild(activeLine);
            }

            currentChar++;
            const partial = getPartialLineHtml(lineTokens, currentChar);
            activeLine.innerHTML = `<span class="line-num">${lineNumber}</span>${partial}<span class="cursor-blink"></span>`;
            scrollMonitor();

            if (currentChar >= totalChars) {
                // Line complete
                activeLine.classList.remove('typing-active');
                activeLine.innerHTML = `<span class="line-num">${lineNumber}</span>${getFullLineHtml(lineTokens)}`;
                lineNumber++;
                currentLine++;
                currentChar = 0;

                if (currentLine >= snippet.length) {
                    nextSnippet();
                    return;
                }
                setTimeout(typeStep, 80 + Math.random() * 60);
            } else {
                const delay = 25 + Math.random() * 35;
                setTimeout(typeStep, delay);
            }
        }

        function nextSnippet() {
            setTimeout(() => {
                // Clear and move to next snippet
                codeLinesEl.innerHTML = '';
                lineNumber = 1;
                currentLine = 0;
                currentChar = 0;
                currentSnippet = (currentSnippet + 1) % codeSnippets.length;
                setTimeout(typeStep, 400);
            }, 2000);
        }

        function scrollMonitor() {
            const screen = codeLinesEl.parentElement;
            screen.scrollTop = screen.scrollHeight;
        }

        // Start typing after page load animation
        setTimeout(typeStep, 2000);
    }

    // --- Pixel Art Coder Animation ---
    const pixelCanvas = document.getElementById('pixel-coder-canvas');
    if (pixelCanvas) {
        const pCtx = pixelCanvas.getContext('2d');
        let pWidth, pHeight, pixelSize;
        let frameCount = 0;
        let ambientDots = [];
        let codeParticles = [];
        const codeSnippetTexts = ['const', 'let', 'function', '=>', '{}', '()', 'return', 'async', 'await', 'import', 'class', 'if', 'for', 'map', '.then', 'export', 'new', 'this', '===', '!=', '[]', 'true', 'null', 'var', 'try', 'catch', '<div>', '</>', 'css', 'html', 'npm', 'git', 'push', 'log', 'API', 'JSON', 'fetch', 'data', 'props', 'state'];

        function resizePixelCanvas() {
            const rect = pixelCanvas.parentElement.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            pWidth = rect.width;
            pHeight = rect.height;
            pixelCanvas.width = pWidth * dpr;
            pixelCanvas.height = pHeight * dpr;
            pCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
            pixelSize = Math.max(3, Math.floor(pWidth / 120));
            initAmbientDots();
        }

        function initAmbientDots() {
            ambientDots = [];
            for (let i = 0; i < 60; i++) {
                ambientDots.push({
                    x: Math.random() * pWidth,
                    y: Math.random() * pHeight,
                    size: Math.random() * 2 + 0.5,
                    speed: Math.random() * 0.3 + 0.05,
                    opacity: Math.random() * 0.4 + 0.1,
                    drift: (Math.random() - 0.5) * 0.2
                });
            }
        }

        resizePixelCanvas();
        window.addEventListener('resize', resizePixelCanvas);

        // Color palette
        const C = {
            skin: '#e8a87c',
            skinShadow: '#c4835d',
            hair: '#3d2b1f',
            headphone: '#b0b8c4',
            headphoneDark: '#7a8694',
            headphoneBand: '#8a9aaa',
            shirt: '#4a6fa5',
            shirtDark: '#3a5580',
            pants: '#555566',
            pantsDark: '#3e3e4e',
            desk: '#5c4a3a',
            deskTop: '#7a6350',
            deskLeg: '#4a3828',
            monitor: '#1e1e2e',
            monitorBorder: '#3a3a4c',
            monitorScreen: '#0d1117',
            screenGlow: '#61afef',
            chair: '#444455',
            chairDark: '#333344',
            eye: '#1a1a1a',
            mouth: '#c4835d',
            floor: '#2a2a3c',
            floorDot: '#3a3a4c',
        };

        // Pixel art grid for the character scene (each row is an array of [color, x, y, w, h] relative positions)
        // We'll draw procedurally for flexibility

        function drawPixelRect(x, y, w, h, color) {
            pCtx.fillStyle = color;
            pCtx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
        }

        function drawScene() {
            const ps = pixelSize;
            const centerX = pWidth / 2;
            const groundY = pHeight * 0.82;

            // Character position (sitting at desk)
            const charX = centerX - ps * 5;
            const charY = groundY - ps * 22;

            // === DESK ===
            const deskX = centerX - ps * 14;
            const deskY = groundY - ps * 12;
            // Desk top surface
            drawPixelRect(deskX, deskY, ps * 28, ps * 2, C.deskTop);
            drawPixelRect(deskX + ps, deskY + ps * 0.5, ps * 26, ps * 1, C.desk);
            // Desk legs
            drawPixelRect(deskX + ps * 2, deskY + ps * 2, ps * 2, ps * 10, C.deskLeg);
            drawPixelRect(deskX + ps * 24, deskY + ps * 2, ps * 2, ps * 10, C.deskLeg);
            // Desk cross bar
            drawPixelRect(deskX + ps * 2, deskY + ps * 8, ps * 24, ps * 1, C.deskLeg);

            // === CHAIR ===
            const chairX = charX - ps * 4;
            const chairY = charY + ps * 8;
            // Chair back
            drawPixelRect(chairX - ps * 1, chairY - ps * 4, ps * 2, ps * 12, C.chairDark);
            drawPixelRect(chairX - ps * 2, chairY - ps * 4, ps * 4, ps * 1, C.chair);
            // Chair seat
            drawPixelRect(chairX - ps * 1, chairY + ps * 8, ps * 12, ps * 2, C.chair);
            // Chair legs
            drawPixelRect(chairX, chairY + ps * 10, ps * 1.5, ps * 4, C.chairDark);
            drawPixelRect(chairX + ps * 9, chairY + ps * 10, ps * 1.5, ps * 4, C.chairDark);
            // Chair wheels
            drawPixelRect(chairX - ps * 1, chairY + ps * 13.5, ps * 3, ps * 1.5, C.chairDark);
            drawPixelRect(chairX + ps * 8, chairY + ps * 13.5, ps * 3, ps * 1.5, C.chairDark);

            // === MONITOR ON DESK ===
            const monX = centerX + ps * 0;
            const monY = deskY - ps * 12;
            const monW = ps * 14;
            const monH = ps * 10;
            // Monitor border
            drawPixelRect(monX - ps * 1, monY - ps * 1, monW + ps * 2, monH + ps * 2, C.monitorBorder);
            // Monitor screen
            drawPixelRect(monX, monY, monW, monH, C.monitorScreen);

            // Animated screen content (code lines)
            const time = frameCount * 0.05;
            const lineColors = ['#61afef', '#c678dd', '#98c379', '#e06c75', '#d19a66', '#56b6c2'];
            for (let i = 0; i < 7; i++) {
                const lineY = monY + ps * 1.2 + i * ps * 1.2;
                const lineWidth = ps * (3 + Math.abs(Math.sin(time + i * 1.5)) * 8);
                const lineColor = lineColors[i % lineColors.length];
                const alpha = 0.5 + Math.sin(time * 2 + i) * 0.2;
                pCtx.globalAlpha = alpha;
                drawPixelRect(monX + ps * 1, lineY, lineWidth, ps * 0.7, lineColor);
                pCtx.globalAlpha = 1;
            }

            // Blinking cursor on screen
            if (Math.sin(frameCount * 0.08) > 0) {
                const cursorLine = Math.floor(frameCount * 0.02) % 7;
                const cursorY = monY + ps * 1.2 + cursorLine * ps * 1.2;
                const cursorX = monX + ps * 1 + ps * (3 + Math.abs(Math.sin(time + cursorLine * 1.5)) * 8) + ps * 0.5;
                drawPixelRect(cursorX, cursorY, ps * 0.5, ps * 0.8, '#528bff');
            }

            // Monitor stand
            drawPixelRect(monX + monW / 2 - ps * 1.5, monY + monH + ps * 1, ps * 3, ps * 2, C.monitorBorder);
            drawPixelRect(monX + monW / 2 - ps * 3, deskY - ps * 0.5, ps * 6, ps * 1, C.monitorBorder);

            // Screen glow effect
            pCtx.save();
            const glowGrad = pCtx.createRadialGradient(
                monX + monW / 2, monY + monH / 2, 0,
                monX + monW / 2, monY + monH / 2, monW * 1.5
            );
            glowGrad.addColorStop(0, 'rgba(97, 175, 239, 0.08)');
            glowGrad.addColorStop(1, 'rgba(97, 175, 239, 0)');
            pCtx.fillStyle = glowGrad;
            pCtx.fillRect(monX - monW, monY - monH, monW * 3, monH * 3);
            pCtx.restore();

            // === CHARACTER (sitting) ===
            const bobOffset = Math.sin(frameCount * 0.03) * ps * 0.3;
            const cX = charX;
            const cY = charY + bobOffset;

            // Body / Shirt
            drawPixelRect(cX, cY + ps * 6, ps * 10, ps * 8, C.shirt);
            drawPixelRect(cX + ps * 1, cY + ps * 6, ps * 8, ps * 7, C.shirtDark);

            // Collar detail
            drawPixelRect(cX + ps * 3, cY + ps * 6, ps * 4, ps * 1, C.shirt);

            // === HEAD ===
            // Hair (back)
            drawPixelRect(cX + ps * 1, cY - ps * 1, ps * 8, ps * 3, C.hair);
            // Face
            drawPixelRect(cX + ps * 2, cY + ps * 1, ps * 6, ps * 5, C.skin);
            drawPixelRect(cX + ps * 1, cY + ps * 2, ps * 8, ps * 3, C.skin);
            // Shadow on face
            drawPixelRect(cX + ps * 2, cY + ps * 4, ps * 6, ps * 1, C.skinShadow);

            // Hair (front/top)
            drawPixelRect(cX + ps * 1, cY - ps * 1, ps * 8, ps * 2.5, C.hair);
            drawPixelRect(cX + ps * 0.5, cY, ps * 2, ps * 1.5, C.hair);

            // Eyes (blink animation)
            const blinkCycle = frameCount % 180;
            if (blinkCycle > 5) {
                // Open eyes
                drawPixelRect(cX + ps * 3.5, cY + ps * 2.5, ps * 1, ps * 1, C.eye);
                drawPixelRect(cX + ps * 6, cY + ps * 2.5, ps * 1, ps * 1, C.eye);
                // Eye shine
                drawPixelRect(cX + ps * 3.5, cY + ps * 2.5, ps * 0.4, ps * 0.4, '#ffffff');
                drawPixelRect(cX + ps * 6, cY + ps * 2.5, ps * 0.4, ps * 0.4, '#ffffff');
            } else {
                // Closed eyes (blink)
                drawPixelRect(cX + ps * 3.5, cY + ps * 3, ps * 1, ps * 0.4, C.eye);
                drawPixelRect(cX + ps * 6, cY + ps * 3, ps * 1, ps * 0.4, C.eye);
            }

            // Mouth (subtle)
            drawPixelRect(cX + ps * 4.5, cY + ps * 4, ps * 1.5, ps * 0.5, C.mouth);

            // === HEADPHONES ===
            // Headband (top arc)
            drawPixelRect(cX + ps * 0.5, cY - ps * 1.5, ps * 9, ps * 1, C.headphoneBand);
            drawPixelRect(cX, cY - ps * 1, ps * 1, ps * 1, C.headphoneBand);
            drawPixelRect(cX + ps * 9, cY - ps * 1, ps * 1, ps * 1, C.headphoneBand);

            // Left ear cup
            drawPixelRect(cX - ps * 0.5, cY + ps * 1, ps * 2.5, ps * 3, C.headphone);
            drawPixelRect(cX - ps * 0.5, cY + ps * 1.5, ps * 1, ps * 2, C.headphoneDark);

            // Right ear cup
            drawPixelRect(cX + ps * 8, cY + ps * 1, ps * 2.5, ps * 3, C.headphone);
            drawPixelRect(cX + ps * 9.5, cY + ps * 1.5, ps * 1, ps * 2, C.headphoneDark);

            // Mic arm
            drawPixelRect(cX + ps * 10, cY + ps * 2.5, ps * 2, ps * 0.6, C.headphoneDark);
            drawPixelRect(cX + ps * 11.5, cY + ps * 2.5, ps * 1, ps * 1.5, C.headphone);

            // === ARMS (static) ===
            // Left arm (on keyboard)
            drawPixelRect(cX - ps * 1, cY + ps * 7, ps * 2, ps * 5, C.shirt);
            drawPixelRect(cX - ps * 1, cY + ps * 11, ps * 3, ps * 1.5, C.skin);

            // Right arm (on mouse/keyboard)
            drawPixelRect(cX + ps * 9, cY + ps * 7, ps * 2, ps * 5, C.shirt);
            drawPixelRect(cX + ps * 9, cY + ps * 11, ps * 3, ps * 1.5, C.skin);

            // === LEGS (seated) ===
            drawPixelRect(cX + ps * 1, cY + ps * 14, ps * 3.5, ps * 3, C.pants);
            drawPixelRect(cX + ps * 5.5, cY + ps * 14, ps * 3.5, ps * 3, C.pants);
            // Shoes
            drawPixelRect(cX + ps * 1, cY + ps * 17, ps * 3.5, ps * 1.5, '#2a2a2a');
            drawPixelRect(cX + ps * 5.5, cY + ps * 17, ps * 3.5, ps * 1.5, '#2a2a2a');

            // === KEYBOARD ON DESK ===
            drawPixelRect(centerX - ps * 4, deskY - ps * 1.5, ps * 8, ps * 1.5, '#3a3a4c');
            // Key dots
            for (let kx = 0; kx < 6; kx++) {
                for (let ky = 0; ky < 1; ky++) {
                    pCtx.fillStyle = 'rgba(255,255,255,0.15)';
                    pCtx.fillRect(centerX - ps * 3.5 + kx * ps * 1.2, deskY - ps * 1.2 + ky * ps * 0.6, ps * 0.7, ps * 0.4);
                }
            }

            // === COFFEE MUG ===
            const mugX = centerX - ps * 10;
            const mugY = deskY - ps * 3;
            drawPixelRect(mugX, mugY, ps * 2.5, ps * 3, '#d4a373');
            drawPixelRect(mugX + ps * 2.5, mugY + ps * 0.5, ps * 1, ps * 2, '#d4a373');
            // Coffee inside
            drawPixelRect(mugX + ps * 0.3, mugY + ps * 0.3, ps * 2, ps * 0.8, '#5c3a1e');
            // Steam animation
            const steamPhase = frameCount * 0.04;
            for (let si = 0; si < 3; si++) {
                const sx = mugX + ps * 0.5 + si * ps * 0.8;
                const sy = mugY - ps * 1.5 - Math.sin(steamPhase + si * 1.2) * ps * 1.5;
                const steamAlpha = 0.15 + Math.sin(steamPhase + si) * 0.1;
                pCtx.globalAlpha = steamAlpha;
                drawPixelRect(sx, sy, ps * 0.5, ps * 1, '#aaaacc');
                pCtx.globalAlpha = 1;
            }

            // === FLOOR LINE ===
            // Dotted floor grid
            for (let fx = 0; fx < pWidth; fx += ps * 3) {
                pCtx.fillStyle = C.floorDot;
                const fy = groundY + ps * 1;
                pCtx.fillRect(fx, fy, ps * 0.5, ps * 0.5);
            }
            for (let fx = 0; fx < pWidth; fx += ps * 3) {
                pCtx.fillStyle = 'rgba(58,58,76,0.5)';
                pCtx.fillRect(fx + ps * 1.5, groundY + ps * 3, ps * 0.4, ps * 0.4);
            }
        }

        function drawAmbientDots() {
            ambientDots.forEach(dot => {
                dot.y -= dot.speed;
                dot.x += dot.drift + Math.sin(frameCount * 0.02 + dot.x * 0.01) * 0.1;
                if (dot.y < -5) {
                    dot.y = pHeight + 5;
                    dot.x = Math.random() * pWidth;
                }
                if (dot.x < 0) dot.x = pWidth;
                if (dot.x > pWidth) dot.x = 0;

                const twinkle = 0.5 + Math.sin(frameCount * 0.03 + dot.x) * 0.5;
                pCtx.globalAlpha = dot.opacity * twinkle;
                pCtx.fillStyle = '#8a8aba';
                pCtx.fillRect(dot.x, dot.y, dot.size, dot.size);
                pCtx.globalAlpha = 1;
            });
        }

        // Code particles that fly from the monitor screen outwards
        function spawnCodeParticle() {
            const ps = pixelSize;
            const centerX = pWidth / 2;
            const groundY = pHeight * 0.82;
            const deskY = groundY - ps * 12;
            const monX = centerX + ps * 0;
            const monY = deskY - ps * 12;
            const monW = ps * 14;
            const monH = ps * 10;

            // Origin: center of the monitor screen
            const originX = monX + monW / 2;
            const originY = monY + monH / 2;

            // Random angle outward
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.4 + Math.random() * 1.2;

            const colors = ['#61afef', '#c678dd', '#98c379', '#e06c75', '#d19a66', '#56b6c2', '#e5c07b', '#528bff'];
            const text = codeSnippetTexts[Math.floor(Math.random() * codeSnippetTexts.length)];

            codeParticles.push({
                x: originX,
                y: originY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                text: text,
                color: colors[Math.floor(Math.random() * colors.length)],
                opacity: 0.9,
                size: Math.max(7, ps * 1.2),
                life: 1.0,
                decay: 0.003 + Math.random() * 0.004,
                rotation: (Math.random() - 0.5) * 0.02
            });
        }

        function updateAndDrawCodeParticles() {
            pCtx.save();
            for (let i = codeParticles.length - 1; i >= 0; i--) {
                const p = codeParticles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life -= p.decay;
                p.opacity = p.life * 0.8;

                if (p.life <= 0 || p.x < -50 || p.x > pWidth + 50 || p.y < -50 || p.y > pHeight + 50) {
                    codeParticles.splice(i, 1);
                    continue;
                }

                pCtx.globalAlpha = p.opacity;
                pCtx.font = `${Math.round(p.size)}px 'Courier New', Consolas, monospace`;
                pCtx.fillStyle = p.color;
                pCtx.fillText(p.text, p.x, p.y);
            }
            pCtx.globalAlpha = 1;
            pCtx.restore();
        }

        function animatePixelCoder() {
            frameCount++;
            pCtx.clearRect(0, 0, pWidth, pHeight);

            // Dark background gradient
            const bgGrad = pCtx.createRadialGradient(pWidth / 2, pHeight * 0.3, 0, pWidth / 2, pHeight * 0.3, pWidth * 0.8);
            bgGrad.addColorStop(0, '#1e1e30');
            bgGrad.addColorStop(1, '#12121e');
            pCtx.fillStyle = bgGrad;
            pCtx.fillRect(0, 0, pWidth, pHeight);

            drawAmbientDots();

            // Spawn code particles periodically
            if (frameCount % 8 === 0) {
                spawnCodeParticle();
            }
            // Keep particle count manageable
            if (codeParticles.length > 80) {
                codeParticles.splice(0, codeParticles.length - 80);
            }

            updateAndDrawCodeParticles();
            drawScene();

            requestAnimationFrame(animatePixelCoder);
        }

        // Start animation when visible
        const pixelObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animatePixelCoder();
                    pixelObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        pixelObserver.observe(pixelCanvas);
    }

})();
