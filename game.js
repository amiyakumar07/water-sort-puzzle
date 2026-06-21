/**
 * Water Sort Puzzle - Premium Edition
 * Core Game Logic, Procedural Level Generation, Animations & Synthesized Sound Effects
 */

// Sound Controller using the Web Audio API (Advanced Water Synthesis)
class SoundController {
    constructor() {
        this.ctx = null;
        this.muted = false;
        
        // Load mute setting from localStorage
        const storedMute = localStorage.getItem('water-sort-muted');
        if (storedMute !== null) {
            this.muted = storedMute === 'true';
        }
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        // Resume context if suspended (browser security policies)
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setMute(isMuted) {
        this.muted = isMuted;
        localStorage.setItem('water-sort-muted', isMuted);
    }

    playClick() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.05);
        
        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    playPour() {
        if (this.muted) return null;
        this.init();
        if (!this.ctx) return null;

        const ctx = this.ctx;
        let active = true;

        // 1. Splash White Noise Hiss
        const bufferSize = ctx.sampleRate * 1.0;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = noiseBuffer;
        noiseNode.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000, ctx.currentTime);
        filter.Q.setValueAtTime(2.5, ctx.currentTime);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.02, ctx.currentTime);

        noiseNode.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        noiseNode.start();

        // 2. Glug-Glug Bass Resonance
        const glugOsc = ctx.createOscillator();
        const glugGain = ctx.createGain();
        glugOsc.type = 'sine';
        glugOsc.frequency.setValueAtTime(95, ctx.currentTime);
        glugOsc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.5);

        glugGain.gain.setValueAtTime(0.05, ctx.currentTime);
        glugOsc.connect(glugGain);
        glugGain.connect(ctx.destination);
        glugOsc.start();

        const glugInterval = setInterval(() => {
            if (!active) return;
            const volume = 0.03 + Math.random() * 0.04;
            glugGain.gain.setValueAtTime(volume, ctx.currentTime);
        }, 130);

        // 3. High Drip Ripples
        const dripInterval = setInterval(() => {
            if (!active || this.muted || !ctx) return;
            
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sine';
            const freq = 650 + Math.random() * 800;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.8, ctx.currentTime + 0.04);
            
            gain.gain.setValueAtTime(0.015, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.04);
        }, 40);

        return {
            stop: () => {
                active = false;
                clearInterval(glugInterval);
                clearInterval(dripInterval);

                const fadeTime = ctx.currentTime + 0.15;
                noiseGain.gain.exponentialRampToValueAtTime(0.001, fadeTime);
                glugGain.gain.exponentialRampToValueAtTime(0.001, fadeTime);

                setTimeout(() => {
                    try {
                        noiseNode.stop();
                        glugOsc.stop();
                    } catch (e) {}
                }, 200);
            }
        };
    }

    playWin() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, index) => {
            const time = this.ctx.currentTime + index * 0.08;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, time);
            
            gain.gain.setValueAtTime(0.06, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.6);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(time);
            osc.stop(time + 0.6);
        });
    }

    playSparkle() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        // Two short pleasant high chime notes (C6, E6)
        const notes = [1046.50, 1318.51];
        notes.forEach((freq, index) => {
            const time = this.ctx.currentTime + index * 0.08;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, time);
            
            gain.gain.setValueAtTime(0.04, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(time);
            osc.stop(time + 0.25);
        });
    }
}

// Procedural Level Generator
class LevelGenerator {
    /**
     * Generates a random board state by reverse-shuffling from a solved state.
     * Guaranteed solvable.
     * @param {number} numColors - Number of filled tubes (colors)
     * @returns {number[][]} - Array of tubes, each being an array of color IDs (1 to numColors)
     */
    static generate(numColors) {
        const totalTubes = numColors + 2;
        let tubes = [];
        
        // 1. Initialize solved state
        for (let i = 0; i < numColors; i++) {
            tubes.push([i + 1, i + 1, i + 1, i + 1]);
        }
        for (let i = 0; i < 2; i++) {
            tubes.push([]);
        }

        let shuffleCount = 0;
        const maxShuffles = 35 + numColors * 8;
        let lastMove = null;

        // 2. Perform valid reverse-pours to shuffle
        for (let step = 0; step < maxShuffles * 3 && shuffleCount < maxShuffles; step++) {
            let possibleMoves = [];
            
            for (let src = 0; src < totalTubes; src++) {
                if (tubes[src].length === 0) continue;
                
                // Inspect top segment
                const topColor = tubes[src][tubes[src].length - 1];
                let topCount = 0;
                for (let idx = tubes[src].length - 1; idx >= 0; idx--) {
                    if (tubes[src][idx] === topColor) {
                        topCount++;
                    } else {
                        break;
                    }
                }
                
                // Check possible amounts to move (1 to topCount)
                for (let amount = 1; amount <= topCount; amount++) {
                    // Valid reverse pour MUST NOT expose a different color underneath.
                    // Meaning, we either empty the source tube completely, OR the remaining top is still the same color.
                    if (amount < tubes[src].length) {
                        const nextUnderneath = tubes[src][tubes[src].length - amount - 1];
                        if (nextUnderneath !== topColor) {
                            continue; // Invalid: would expose a different color
                        }
                    }
                    
                    for (let dst = 0; dst < totalTubes; dst++) {
                        if (src === dst) continue;
                        
                        // Destination must have space
                        if (tubes[dst].length + amount > 4) continue;
                        
                        // Avoid simple immediate backtracking
                        if (lastMove && lastMove.src === dst && lastMove.dst === src && lastMove.amount === amount) {
                            continue;
                        }
                        
                        possibleMoves.push({
                            src: src,
                            dst: dst,
                            amount: amount,
                            color: topColor
                        });
                    }
                }
            }
            
            if (possibleMoves.length === 0) break;
            
            // Pick random move
            const move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            
            // Execute reverse pour
            for (let a = 0; a < move.amount; a++) {
                tubes[move.src].pop();
                tubes[move.dst].push(move.color);
            }
            
            lastMove = move;
            shuffleCount++;
        }

        // Verify it isn't solved or extremely close to solved. If so, restart generation.
        let isSolved = true;
        for (let i = 0; i < totalTubes; i++) {
            if (tubes[i].length > 0 && !LevelGenerator.isTubeSolved(tubes[i])) {
                isSolved = false;
                break;
            }
        }
        if (isSolved) {
            return LevelGenerator.generate(numColors);
        }

        return tubes;
    }

    static isTubeSolved(tube) {
        if (tube.length === 0) return true;
        if (tube.length < 4) return false;
        const first = tube[0];
        return tube.every(c => c === first);
    }
}

// Game Manager
class WaterSortGame {
    constructor() {
        this.level = 1;
        this.highestLevel = 1;
        this.tubes = [];
        this.initialTubesState = []; // Saved state to restart level
        this.undoStack = [];
        this.selectedTubeIndex = null;
        this.movesCount = 0;
        this.isAnimating = false;
        this.animatingTubes = new Set();
        this.activePoursCount = 0;
        
        this.sounds = new SoundController();
        
        this.loadProgress();
        this.setupDOMReferences();
        this.bindEvents();
        
        // Trigger Loading Screen animation
        this.startLoadingScreen();
    }

    loadProgress() {
        const storedHighest = localStorage.getItem('water-sort-highest-level');
        if (storedHighest) {
            this.highestLevel = parseInt(storedHighest, 10);
        }
        const storedLevel = localStorage.getItem('water-sort-level');
        if (storedLevel) {
            this.level = parseInt(storedLevel, 10);
        } else {
            this.level = this.highestLevel;
        }
    }

    saveProgress() {
        localStorage.setItem('water-sort-level', this.level);
        localStorage.setItem('water-sort-highest-level', this.highestLevel);
    }

    setupDOMReferences() {
        // Screen divisions & loading nodes
        this.screenLoading = document.getElementById('screen-loading');
        this.loadingBar = document.getElementById('loading-bar');
        
        this.screenHome = document.getElementById('screen-home');
        this.screenGame = document.getElementById('screen-game');
        
        // Consent Modal nodes
        this.modalConsent = document.getElementById('modal-consent');
        this.checkboxConsent = document.getElementById('checkbox-consent');
        this.btnConsentAccept = document.getElementById('btn-consent-accept');

        // Home screen items
        this.btnPlayGame = document.getElementById('btn-play-game');
        this.levelGrid = document.getElementById('level-grid');
        this.btnHomeInfo = document.getElementById('btn-home-info');
        this.btnHomeSound = document.getElementById('btn-home-sound');
        this.svgHomeSoundOn = document.getElementById('svg-home-sound-on');
        this.svgHomeSoundOff = document.getElementById('svg-home-sound-off');

        // Game screen HUD
        this.btnBackHome = document.getElementById('btn-back-home');
        this.levelNumber = document.getElementById('level-number');
        this.tubesGrid = document.getElementById('tubes-grid');
        this.btnGameSound = document.getElementById('btn-game-sound');
        this.svgGameSoundOn = document.getElementById('svg-game-sound-on');
        this.svgGameSoundOff = document.getElementById('svg-game-sound-off');
        
        this.btnUndo = document.getElementById('btn-undo');
        this.btnRestart = document.getElementById('btn-restart');
        this.stuckWarning = document.getElementById('stuck-warning');
        
        this.modalHowto = document.getElementById('modal-howto');
        this.btnCloseHowto = document.getElementById('btn-close-howto');
        
        this.modalWin = document.getElementById('modal-win');
        this.btnNextLevel = document.getElementById('btn-next-level');
        this.winMovesCount = document.getElementById('win-moves-count');
        this.winLevelVal = document.getElementById('win-level-val');
        
        // Setup initial sound button UI
        this.updateSoundButtonUI();
    }

    bindEvents() {
        // Terms Consent event binding
        if (this.checkboxConsent && this.btnConsentAccept) {
            this.checkboxConsent.addEventListener('change', (e) => {
                this.btnConsentAccept.disabled = !e.target.checked;
            });
            this.btnConsentAccept.addEventListener('click', () => {
                localStorage.setItem('water-sort-consent-accepted', 'true');
                if (this.modalConsent) this.modalConsent.classList.add('hidden');
                this.showHomeScreen(true);
            });
        }

        // Home Menu Navigation
        this.btnPlayGame.addEventListener('click', () => {
            this.level = this.highestLevel;
            this.showGameScreen();
        });
        this.btnBackHome.addEventListener('click', () => {
            this.showHomeScreen();
        });

        // Sound controllers
        this.btnHomeSound.addEventListener('click', () => this.toggleSound());
        this.btnGameSound.addEventListener('click', () => this.toggleSound());

        // Game HUD controls
        this.btnUndo.addEventListener('click', () => this.undo());
        this.btnRestart.addEventListener('click', () => this.restartLevel());
        
        // Info & Win Dialogs
        this.btnHomeInfo.addEventListener('click', () => this.showTutorialModal());
        this.btnCloseHowto.addEventListener('click', () => this.hideTutorialModal());
        this.btnNextLevel.addEventListener('click', () => this.nextLevel());
        
        // Show tutorial on first load (only if consent has been accepted already)
        if (localStorage.getItem('water-sort-consent-accepted') === 'true' && 
            !localStorage.getItem('water-sort-tutorial-shown')) {
            this.showTutorialModal();
        }
    }

    startLoadingScreen() {
        // Trigger tube liquid filling up
        setTimeout(() => {
            if (this.loadingBar) this.loadingBar.style.height = '100%';
        }, 100);

        // After filling finishes, transition to Home or Consent
        setTimeout(() => {
            if (this.screenLoading) {
                this.screenLoading.style.opacity = '0';
                setTimeout(() => {
                    this.screenLoading.classList.add('hidden');
                    this.checkConsentAndStart();
                }, 400); // Wait for opacity transition
            } else {
                this.checkConsentAndStart();
            }
        }, 2000); // 2 second loading delay
    }

    checkConsentAndStart() {
        const consentAccepted = localStorage.getItem('water-sort-consent-accepted') === 'true';
        if (consentAccepted) {
            this.showHomeScreen(false);
            // Show tutorial modal if not shown yet
            if (!localStorage.getItem('water-sort-tutorial-shown')) {
                this.showTutorialModal();
            }
        } else {
            if (this.modalConsent) {
                this.modalConsent.classList.remove('hidden');
            }
        }
    }

    showHomeScreen(playSound = true) {
        if (playSound) this.sounds.playClick();
        this.screenGame.classList.add('hidden');
        this.screenHome.classList.remove('hidden');
        this.renderLevelGrid();
        
        // Generate background rising bubble particles
        this.createHomeBubbles();
    }

    showGameScreen() {
        this.sounds.playClick();
        this.screenHome.classList.add('hidden');
        this.screenGame.classList.remove('hidden');
        
        // Empty background bubbles to save CPU resources while playing
        const container = document.getElementById('home-bg-bubbles');
        if (container) container.innerHTML = '';
        
        this.initLevel();
    }

    createHomeBubbles() {
        const container = document.getElementById('home-bg-bubbles');
        if (!container) return;
        container.innerHTML = '';
        const bubbleCount = 18;
        for (let i = 0; i < bubbleCount; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'bubble-bg';
            bubble.style.left = `${Math.random() * 100}%`;
            const size = Math.random() * 18 + 6;
            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;
            bubble.style.animationDelay = `${Math.random() * 7}s`;
            bubble.style.animationDuration = `${Math.random() * 4 + 6}s`;
            container.appendChild(bubble);
        }
    }

    renderLevelGrid() {
        this.levelGrid.innerHTML = '';
        const totalLevelsToShow = 24;
        for (let L = 1; L <= totalLevelsToShow; L++) {
            const card = document.createElement('div');
            card.className = 'level-card';
            card.textContent = L;

            if (L < this.highestLevel) {
                // Completed level (green theme)
                card.classList.add('completed');
                card.addEventListener('click', () => {
                    this.level = L;
                    this.showGameScreen();
                });
            } else if (L === this.highestLevel) {
                // Active level (glowing blue theme)
                card.classList.add('active');
                card.addEventListener('click', () => {
                    this.level = L;
                    this.showGameScreen();
                });
            } else {
                // Locked level (disabled theme)
                card.classList.add('locked');
                card.addEventListener('click', () => {
                    this.sounds.playClick(); // standard tick
                    card.classList.add('shake');
                    setTimeout(() => card.classList.remove('shake'), 300);
                });
            }
            this.levelGrid.appendChild(card);
        }
    }

    showTutorialModal() {
        this.modalHowto.classList.remove('hidden');
        this.sounds.playClick();
    }

    hideTutorialModal() {
        this.modalHowto.classList.add('hidden');
        localStorage.setItem('water-sort-tutorial-shown', 'true');
        this.sounds.playClick();
    }

    toggleSound() {
        this.sounds.setMute(!this.sounds.muted);
        this.updateSoundButtonUI();
        this.sounds.playClick();
    }

    updateSoundButtonUI() {
        if (this.sounds.muted) {
            this.svgHomeSoundOn.classList.add('hidden');
            this.svgHomeSoundOff.classList.remove('hidden');
            this.svgGameSoundOn.classList.add('hidden');
            this.svgGameSoundOff.classList.remove('hidden');
        } else {
            this.svgHomeSoundOn.classList.remove('hidden');
            this.svgHomeSoundOff.classList.add('hidden');
            this.svgGameSoundOn.classList.remove('hidden');
            this.svgGameSoundOff.classList.add('hidden');
        }
    }

    initLevel() {
        this.isAnimating = false;
        this.animatingTubes = new Set();
        this.activePoursCount = 0;
        this.selectedTubeIndex = null;
        this.movesCount = 0;
        this.undoStack = [];
        this.btnUndo.disabled = true;
        this.stuckWarning.classList.add('hidden');
        this.modalWin.classList.add('hidden');
        
        this.levelNumber.textContent = this.level;
        
        // Level Difficulty Scaling:
        // Level 1-2: 4 colors
        // Level 3-4: 5 colors
        // Level 5-6: 6 colors
        // Level 7-8: 7 colors
        // Level 9-10: 8 colors
        // Level 11-12: 9 colors
        // Level 13+: 10 colors (maximum)
        const numColors = Math.min(4 + Math.floor((this.level - 1) / 2), 10);
        
        // Generate solvable layout
        this.tubes = LevelGenerator.generate(numColors);
        
        // Save initial state for restarting
        this.initialTubesState = this.cloneState(this.tubes);
        
        // Scan for completed tubes to track sorted state
        this.completedTubes = [];
        this.tubes.forEach((t, idx) => {
            if (t.length === 4 && t.every(c => c === t[0])) {
                this.completedTubes.push(idx);
            }
        });
        
        this.renderTubes();
    }

    cloneState(state) {
        return state.map(tube => [...tube]);
    }

    renderTubes() {
        this.tubesGrid.innerHTML = '';
        
        // Determine grid layout columns depending on count for optimal display
        const total = this.tubes.length;
        if (total <= 6) {
            this.tubesGrid.style.maxWidth = '380px';
        } else {
            this.tubesGrid.style.maxWidth = '500px';
        }

        this.tubes.forEach((tube, idx) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'tube-wrapper';
            wrapper.id = `tube-wrapper-${idx}`;
            
            // Add selected visual flag if selected
            if (this.selectedTubeIndex === idx) {
                wrapper.classList.add('selected');
            }

            const tubeEl = document.createElement('div');
            tubeEl.className = 'tube';
            tubeEl.id = `tube-${idx}`;

            const overlay = document.createElement('div');
            overlay.className = 'tube-glass-overlay';

            const liquidContainer = document.createElement('div');
            liquidContainer.className = 'liquid-container';
            liquidContainer.id = `liquid-container-${idx}`;

            // Add colored liquid segments
            tube.forEach(colorId => {
                const segment = document.createElement('div');
                segment.className = `liquid-segment color-${colorId}`;
                segment.style.height = '25%'; // 4 segments max, so 25% each
                liquidContainer.appendChild(segment);
            });

            tubeEl.appendChild(overlay);
            tubeEl.appendChild(liquidContainer);
            wrapper.appendChild(tubeEl);
            
            // Event listener for user interaction
            wrapper.addEventListener('click', () => this.handleTubeClick(idx));
            
            this.tubesGrid.appendChild(wrapper);
        });
    }

    handleTubeClick(idx) {
        // Block clicks if the clicked tube is currently animating
        if (this.animatingTubes && this.animatingTubes.has(idx)) return;
        // Limit to max 2 concurrent moves
        if (this.activePoursCount >= 2) return;
        
        this.sounds.playClick();

        const selectTube = (index) => {
            // Deselect previous
            if (this.selectedTubeIndex !== null) {
                const prevWrapper = document.getElementById(`tube-wrapper-${this.selectedTubeIndex}`);
                if (prevWrapper) prevWrapper.classList.remove('selected');
            }
            // Select new
            this.selectedTubeIndex = index;
            if (index !== null) {
                const newWrapper = document.getElementById(`tube-wrapper-${index}`);
                if (newWrapper) newWrapper.classList.add('selected');
            }
        };

        if (this.selectedTubeIndex === null) {
            // Select source tube
            if (this.tubes[idx].length === 0) return; // Cannot select empty tube
            selectTube(idx);
        } else {
            const srcIdx = this.selectedTubeIndex;
            const dstIdx = idx;
            
            if (srcIdx === dstIdx) {
                // Deselect
                selectTube(null);
                return;
            }

            if (this.isValidMove(srcIdx, dstIdx)) {
                // Deselect before pouring so selection outline disappears
                selectTube(null);
                // Perform the pour
                this.pour(srcIdx, dstIdx);
            } else {
                // Re-select if clicking another valid source tube (and not animating), otherwise deselect
                if (this.tubes[dstIdx].length > 0 && !(this.animatingTubes && this.animatingTubes.has(dstIdx))) {
                    selectTube(dstIdx);
                } else {
                    selectTube(null);
                }
            }
        }
    }

    isValidMove(srcIdx, dstIdx) {
        const src = this.tubes[srcIdx];
        const dst = this.tubes[dstIdx];

        if (src.length === 0) return false;
        if (dst.length >= 4) return false;

        const srcTopColor = src[src.length - 1];
        const dstTopColor = dst[dst.length - 1];

        // Pouring is valid if destination is empty or matches the source top color
        return dst.length === 0 || dstTopColor === srcTopColor;
    }

    pour(srcIdx, dstIdx) {
        const src = this.tubes[srcIdx];
        const dst = this.tubes[dstIdx];

        const colorId = src[src.length - 1];
        
        // Count how many matching units are at the top of the source tube
        let srcTopCount = 0;
        for (let i = src.length - 1; i >= 0; i--) {
            if (src[i] === colorId) {
                srcTopCount++;
            } else {
                break;
            }
        }

        const dstSpace = 4 - dst.length;
        const pourAmount = Math.min(srcTopCount, dstSpace);

        if (pourAmount <= 0) return;

        // Add to active animation lists
        this.animatingTubes.add(srcIdx);
        this.animatingTubes.add(dstIdx);
        this.activePoursCount++;
        this.isAnimating = true;

        this.selectedTubeIndex = null;
        
        // Save state to Undo stack before moving
        this.undoStack.push(this.cloneState(this.tubes));
        
        // Disable Undo & Restart during active animations to prevent state corruption
        this.btnUndo.disabled = true;
        this.btnRestart.disabled = true;

        // Update physical model immediately for logical moves
        for (let i = 0; i < pourAmount; i++) {
            this.tubes[srcIdx].pop();
            this.tubes[dstIdx].push(colorId);
        }

        // Perform visual animation
        this.animatePour(srcIdx, dstIdx, colorId, pourAmount, () => {
            this.activePoursCount--;
            this.animatingTubes.delete(srcIdx);
            this.animatingTubes.delete(dstIdx);

            this.movesCount++;

            // Check if any tube just completed
            this.tubes.forEach((t, idx) => {
                if (t.length === 4 && t.every(c => c === t[0])) {
                    if (!this.completedTubes.includes(idx)) {
                        this.completedTubes.push(idx);
                        
                        // Play pleasant chime chime sound
                        this.sounds.playSparkle();
                        
                        // Trigger tube flashing animation
                        const tubeEl = document.getElementById(`tube-wrapper-${idx}`);
                        if (tubeEl) {
                            tubeEl.classList.add('tube-flash');
                            const colorHue = this.getHueForColor(t[0]);
                            tubeEl.style.color = `hsl(${colorHue}, 85%, 55%)`;
                            
                            setTimeout(() => {
                                tubeEl.classList.remove('tube-flash');
                                tubeEl.style.color = '';
                            }, 700);
                        }
                    }
                }
            });

            this.renderTubes();

            // Only run final game checks and restore controls when ALL animations are complete
            if (this.activePoursCount === 0) {
                this.isAnimating = false;
                this.btnUndo.disabled = this.undoStack.length === 0;
                this.btnRestart.disabled = false;

                // Check post-move game rules
                if (this.checkWin()) {
                    this.handleWin();
                } else if (this.checkStuck()) {
                    this.stuckWarning.classList.remove('hidden');
                } else {
                    this.stuckWarning.classList.add('hidden');
                }
            }
        });
    }

    getHueForColor(colorId) {
        const hues = {
            1: 354,  // Red
            2: 200,  // Blue
            3: 142,  // Green
            4: 48,   // Yellow
            5: 271,  // Purple
            6: 24,   // Orange
            7: 328,  // Pink
            8: 180,  // Cyan
            9: 85,   // Lime
            10: 15   // Brown
        };
        return hues[colorId] || 200;
    }

    animatePour(srcIdx, dstIdx, colorId, pourAmount, onComplete) {
        const srcTube = document.getElementById(`tube-${srcIdx}`);
        const dstTube = document.getElementById(`tube-${dstIdx}`);
        const gameArea = document.querySelector('.game-area');
        
        const srcRect = srcTube.getBoundingClientRect();
        const dstRect = dstTube.getBoundingClientRect();
        const areaRect = gameArea.getBoundingClientRect();

        const dx = dstRect.left - srcRect.left;
        let pivotX, pivotY, targetX, targetY, rotation;

        // Make sure the pouring bottle floats on top of other elements
        srcTube.style.zIndex = '99';

        // Determine pivot and rotation based on direction
        if (dx >= 0) {
            pivotX = srcRect.right;
            pivotY = srcRect.top;
            targetX = dstRect.left + 15;
            targetY = dstRect.top - 14;
            rotation = 80;
            srcTube.style.transformOrigin = 'top right';
        } else {
            pivotX = srcRect.left;
            pivotY = srcRect.top;
            targetX = dstRect.right - 15;
            targetY = dstRect.top - 14;
            rotation = -80;
            srcTube.style.transformOrigin = 'top left';
        }

        const tx = targetX - pivotX;
        const ty = targetY - pivotY;

        // PHASE 1: Lift & Glide (Move to target position, lifted slightly, no rotation)
        srcTube.style.transition = 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)';
        srcTube.style.transform = `translate(${tx}px, ${ty - 25}px) rotate(0deg)`;
        
        // Wait for glide to complete
        setTimeout(() => {
            // PHASE 2: Tilt & Pour (Rotate the bottle to start pouring)
            srcTube.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            srcTube.style.transform = `translate(${tx}px, ${ty}px) rotate(${rotation}deg)`;
            
            // Start Web Audio pouring sound (low glugs, hiss, and drops!)
            const soundPour = this.sounds.playPour();

            // Trigger stream and liquid levels 150ms into the tilt (when lip is low enough)
            setTimeout(() => {
                const stream = document.createElement('div');
                stream.className = `pour-stream color-${colorId}`;
                
                const streamLeft = targetX - areaRect.left - 4; // center 8px stream
                const streamTop = targetY - areaRect.top;
                
                const dstLiquidContainer = document.getElementById(`liquid-container-${dstIdx}`);
                const currentSegments = this.tubes[dstIdx].length - pourAmount; // FIXED: get original segment height
                const segmentPixelHeight = dstRect.height / 4;
                const dstLiquidHeight = currentSegments * segmentPixelHeight;
                const streamHeight = (dstRect.bottom - areaRect.top) - dstLiquidHeight - streamTop;

                stream.style.left = `${streamLeft}px`;
                stream.style.top = `${streamTop}px`;
                stream.style.height = '0px';
                gameArea.appendChild(stream);

                // Create splash ripple
                const splash = document.createElement('div');
                splash.className = `pour-splash color-${colorId}`;
                splash.style.left = `${streamLeft + 4}px`;
                splash.style.top = `${streamTop + streamHeight}px`;
                gameArea.appendChild(splash);

                // Force reflow and grow stream
                stream.getBoundingClientRect();
                stream.style.height = `${streamHeight}px`;

                // Animate source liquid levels shrinking
                const srcContainer = document.getElementById(`liquid-container-${srcIdx}`);
                const srcSegments = Array.from(srcContainer.querySelectorAll('.liquid-segment'));
                const shrinkSegments = srcSegments.slice(srcSegments.length - pourAmount);
                shrinkSegments.forEach(el => {
                    el.style.height = '0%';
                });

                // Animate destination liquid levels growing
                const growSegments = [];
                for (let i = 0; i < pourAmount; i++) {
                    const seg = document.createElement('div');
                    seg.className = `liquid-segment color-${colorId}`;
                    seg.style.height = '0%';
                    dstLiquidContainer.appendChild(seg);
                    growSegments.push(seg);
                }

                // Force reflow
                dstLiquidContainer.getBoundingClientRect();
                growSegments.forEach(el => {
                    el.style.height = '25%';
                });

                // Wait for pour flow duration (500ms)
                setTimeout(() => {
                    // PHASE 3: Fade out stream & splash
                    stream.style.opacity = '0';
                    splash.style.opacity = '0';
                    
                    // Trigger dynamic settling slosh animation on receiving tube
                    const dstWrapper = document.getElementById(`tube-wrapper-${dstIdx}`);
                    if (dstWrapper) {
                        dstWrapper.classList.add('tube-slosh');
                        setTimeout(() => {
                            dstWrapper.classList.remove('tube-slosh');
                        }, 800);
                    }

                    setTimeout(() => {
                        stream.remove();
                        splash.remove();

                        // PHASE 4: Rotate back to vertical (lifted slightly)
                        srcTube.style.transition = 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)';
                        srcTube.style.transform = `translate(${tx}px, ${ty - 25}px) rotate(0deg)`;

                        if (soundPour) soundPour.stop();

                        // Wait for rotate-back to complete
                        setTimeout(() => {
                            // PHASE 5: Glide back to home position
                            srcTube.style.transform = `translate(0, -25px) rotate(0deg)`;

                            // Wait for glide-back to complete
                            setTimeout(() => {
                                // PHASE 6: Settle down to default position
                                srcTube.style.transition = 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)';
                                srcTube.style.transform = '';
                                
                                // Restore original z-index
                                srcTube.style.zIndex = '';

                                setTimeout(() => {
                                    onComplete();
                                }, 150); // Settle down time
                            }, 350); // Glide back time
                        }, 350); // Rotate back time
                    }, 150); // Fadeout time
                }, 500); // Pouring flow time
            }, 200); // Wait 200ms into tilt before stream starts
        }, 350); // Glide to target time
    }

    undo() {
        if (this.isAnimating || this.undoStack.length === 0) return;

        this.sounds.playClick();
        this.tubes = this.undoStack.pop();
        this.movesCount--;
        
        if (this.undoStack.length === 0) {
            this.btnUndo.disabled = true;
        }

        this.selectedTubeIndex = null;
        this.stuckWarning.classList.add('hidden');
        this.renderTubes();
    }

    restartLevel() {
        if (this.isAnimating) return;

        this.sounds.playClick();
        this.tubes = this.cloneState(this.initialTubesState);
        this.movesCount = 0;
        this.undoStack = [];
        this.btnUndo.disabled = true;
        this.selectedTubeIndex = null;
        this.stuckWarning.classList.add('hidden');
        this.renderTubes();
    }

    checkWin() {
        return this.tubes.every(tube => {
            if (tube.length === 0) return true;
            if (tube.length < 4) return false;
            const color = tube[0];
            return tube.every(c => c === color);
        });
    }

    handleWin() {
        this.sounds.playWin();
        
        // Populate stats on modal
        this.winMovesCount.textContent = this.movesCount;
        this.winLevelVal.textContent = this.level;
        
        this.modalWin.classList.remove('hidden');
        
        this.triggerWinConfetti();
    }

    triggerWinConfetti() {
        const container = document.getElementById('confetti-container');
        container.innerHTML = '';
        
        const colors = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#06b6d4'];
        const particleCount = 75;

        for (let i = 0; i < particleCount; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = `${Math.random() * 100}%`;
            piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            // Random shapes and rotations
            piece.style.width = `${Math.random() * 8 + 6}px`;
            piece.style.height = `${Math.random() * 10 + 8}px`;
            piece.style.transform = `rotate(${Math.random() * 360}deg)`;
            
            // Random animation delay & duration
            piece.style.animationDelay = `${Math.random() * 1.5}s`;
            piece.style.animationDuration = `${Math.random() * 2 + 1.5}s`;
            
            container.appendChild(piece);
        }
    }

    nextLevel() {
        this.sounds.playClick();
        // If we beat our highest unlocked level, unlock the next one!
        if (this.level === this.highestLevel) {
            this.highestLevel++;
        }
        this.level++;
        this.saveProgress();
        this.initLevel();
    }

    checkStuck() {
        const total = this.tubes.length;
        
        // Scan all tubes to see if any valid and helpful move exists
        for (let i = 0; i < total; i++) {
            const src = this.tubes[i];
            if (src.length === 0) continue;

            // A tube is fully sorted/solved, don't touch it.
            if (src.length === 4 && src.every(c => c === src[0])) continue;

            const srcTopColor = src[src.length - 1];

            for (let j = 0; j < total; j++) {
                if (i === j) continue;
                
                const dst = this.tubes[j];
                if (dst.length >= 4) continue; // No space

                // If destination is not empty, check color match
                if (dst.length > 0) {
                    const dstTopColor = dst[dst.length - 1];
                    if (dstTopColor === srcTopColor) {
                        return false; // Found a valid combining move!
                    }
                } else {
                    // If destination is empty:
                    // Only moving here is helpful if the source has multiple colors.
                    // If the source is just single-colored, transferring it to another empty tube is just a redundant swap.
                    const isSingleColored = src.every(c => c === srcTopColor);
                    if (!isSingleColored) {
                        return false; // Found a helpful move to clear the top color!
                    }
                }
            }
        }
        
        return true; // No useful legal moves remain
    }
}

// Instantiate game on load
window.addEventListener('DOMContentLoaded', () => {
    window.game = new WaterSortGame();
});
