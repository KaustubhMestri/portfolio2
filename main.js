import './style.css';

// 1. Custom Cursor Logic
const cursor = document.getElementById('custom-cursor');
const interactives = document.querySelectorAll('.interactive, a, button, input, textarea');

document.addEventListener('mousemove', (e) => {
    // Update cursor position
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

// Add hover states for interactive elements
interactives.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.classList.add('active');
    });
    el.addEventListener('mouseleave', () => {
        cursor.classList.remove('active');
    });
});

// Hide cursor when leaving window
document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
});
document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
});

// 2. Parallax Effect logic
const parallaxElements = document.querySelectorAll('[data-parallax]');

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    parallaxElements.forEach(el => {
        const speed = el.getAttribute('data-parallax');
        const yPos = -(scrollY * speed);
        el.style.transform = `translateY(${yPos}px)`;
    });
});


// 3. Token-Stream Background Animation (Canvas)
const canvas = document.getElementById('token-stream');
const ctx = canvas.getContext('2d');

let cw = window.innerWidth;
let ch = window.innerHeight;
canvas.width = cw;
canvas.height = ch;

window.addEventListener('resize', () => {
    cw = window.innerWidth;
    ch = window.innerHeight;
    canvas.width = cw;
    canvas.height = ch;
});

// Characters - Hex, code snippets, matrix style
const chars = '0123456789ABCDEF{}[]();:<>/?=*+-!^&|~'.split('');
const fontSize = 14;
const columns = cw / fontSize;
const drops = [];

// Initialize drops starting at top or random
for (let x = 0; x < columns; x++) {
    drops[x] = Math.random() * ch; // start at random heights initially
}

function drawTokenStream() {
    // Translucent black background to create trail
    ctx.fillStyle = 'rgba(10, 11, 16, 0.05)';
    ctx.fillRect(0, 0, cw, ch);

    // Setup text style
    ctx.fillStyle = 'rgba(0, 240, 255, 0.4)'; // Cyan text, partly transparent
    ctx.font = fontSize + 'px "JetBrains Mono", monospace';

    for (let i = 0; i < drops.length; i++) {
        // Random character
        const text = chars[Math.floor(Math.random() * chars.length)];

        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Reset drop to top randomly
        if (drops[i] * fontSize > ch && Math.random() > 0.975) {
            drops[i] = 0;
        }

        // Move drop down
        drops[i]++;
    }
}

// Animation loop
setInterval(drawTokenStream, 50);


// 4. Live Terminal Component Logic
const terminalInput = document.getElementById('terminal-input');
const terminalOutput = document.getElementById('terminal-output');

const terminalCommands = {
    'help': `Available commands:
    <span class="text-cyan">help</span>   - Show this list
    <span class="text-cyan">about</span>  - Read bio
    <span class="text-cyan">skills</span> - View technical stack
    <span class="text-cyan">clear</span>  - Clear terminal screen`,

    'about': `> Executing bio.sh...
    I am Kaustubh Mestri, a Generative AI Developer.
    Specializing in building robust RAG systems, integrating complex LLMs, and architecting scalable AI solutions.
    Pushing boundaries in search, agents, and data.`,

    'skills': `> Loading competencies...
    <span class="text-purple">Backend:</span> Python, FastAPI, Node.js
    <span class="text-purple">AI/ML:</span>   LangChain, OpenAI, Gemini, HuggingFace
    <span class="text-purple">Data:</span>    Pandas, Vector DBs (Pinecone, Chroma)
    <span class="text-purple">Infra:</span>   Docker, AWS, Git`,

    'clear': 'CLEAR_SCREEN' // Special instruction handled below
};

function addTerminalLine(content, isCommand = false) {
    const line = document.createElement('div');
    line.className = 'terminal-line';

    if (isCommand) {
        line.innerHTML = `<span class="terminal-prompt">guest@kaustubh:~$</span><span class="terminal-cmd">${content}</span>`;
    } else {
        // preserve whitespace for ascii/formatting via styling
        line.style.whiteSpace = 'pre-wrap';
        line.innerHTML = content;
    }

    // Insert before the input line
    const inputLine = document.querySelector('.terminal-input-line');
    terminalOutput.insertBefore(line, inputLine);

    // Scroll to bottom
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

terminalInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        const command = this.value.trim().toLowerCase();

        if (command) {
            // Echo command
            addTerminalLine(command, true);

            // Handle output
            if (terminalCommands.hasOwnProperty(command)) {
                if (terminalCommands[command] === 'CLEAR_SCREEN') {
                    // Remove all lines except the input line
                    const lines = terminalOutput.querySelectorAll('.terminal-line');
                    lines.forEach(l => l.remove());
                } else {
                    addTerminalLine(terminalCommands[command]);
                }
            } else {
                addTerminalLine(`bash: ${command}: command not found. Type <span class="text-cyan">'help'</span>.`);
            }
        } else {
            // Just empty enter echo
            addTerminalLine('', true);
        }

        // Clear input
        this.value = '';
    }
});

// Focus input when clicking anywhere on the terminal body
terminalOutput.addEventListener('click', () => {
    terminalInput.focus();
});

// 5. GitHub Repos Section
const LANG_COLORS = {
    'Python': '#3572A5', 'JavaScript': '#f1e05a', 'TypeScript': '#2b7489',
    'Jupyter Notebook': '#DA5B0B', 'HTML': '#e34c26', 'CSS': '#563d7c',
    'Shell': '#89e051', 'Go': '#00ADD8', 'Rust': '#dea584', 'C++': '#f34b7d',
    'Java': '#b07219', 'default': '#8A2BE2'
};

// Repos to skip (profile READMEs, config repos etc.)
const SKIP_REPOS = ['Kaustubh-Mestri', 'Kaustubh'];

async function fetchAndRenderRepos() {
    const grid = document.getElementById('github-repos-grid');
    if (!grid) return;

    try {
        const res = await fetch('https://api.github.com/users/KaustubhMestri/repos?per_page=50&sort=pushed');
        const repos = await res.json();

        const filtered = repos
            .filter(r => !SKIP_REPOS.includes(r.name) && !r.fork)
            .sort((a, b) => (b.stargazers_count - a.stargazers_count) || (b.size - a.size));

        grid.innerHTML = '';

        if (filtered.length === 0) {
            grid.innerHTML = '<p class="mono text-secondary" style="grid-column:1/-1;text-align:center;padding:2rem;">No public repositories found.</p>';
            return;
        }

        filtered.forEach(repo => {
            const langColor = LANG_COLORS[repo.language] || LANG_COLORS['default'];
            const desc = repo.description || 'No description provided.';
            const homepage = repo.homepage ? `<a href="${repo.homepage}" target="_blank" style="font-size:0.7rem;font-family:var(--font-mono);color:var(--color-accent-purple);text-decoration:none;margin-left:auto;" title="Live Demo">↗ Live</a>` : '';

            const card = document.createElement('a');
            card.className = 'repo-card interactive';
            card.href = repo.html_url;
            card.target = '_blank';
            card.rel = 'noopener noreferrer';

            card.innerHTML = `
        <div class="repo-card-name">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
          </svg>
          ${repo.name.replace(/-/g, '-\u200B')}
        </div>
        <p class="repo-card-desc">${desc}</p>
        <div class="repo-card-meta">
          ${repo.language ? `<span class="repo-lang"><span class="lang-dot" style="background:${langColor};box-shadow:0 0 6px ${langColor}66;"></span>${repo.language}</span>` : ''}
          <span class="repo-stars">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            ${repo.stargazers_count}
          </span>
          ${homepage}
        </div>
        <div class="repo-card-arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
        </div>
      `;

            grid.appendChild(card);

            // Add hover cursor effect to dynamically created cards
            card.addEventListener('mouseenter', () => cursor.classList.add('active'));
            card.addEventListener('mouseleave', () => cursor.classList.remove('active'));
        });

        // Stagger reveal after render
        if (window.__staggerCards) window.__staggerCards();

    } catch (err) {
        grid.innerHTML = '<p class="mono text-secondary" style="grid-column:1/-1;text-align:center;padding:2rem;">Failed to load repositories. <a href="https://github.com/KaustubhMestri" target="_blank" style="color:var(--color-accent-cyan)">View on GitHub →</a></p>';
        console.error('GitHub API error:', err);
    }
}

fetchAndRenderRepos();

// 6. Nav scroll effect
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
}, { passive: true });

// 7. Scroll-reveal (Intersection Observer)
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target); // fire once
        }
    });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

// Add reveal to all sections and section titles
document.querySelectorAll('section, .section-title, .tech-pill, .tech-container').forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
});

// Hero is already visible — show immediately
document.querySelectorAll('.hero, .hero *').forEach(el => {
    el.classList.add('reveal', 'visible');
});

// Stagger reveal on repo cards after they're rendered (called after fetch)
function staggerRevealCards() {
    document.querySelectorAll('.repo-card').forEach((card, i) => {
        card.classList.add('reveal');
        card.style.transitionDelay = `${i * 60}ms`;
        revealObserver.observe(card);
    });
}

// Patch fetchAndRenderRepos to stagger after render
const origRender = fetchAndRenderRepos;
window.__staggerCards = staggerRevealCards;

