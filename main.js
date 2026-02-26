import './style.css';


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
const chars = ['0', '1'];
const fontSize = 16;
const colSpacing = 22; // wider spacing = sparser / more minimal
const columns = Math.floor(cw / colSpacing);
const drops = [];
const colColor = []; // per-column colour: 0=cyan, 1=purple

// Initialize drops and assign a colour per column
for (let x = 0; x < columns; x++) {
    drops[x] = Math.random() * (ch / fontSize);
    colColor[x] = Math.random() > 0.65 ? 1 : 0;
}

function drawTokenStream() {
    // Faster fade = cleaner characters, no overlapping smear
    ctx.fillStyle = 'rgba(10, 11, 16, 0.15)';
    ctx.fillRect(0, 0, cw, ch);

    ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
    ctx.textBaseline = 'top';

    for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * colSpacing;
        const y = drops[i] * fontSize;

        // Lead character — bright
        ctx.fillStyle = colColor[i] === 1
            ? 'rgba(200, 150, 255, 0.9)'
            : 'rgba(160, 255, 255, 0.9)';
        ctx.fillText(text, x, y);

        // Reset drop to top
        if (y > ch && Math.random() > 0.96) {
            drops[i] = 0;
            colColor[i] = Math.random() > 0.65 ? 1 : 0;
        }

        drops[i] += 0.5;
    }
}

// Animation loop — use rAF instead of setInterval to prevent scroll jank
let lastFrameTime = 0;
const FRAME_INTERVAL = 45; // ms between canvas redraws

function animationLoop(timestamp) {
    if (timestamp - lastFrameTime >= FRAME_INTERVAL) {
        drawTokenStream();
        lastFrameTime = timestamp;
    }
    requestAnimationFrame(animationLoop);
}
requestAnimationFrame(animationLoop);



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

// 5. Contact Form — Formspree (direct email delivery)
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
const transmitBtn = document.getElementById('transmit-btn');

// Replace YOUR_FORM_ID with your Formspree form ID (see formspree.io)
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    if (!name || !email || !message) {
        formStatus.style.color = 'rgba(255,80,80,0.9)';
        formStatus.textContent = '// All fields required before transmission.';
        return;
    }

    transmitBtn.disabled = true;
    transmitBtn.textContent = 'TRANSMITTING...';
    formStatus.style.color = 'rgba(160,160,160,0.8)';
    formStatus.textContent = '// Establishing connection...';

    try {
        const res = await fetch(FORMSPREE_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ name, email, message })
        });

        if (res.ok) {
            formStatus.style.color = 'rgba(0, 240, 255, 0.9)';
            formStatus.textContent = '// Transmission successful. Message received ✓';
            contactForm.reset();
        } else {
            const data = await res.json();
            throw new Error(data?.errors?.[0]?.message || 'Server rejected transmission.');
        }
    } catch (err) {
        formStatus.style.color = 'rgba(255,80,80,0.9)';
        formStatus.textContent = `// Error: ${err.message}`;
    } finally {
        transmitBtn.disabled = false;
        transmitBtn.textContent = 'TRANSMIT';
        setTimeout(() => { formStatus.textContent = ''; }, 6000);
    }
});


const LANG_COLORS = {
    'Python': '#3572A5', 'JavaScript': '#f1e05a', 'TypeScript': '#2b7489',
    'Jupyter Notebook': '#DA5B0B', 'HTML': '#e34c26', 'CSS': '#563d7c',
    'Shell': '#89e051', 'Go': '#00ADD8', 'Rust': '#dea584', 'C++': '#f34b7d',
    'Java': '#b07219', 'default': '#8A2BE2'
};

// Repos to skip (profile READMEs, config repos etc.)
const SKIP_REPOS = ['Kaustubh-Mestri', 'Kaustubh'];

const HARDCODED_REPOS = [
    {
        name: "Medical-Chatbot",
        description: "A simple AI-powered medical chatbot that provides basic health information, symptom guidance, and wellness tips.",
        html_url: "https://github.com/KaustubhMestri/Medical-Chatbot",
        homepage: "",
        language: "Python",
        stargazers_count: 0,
        size: 61515
    },
    {
        name: "Zomato-Restaurant-Intelligence-Recommendation-Platform",
        description: "A complete data + ML + business intelligence system (Not just charts, but decisions).",
        html_url: "https://github.com/KaustubhMestri/Zomato-Restaurant-Intelligence-Recommendation-Platform",
        homepage: "",
        language: "Jupyter Notebook",
        stargazers_count: 0,
        size: 7340
    },
    {
        name: "Stock-Forecast-App",
        description: "Forecast and compare BSE stock prices using ARIMA with an interactive Streamlit UI.",
        html_url: "https://github.com/KaustubhMestri/Stock-Forecast-App",
        homepage: "https://stock-forecast-app-6fax3fpdeetb633tye6t7m.streamlit.app/",
        language: "Python",
        stargazers_count: 0,
        size: 1173
    },
    {
        name: "Receipt-Text-Extraction-and-Parsing-Using-OCR",
        description: "An OCR-based Python project using pytesseract to extract and parse information like date, amount, and store name from receipt images.",
        html_url: "https://github.com/KaustubhMestri/Receipt-Text-Extraction-and-Parsing-Using-OCR",
        homepage: "",
        language: "Python",
        stargazers_count: 1,
        size: 14648
    },
    {
        name: "Termux-Test",
        description: "TERMUX DEPLOYMENT TESTING",
        html_url: "https://github.com/KaustubhMestri/Termux-Test",
        homepage: "",
        language: "Python",
        stargazers_count: 0,
        size: 5
    },
    {
        name: "portfolio2",
        description: "Gen AI Developer Portfolio",
        html_url: "https://github.com/KaustubhMestri/portfolio2",
        homepage: "https://kaustubhmestri.github.io/portfolio2/",
        language: "CSS",
        stargazers_count: 0,
        size: 0
    }
];

// Static Repo grid is now entirely in index.html


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

