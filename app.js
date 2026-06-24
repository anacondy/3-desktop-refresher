// ============================================================
//  Retro Desktop Refresher - Renderer logic
//  PHASE 2 (H1): all JS externalized (no inline <script>),
//  inline onclick handlers replaced with addEventListener so a
//  strict CSP can be applied without 'unsafe-inline'.
// ============================================================

// --- VARIABLES ---
const terminal = document.getElementById('terminal-content');
const statusText = document.getElementById('status-text');
const timeText = document.getElementById('time-time');
const progFill = document.getElementById('prog-fill');
const counterDisplay = document.getElementById('refresh-counter');
const btnAuto = document.getElementById('btn-auto');

let refreshCount = 0;
let autoEnabled = true;
let autoInterval = null;

// --- LOGGING ---
function log(msg, type = '') {
    const div = document.createElement('div');
    div.className = `log-entry ${type}`;
    div.textContent = `> ${msg}`;
    terminal.appendChild(div);
    terminal.scrollTop = terminal.scrollHeight;
}

// --- REFRESH LOGIC ---
async function executeRefresh() {
    // 1. VISUAL WARNING (The Cross-Check)
    log("PREPARE FOR REFRESH...", "alert");
    statusText.textContent = "EXECUTING SHELL COMMAND...";

    // Fill progress bar quickly to show activity
    progFill.style.width = "100%";

    // 2. Wait 500ms so user can look at desktop
    setTimeout(async () => {
        if (window.sys) {
            // 3. TRIGGER THE WINDOWS API
            await window.sys.triggerRefresh();

            // 4. UPDATE STATS
            refreshCount++;
            counterDisplay.textContent = `REFRESHES: ${refreshCount}`;
            log(`SUCCESS: Desktop Environment Refreshed. (Count: ${refreshCount})`, "success");

            // 5. Reset UI
            setTimeout(() => {
                progFill.style.width = "0%";
                statusText.textContent = autoEnabled ? "WAITING FOR CYCLE..." : "SYSTEM IDLE";
            }, 1000);
        } else {
            log("ERROR: Not in Electron Mode.", "alert");
        }
    }, 500);
}

// --- CONTROLS ---
function forceRefresh() {
    log("USER: Manual Override Initiated.");
    executeRefresh();
}

function toggleAuto() {
    autoEnabled = !autoEnabled;
    btnAuto.textContent = autoEnabled ? "[AUTO: ON]" : "[AUTO: OFF]";

    if (autoEnabled) {
        log("SYS: Automation Resumed.");
        startAutoLoop();
    } else {
        log("SYS: Automation Paused.");
        clearInterval(autoInterval);
    }
}

function startAutoLoop() {
    clearInterval(autoInterval);
    autoInterval = setInterval(() => {
        if (autoEnabled) {
            log("AUTO: Timer Triggered.");
            executeRefresh();
        }
    }, 10000); // 10 seconds
}

// --- BUTTON WIRING (replaces inline onclick handlers) ---
btnAuto.addEventListener('click', toggleAuto);
document.getElementById('btn-refresh').addEventListener('click', forceRefresh);
document.getElementById('btn-min').addEventListener('click', customMinimize);
document.getElementById('btn-max').addEventListener('click', () => {
    if (window.sys) window.sys.maxApp();
});
document.getElementById('btn-close').addEventListener('click', customClose);

// --- CLOCK ---
setInterval(() => {
    const now = new Date();
    timeText.textContent = now.toLocaleTimeString();
}, 1000);

// --- PARTICLE SYSTEM (Optimized for 60+ FPS and High Refresh Rate Displays) ---
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d', {
    alpha: true,
    desynchronized: true, // Enable async rendering for better performance
    willReadFrequently: false
});
let particles = [];
let animationFrameId;
let lastFrameTime = performance.now();
let fps = 0;
let frameCount = 0;
let fpsUpdateTime = performance.now();

// Detect low-end devices and adjust particle count
const isLowEndDevice = () => {
    const memory = navigator.deviceMemory; // GB of RAM (if available)
    const cores = navigator.hardwareConcurrency || 2;
    return (memory && memory < 4) || cores < 4;
};

// Adaptive particle count based on device capability
const getOptimalParticleCount = () => {
    if (isLowEndDevice()) {
        return 30; // Fewer particles for low-end devices
    }
    return 60; // Full particle count for capable devices
};

function resize() {
    const rect = document.getElementById('crt-container').getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
}
window.addEventListener('resize', resize);

class Particle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.alpha = Math.random() * 0.5 + 0.1;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
    }
    draw() {
        ctx.fillStyle = `rgba(255, 176, 0, ${this.alpha})`;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

function initParticles() {
    resize();
    const particleCount = getOptimalParticleCount();
    particles = Array.from({
        length: particleCount
    }, () => new Particle());

    function animate(currentTime) {
        // Calculate FPS for monitoring
        frameCount++;
        const deltaTime = currentTime - lastFrameTime;

        if (currentTime - fpsUpdateTime >= 1000) {
            fps = Math.round(frameCount * 1000 / (currentTime - fpsUpdateTime));
            frameCount = 0;
            fpsUpdateTime = currentTime;
            // Log FPS occasionally for debugging (can be removed in production)
            if (fps < 55) {
                console.warn(`Low FPS detected: ${fps}`);
            }
        }

        lastFrameTime = currentTime;

        // Efficient batch rendering
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and draw all particles
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }

        animationFrameId = requestAnimationFrame(animate);
    }

    animate(performance.now());
}

// Cleanup on unload
window.addEventListener('beforeunload', () => {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
});

// --- WINDOW CONTROL ANIMATIONS ---
function customMinimize() {
    document.body.classList.add('minimizing');
    setTimeout(() => {
        if (window.sys) window.sys.minApp();
    }, 300);
}

function customClose() {
    document.body.classList.add('closing');
    setTimeout(() => {
        if (window.sys) window.sys.closeApp();
    }, 250);
}

// Window maximization visual adjustments
if (window.sys) {
    if (sys.onMaximized) {
        sys.onMaximized(() => {
            document.getElementById('crt-container').classList.add('maximized');
            document.body.classList.add('is-maximized');
        });
    }
    if (sys.onUnmaximized) {
        sys.onUnmaximized(() => {
            document.getElementById('crt-container').classList.remove('maximized');
            document.body.classList.remove('is-maximized');
        });
    }
    if (sys.onRestored) {
        sys.onRestored(() => document.body.classList.remove('minimizing', 'closing'));
    }
}

// --- BOOT SEQUENCE ---
setTimeout(() => {
    log("SYSTEM BOOT SEQUENCE...");
    log("LOADING AUTOMATION MODULES...");
    setTimeout(() => {
        log("READY. WATCH DESKTOP ICONS FOR BLINK.", "alert");
        initParticles();
        startAutoLoop();
    }, 1500);
}, 500);
