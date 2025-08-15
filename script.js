// --- DOM Elements ---
const textToTypeElement = document.getElementById('text-to-type');
const inputArea = document.getElementById('input-area');
const timerElement = document.getElementById('timer');
const wpmElement = document.getElementById('wpm');
const accuracyElement = document.getElementById('accuracy');
const charsElement = document.getElementById('chars');
const caretElement = document.getElementById('caret');
const resultsModal = document.getElementById('results-modal');
const finalWpmElement = document.getElementById('final-wpm');
const finalAccuracyElement = document.getElementById('final-accuracy');
const restartBtn = document.getElementById('restart-btn');
const restartTestBtn = document.getElementById('restart-test-btn');
const timeSelectionContainer = document.getElementById('time-selection');
const timeButtons = document.querySelectorAll('.time-btn');
const textContainer = document.getElementById('text-container');

// --- State variables ---
let timer;
let testDuration = 60; // Default test duration
let timeLeft = testDuration;
let testInProgress = false;
let currentIndex = 0;
let correctChars = 0;
let typedChars = 0;
let currentText = '';

const textSamples = [
    "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet. Pack my box with five dozen liquor jugs.",
    "Never underestimate the power of a good book. Reading can transport you to new worlds and expand your understanding of the universe.",
    "Technology has revolutionized the way we live and work. From smartphones to artificial intelligence, the pace of innovation is accelerating.",
    "The sun always shines brightest after the rain. Remember that challenges are temporary and perseverance will lead to success.",
    "A journey of a thousand miles begins with a single step. Do not be afraid to start small, for every great achievement starts with a simple action.",
    "Creativity is intelligence having fun. Allow yourself to explore new ideas and think outside the box without fear of failure."
];

// --- Core Functions ---

/**
 * Initializes or resets the typing test.
 */
function startNewTest() {
    // Reset all state variables
    clearInterval(timer);
    testInProgress = false;
    timeLeft = testDuration;
    currentIndex = 0;
    correctChars = 0;
    typedChars = 0;
    
    // Update UI elements to their initial state
    timerElement.textContent = timeLeft;
    wpmElement.textContent = '0';
    accuracyElement.textContent = '100%';
    charsElement.textContent = '0/0';
    resultsModal.classList.add('hidden');
    inputArea.value = '';
    inputArea.disabled = false;

    // Load a new random text sample
    currentText = textSamples[Math.floor(Math.random() * textSamples.length)];
    textToTypeElement.innerHTML = ''; // Clear previous text
    // Create a span for each character for individual styling
    currentText.split('').forEach(char => {
        const span = document.createElement('span');
        span.textContent = char;
        span.classList.add('untyped');
        textToTypeElement.appendChild(span);
    });

    updateCaretPosition();
    focusInput();
}

/**
 * Starts the countdown timer for the test.
 */
function startTimer() {
    testInProgress = true;
    timer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        updateStats(); // Update stats every second
        if (timeLeft <= 0) {
            endTest();
        }
    }, 1000);
}

/**
 * Ends the test when time runs out or text is completed.
 */
function endTest() {
    clearInterval(timer);
    testInProgress = false;
    inputArea.disabled = true;
    
    // Calculate final WPM and Accuracy
    const finalWPM = calculateWPM();
    const finalAccuracy = calculateAccuracy();

    // Display the results in the modal
    finalWpmElement.textContent = finalWPM;
    finalAccuracyElement.textContent = `${finalAccuracy}%`;
    resultsModal.classList.remove('hidden');
}

/**
 * Handles the user's input, checks correctness, and updates the UI.
 */
function handleInput() {
    // Start the timer on the first keystroke
    if (!testInProgress && inputArea.value.length > 0) {
        startTimer();
    }

    typedChars = inputArea.value.length;
    const typedText = inputArea.value;
    const textSpans = textToTypeElement.querySelectorAll('span');
    correctChars = 0;

    // Loop through typed characters to apply styling and count correct ones
    for (let i = 0; i < typedText.length; i++) {
        if (textSpans[i] && typedText[i] === textSpans[i].textContent) {
            textSpans[i].className = 'correct';
            correctChars++;
        } else if (textSpans[i]) {
            textSpans[i].className = 'incorrect';
        }
    }
    
    // Mark the remaining, untyped characters
    for (let i = typedText.length; i < textSpans.length; i++) {
        textSpans[i].className = 'untyped';
    }
    
    currentIndex = typedChars;
    updateStats();
    updateCaretPosition();

    // End the test if the user types the entire text sample
    if (currentIndex === currentText.length) {
        endTest();
    }
}

// --- Helper & UI Functions ---

/**
 * Updates the WPM and Accuracy display during the test.
 */
function updateStats() {
    if (testInProgress || typedChars > 0) {
        wpmElement.textContent = calculateWPM();
        accuracyElement.textContent = `${calculateAccuracy()}%`;
    } else {
         wpmElement.textContent = '0';
         accuracyElement.textContent = '100%';
    }
    charsElement.textContent = `${correctChars}/${typedChars}`;
}

/**
 * Calculates the Words Per Minute (WPM).
 * Standard WPM calculation is (number of characters / 5) / time in minutes.
 */
function calculateWPM() {
    const timeElapsedInMinutes = (testDuration - timeLeft) / 60;
    if (timeElapsedInMinutes === 0) return 0;
    
    const netWPM = (correctChars / 5) / timeElapsedInMinutes;
    return Math.round(netWPM < 0 ? 0 : netWPM);
}

/**
 * Calculates the typing accuracy percentage.
 */
function calculateAccuracy() {
    if (typedChars === 0) return 100;
    
    const accuracy = Math.round((correctChars / typedChars) * 100);
    return isNaN(accuracy) ? 100 : accuracy;
}

/**
 * Moves the caret to the current typing position.
 */
function updateCaretPosition() {
    const textSpans = textToTypeElement.querySelectorAll('span');
    const containerRect = textContainer.getBoundingClientRect();

    if (currentIndex < textSpans.length) {
        const currentSpan = textSpans[currentIndex];
        const spanRect = currentSpan.getBoundingClientRect();
        // Position caret relative to the container
        caretElement.style.left = `${spanRect.left - containerRect.left}px`;
        caretElement.style.top = `${spanRect.top - containerRect.top + 4}px`;
    } else if (textSpans.length > 0) {
        // Place caret at the end of the text
        const lastSpan = textSpans[textSpans.length - 1];
        const spanRect = lastSpan.getBoundingClientRect();
        caretElement.style.left = `${spanRect.right - containerRect.left}px`;
        caretElement.style.top = `${spanRect.top - containerRect.top + 4}px`;
    }
}

/**
 * Sets focus to the hidden input area.
 */
function focusInput() {
    inputArea.focus();
}

/**
 * Handles clicks on the time selection buttons.
 */
function handleTimeSelection(e) {
    if (e.target.classList.contains('time-btn')) {
        // Get the selected time from the data attribute
        testDuration = parseInt(e.target.dataset.time, 10);
        
        // Update button styles to show the active time
        timeButtons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        // Start a new test with the new duration
        startNewTest();
    }
}

// --- Event Listeners ---
inputArea.addEventListener('input', handleInput);
restartBtn.addEventListener('click', startNewTest);
restartTestBtn.addEventListener('click', startNewTest);
timeSelectionContainer.addEventListener('click', handleTimeSelection);
textContainer.addEventListener('click', focusInput);

// Recalculate caret position on window resize
window.addEventListener('resize', updateCaretPosition);

// Initialize the test when the page loads
document.addEventListener('DOMContentLoaded', startNewTest);
