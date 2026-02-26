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

terminalInput.addEventListener('keydown', function(event) {
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
