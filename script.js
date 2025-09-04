document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const card = document.querySelector('.stopwatch-card');
    const timeDisplay = document.getElementById('time-display');
    const msDisplay = document.getElementById('ms-display');
    const startStopButton = document.getElementById('start-stop-button');
    const resetButton = document.getElementById('reset-button');
    const lapButton = document.getElementById('lap-button');
    const lapsList = document.getElementById('laps-list');
    const exportButton = document.getElementById('export-laps-button');
    const originalTitle = document.title;

    // State Variables
    let timerState = 'stopped'; // can be 'stopped', 'running', 'paused'
    let startTime = 0;
    let elapsedTime = 0;
    let intervalId;
    let laps = [];
    
    // --- Core Functions ---

    function tick() {
        const now = Date.now();
        elapsedTime = now - startTime;
        updateTimerDisplay(elapsedTime);
        document.title = formatTime(elapsedTime).full; // Update tab title
    }

    function startTimer() {
        if (timerState === 'running') return;

        startTime = Date.now() - elapsedTime; // Adjusts for paused time
        intervalId = setInterval(tick, 10);
        timerState = 'running';
        updateUI();
    }

    function pauseTimer() {
        if (timerState !== 'running') return;
        
        clearInterval(intervalId);
        timerState = 'paused';
        updateUI();
        document.title = "Paused | " + formatTime(elapsedTime).full;
    }

    function resetTimer() {
        clearInterval(intervalId);
        
        elapsedTime = 0;
        laps = [];
        timerState = 'stopped';
        
        updateTimerDisplay(0);
        updateLapsDisplay();
        updateUI();
        document.title = originalTitle;
    }

    function addLap() {
        if (timerState !== 'running') return;
        
        const lastLapTime = laps.length > 0 ? laps.reduce((acc, lap) => acc + lap.lapTime, 0) : 0;
        const currentLapTime = elapsedTime - lastLapTime;

        laps.push({
            lapTime: currentLapTime,
            totalTime: elapsedTime
        });

        updateLapsDisplay();
    }
    
    // --- UI Update Functions ---

    function updateUI() {
        // Update main card state classes
        card.classList.toggle('is-running', timerState === 'running');
        card.classList.toggle('is-paused', timerState === 'paused');

        // Update button text
        if (timerState === 'running') {
            startStopButton.textContent = 'Pause';
        } else {
            startStopButton.textContent = 'Start';
        }
    }

    function updateTimerDisplay(ms) {
        const formatted = formatTime(ms);
        timeDisplay.textContent = formatted.main;
        msDisplay.textContent = `.${formatted.ms}`;
    }
    
    function updateLapsDisplay() {
        lapsList.innerHTML = '';
        if (laps.length === 0) return;

        laps.slice().reverse().forEach((lap, index) => {
            const li = document.createElement('li');
            const lapNumber = laps.length - index;
            const lapTimeFormatted = formatTime(lap.lapTime).full;

            li.innerHTML = `
                <span class="lap-number">Lap ${lapNumber}</span>
                <span class="lap-time">${lapTimeFormatted}</span>
            `;
            lapsList.appendChild(li);
        });
    }

    // --- Helper & Feature Functions ---
    
    function formatTime(ms) {
        const date = new Date(ms);
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');
        const centiseconds = String(Math.floor(date.getUTCMilliseconds() / 10)).padStart(2, '0');
        
        return {
            main: `${hours}:${minutes}:${seconds}`,
            ms: centiseconds,
            full: `${hours}:${minutes}:${seconds}.${centiseconds}`
        };
    }
    
    function exportLaps() {
        if (laps.length === 0) {
            alert('There are no laps to export.');
            return;
        }
        
        let fileContent = 'Lap Number,Lap Time,Total Time\n';
        laps.forEach((lap, index) => {
            const lapNum = index + 1;
            const lapTime = formatTime(lap.lapTime).full;
            const totalTime = formatTime(lap.totalTime).full;
            fileContent += `${lapNum},${lapTime},${totalTime}\n`;
        });
        
        const blob = new Blob([fileContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'stopwatch_laps.csv';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // --- Event Listeners ---
    
    startStopButton.addEventListener('click', () => {
        if (timerState === 'running') {
            pauseTimer();
        } else {
            startTimer();
        }
    });

    resetButton.addEventListener('click', resetTimer);
    lapButton.addEventListener('click', addLap);
    exportButton.addEventListener('click', exportLaps);

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (key === 's') {
            startStopButton.click(); // Programmatically click the button
        } else if (key === 'r') {
            resetButton.click();
        } else if (key === 'l') {
            lapButton.click();
        }
    });

    // --- Initial State ---
    updateUI();
});