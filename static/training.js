// Get parameters from URL
const urlParams = new URLSearchParams(window.location.search);
const selectedWord = urlParams.get('word');

// Get session data from parent window (passed via localStorage)
let sessionData = JSON.parse(localStorage.getItem('currentSessionData') || '{}');

// Translation mapping for folder names
const folderTranslations = {
    // Main categories
    'clothes': 'الملابس',
    'vegetables': 'الخضروات',
    'animals': 'الحيوانات',
    
    // Clothes subcategories
    'shorts': 'شورت',
    'tshirts': 'قمصان',
    'pants': 'بنطال',
    'dress': 'فستان',
    'hats': 'قبعات',
    'jackets': 'سترات',
    'sweaters': 'كنزات',
    
    // Vegetables subcategories
    'potatoes': 'بطاطس',
    'tomatoes': 'طماطم',
    'carrots': 'جزر',
    
    // Animals subcategories
    'dogs': 'كلاب',
    'cats': 'قطط',
    'birds': 'طيور'
};

function getArabicName(englishName) {
    return folderTranslations[englishName] || englishName;
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', function() {
    // Log to debug
    console.log('sessionData:', sessionData);
    
    // Use the subcategory from sessionData if selectedWord is not provided
    const word = selectedWord || sessionData?.tertiary || sessionData?.item || sessionData?.dimension;
    
    if (word) {
        // Initialize progress at 5%
        updateProgress(5);
        startTrainingSession();
    } else {
        // If no word found, show error and provide redirect button
        document.getElementById('statusText').textContent = 'خطأ: يرجى اختيار العنصر المراد تدريبه';
        const statusEl = document.getElementById('statusText');
        statusEl.style.marginTop = '20px';
        const backBtn = document.createElement('button');
        backBtn.textContent = 'العودة';
        backBtn.style.marginTop = '20px';
        backBtn.style.padding = '10px 20px';
        backBtn.style.fontSize = '16px';
        backBtn.style.cursor = 'pointer';
        backBtn.onclick = () => window.history.back();
        statusEl.parentElement.insertBefore(backBtn, statusEl.nextSibling);
    }
});

function updateProgress(percentage) {
    const progressBar = document.getElementById('progressBar');
    const progressStar = document.getElementById('progressStar');
    if (progressBar) {
        progressBar.style.width = percentage + '%';
    }
    if (progressStar) {
        // Move star from right to left as progress increases, slightly ahead of progress bar
        const threshold = 1; // Star leads progress bar by 3%
        const leftPosition = 100 - percentage - threshold;
        progressStar.style.left = leftPosition + '%';
    }
}

function startTrainingSession() {
    const statusEl = document.getElementById('statusText');
    const word = selectedWord;
    let count = 0;
    const totalRepetitions = 6;
    const delayBetweenRepetitions = 500; // 3 seconds
    
    // Build audio path: /static/items/{category}/{subcategory}/{subcategory}.m4a
    const audioPath = `/static/items/${sessionData.item}/${sessionData.tertiary}/${sessionData.tertiary}.m4a`;
    
    function playAudio() {
        const audio = new Audio(audioPath);
        audio.play().catch(err => {
            console.log('Audio play error:', err);
            statusEl.textContent = `خطأ في تشغيل الصوت`;
        });
    }
    
    // Start playing the word 6 times
    function playWordRepetition() {
        if (count < totalRepetitions) {
            count++;
            statusEl.textContent = `${count} من ${totalRepetitions}`;
            statusEl.className = 'status-text speaking';
            
            // Play the audio
            playAudio();
            
            // Schedule next repetition
            setTimeout(playWordRepetition, delayBetweenRepetitions);
        } else {
            // All repetitions done, show image
            showImage();
        }
    }
    
    function showImage() {
        const imageContainer = document.getElementById('imageContainer');
        const itemImage = document.getElementById('itemImage');
        const statusEl = document.getElementById('statusText');
        
        // Build image path with random color variant
        const colors = ['blue', 'black', 'red', 'green', 'yellow'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const imagePath = `/static/items/${sessionData.item}/${sessionData.tertiary}/${sessionData.tertiary}_${randomColor}_1.png`;
        
        itemImage.src = imagePath;
        imageContainer.style.display = 'flex';
        
        statusEl.className = 'status-text showing';
        
        // Add callback for image load error
        itemImage.onerror = function() {
            statusEl.className = 'status-text';
        };
        
        // Start second phase: play audio 8 times while image is shown
        setTimeout(() => {
            playSecondPhase();
        }, 1500);
    }
    
    function playSecondPhase() {
        let count2 = 0;
        const totalRepetitions2 = 8;
        
        function playRepetition2() {
            if (count2 < totalRepetitions2) {
                count2++;
                statusEl.textContent = `${count2} من ${totalRepetitions2}`;
                statusEl.className = 'status-text speaking';
                
                // Play the audio
                playAudio();
                
                // Schedule next repetition
                setTimeout(playRepetition2, delayBetweenRepetitions);
            } else {
                // All done - skip to Activity 6 for debugging
                updateProgress(76); // Jump to speech recognition
                statusEl.className = 'status-text';
                
                setTimeout(() => {
                    startSpeechRecognition();
                }, 1500);
            }
        }
        
        playRepetition2();
    }
    
    // Start the session
    playWordRepetition();
}

function saveSessionToDatabase(scoreInfo = '') {
    // Update progress to 100% when saving
    updateProgress(100);
    
    // Build title and description from selections
    let title = sessionData.dimension;
    let description = '';
    
    if (sessionData.item) {
        title += ' - ' + sessionData.item;
        description = 'البند: ' + sessionData.item;
    }
    
    if (sessionData.tertiary) {
        description += (description ? '\n' : '') + 'التفاصيل: ' + sessionData.tertiary;
    }
    
    // Add score to description if provided
    if (scoreInfo) {
        description += (description ? '\n' : '') + scoreInfo;
    }
    
    fetch('/api/training/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            parent_id: sessionData.parent_id,
            title: title,
            description: description,
            duration: null
        })
    })
    .then(response => response.json())
    .then(data => {
        // Clear session data from localStorage
        localStorage.removeItem('currentSessionData');
        
        // Go back after 2 seconds
        setTimeout(() => {
            window.history.back();
        }, 2000);
    })
    .catch(error => {
        console.error('Error saving session:', error);
        window.history.back();
    });
}

function startVisualExercise() {
    // Hide listening phase and show visual phase
    document.getElementById('listeningPhase').style.display = 'none';
    document.getElementById('visualPhase').style.display = 'block';
    
    // Initialize visual exercise state or track activity number
    if (!window.visualExerciseState) {
        window.visualExerciseState = {
            currentRound: 1,
            totalRounds: 1,  // 1 round for development mode
            correctClicks: 0,
            roundAttempts: [],
            allOtherImages: [],
            activity: 2  // Start at activity 2 (Activity 1 is listening)
        };
    } else {
        // Moving to next activity, increment activity counter
        window.visualExerciseState.activity += 1;
        window.visualExerciseState.currentRound = 1;
        window.visualExerciseState.correctClicks = 0;
        window.visualExerciseState.roundAttempts = [];
    }
    
    // Set activity class on visual phase
    document.getElementById('visualPhase').classList.remove('activity-2', 'activity-3');
    document.getElementById('visualPhase').classList.add(`activity-${window.visualExerciseState.activity}`);
    
    // Build API path to fetch images
    const category = sessionData.item;
    const subcategory = sessionData.tertiary;
    
    // Fetch correct images and distractor images in parallel
    Promise.all([
        fetch(`/api/images/${category}/${subcategory}`).then(r => r.json()),
        fetch(`/api/distractors/${category}/${subcategory}`).then(r => r.json())
    ])
    .then(([imagesData, distractorsData]) => {
        if (imagesData.status === 'success' && imagesData.images) {
            window.visualExerciseState.allImages = imagesData.images;
        }
        if (distractorsData.status === 'success' && distractorsData.distractors) {
            window.visualExerciseState.allOtherImages = distractorsData.distractors;
        }
        
        // Start first round
        loadVisualRound();
    })
    .catch(error => {
        console.error('Error fetching images:', error);
        loadVisualRound();
    });
}

function loadVisualRound() {
    const state = window.visualExerciseState;
    const category = sessionData.item;
    const subcategory = sessionData.tertiary;
    
    // Hide title
    document.querySelector('.visual-title').style.display = 'none';
    
    // Clear feedback
    document.getElementById('feedbackText').textContent = '';
    document.getElementById('feedbackText').style.display = 'none';
    document.getElementById('feedbackText').className = 'feedback-text';
    
    // Reset round attempt counter
    state.currentRoundAttempts = 0;
    
    // Get 2 random other images
    const otherImages = [];
    const availableDistractors = [...(state.allOtherImages || [])];
    
    for (let i = 0; i < 2 && availableDistractors.length > 0; i++) {
        const randomIdx = Math.floor(Math.random() * availableDistractors.length);
        otherImages.push(availableDistractors[randomIdx]);
        availableDistractors.splice(randomIdx, 1);
    }
    
    // If not enough distractors, reuse from available pool
    if (otherImages.length < 2 && state.allOtherImages && state.allOtherImages.length > 0) {
        while (otherImages.length < 2) {
            const randomIdx = Math.floor(Math.random() * state.allOtherImages.length);
            otherImages.push(state.allOtherImages[randomIdx]);
        }
    }
    
    // Randomly position the correct answer (0, 1, or 2), ensuring it's different from previous round
    let correctPosition = Math.floor(Math.random() * 3);
    // Ensure position changes from previous round
    if (state.previousCorrectPosition !== undefined) {
        while (correctPosition === state.previousCorrectPosition) {
            correctPosition = Math.floor(Math.random() * 3);
        }
    }
    state.previousCorrectPosition = correctPosition;
    const imageData = [{}, {}, {}];
    
    // Select correct image from current subcategory
    let correctImageName = (window.visualExerciseState.allImages || [])[0] || '';
    let targetColor = null;
    let distractorColor = null;
    
    if (state.activity === 2 || state.activity === 3) {
        const allImages = (window.visualExerciseState.allImages || []);
        if (allImages.length > 0) {
            correctImageName = allImages[Math.floor(Math.random() * allImages.length)];
        }
    } else if (state.activity === 4) {
        // Activity 4: Color-based matching
        const colors = ['blue', 'black', 'red', 'green', 'yellow'];
        targetColor = colors[Math.floor(Math.random() * colors.length)];
        // Distractor color should be different from target
        distractorColor = colors.filter(c => c !== targetColor)[Math.floor(Math.random() * (colors.length - 1))];
        
        const allImages = (window.visualExerciseState.allImages || []);
        if (allImages.length > 0) {
            // Get base name from API response (e.g., "pants_blue_1" -> extract "pants")
            const targetImageFull = allImages[Math.floor(Math.random() * allImages.length)];
            // Extract base name by removing color and number suffix (e.g., "pants_blue_1" -> "pants")
            const baseName = targetImageFull.split('_').slice(0, -2).join('_');
            correctImageName = `${baseName}_${targetColor}_1`;
        }
    }
    
    imageData[correctPosition] = {
        name: correctImageName,
        subcategory: subcategory,
        isCorrect: true
    };
    
    // Fill other positions with distractor images
    let otherIdx = 0;
    for (let i = 0; i < 3; i++) {
        if (i !== correctPosition) {
            const distractor = otherImages[otherIdx] || { name: correctImageName, subcategory: subcategory };
            let distractorName = distractor.name;
            
            // For Activity 4, apply the distractor color
            if (state.activity === 4 && distractorColor) {
                // Extract base name by removing color and number suffix
                const baseName = distractor.name.split('_').slice(0, -2).join('_');
                distractorName = `${baseName}_${distractorColor}_1`;
            }
            
            imageData[i] = {
                name: distractorName,
                subcategory: distractor.subcategory,
                isCorrect: false
            };
            otherIdx++;
        }
    }
    
    // Display images
    imageData.forEach((data, index) => {
        const imgPath = `/static/items/${category}/${data.subcategory}/${data.name}.png`;
        document.getElementById(`img-${index}`).src = imgPath;
        document.getElementById(`image-${index}`).dataset.correct = data.isCorrect;
        document.getElementById(`image-${index}`).classList.remove('correct', 'incorrect', 'correct-answer');
        
        if (data.isCorrect) {
            document.getElementById(`image-${index}`).classList.add('correct-answer');
            
            // A
            // ctivity 2: Target image larger (center)
            if (state.activity === 2) {
                const el = document.getElementById(`image-${index}`);
                el.style.width = '20vw';
                el.style.height = '20vw';
                el.style.transform = 'scale(1.5)';
            }
            // Activity 3: All equal size, target shifted down
            else if (state.activity === 3) {
                const el = document.getElementById(`image-${index}`);
                el.style.width = '20vw';
                el.style.height = '20vw';
                el.style.transform = 'translateY(70px)';
            }
            // Activity 4: All equal size, no shift, color-based matching
            else if (state.activity === 4) {
                const el = document.getElementById(`image-${index}`);
                el.style.width = '20vw';
                el.style.height = '20vw';
                el.style.transform = 'none';
            }
        } else {
            const el = document.getElementById(`image-${index}`);
            el.style.width = '20vw';
            el.style.height = '20vw';
            el.style.transform = 'none';
        }
        
        document.getElementById(`image-${index}`).style.pointerEvents = 'auto';
        document.getElementById(`image-${index}`).style.opacity = '1';
    });
}

function selectImage(index) {
    const state = window.visualExerciseState;
    const imageOption = document.getElementById(`image-${index}`);
    const isCorrect = imageOption.dataset.correct === 'true';
    const feedbackEl = document.getElementById('feedbackText');
    
    // Increment attempt counter for this round
    state.currentRoundAttempts++;
    
    if (isCorrect) {
        state.correctClicks++;
        state.roundAttempts.push(state.currentRoundAttempts);
        
        imageOption.classList.add('correct');
        feedbackEl.textContent = '';
        feedbackEl.style.display = 'none';
        feedbackEl.className = 'feedback-text success';
        
        // Disable all image clicks
        document.querySelectorAll('.image-option').forEach(el => {
            el.style.pointerEvents = 'none';
            el.style.opacity = '0.6';
        });
        imageOption.style.opacity = '1';
        
        // Move to next round or end
        setTimeout(() => {
            if (state.currentRound < state.totalRounds) {
                state.currentRound++;
                // Distribute 35-95% across activities 2-6
                // Activity 2: 35-42% (7%), Activity 3: 42-49% (7%), Activity 4: 49-56% (7%), Activity 5: 56-75% (19%), Activity 6: 75-95% (20%)
                let activityStart, activityEnd;
                if (state.activity === 2) {
                    activityStart = 35;
                    activityEnd = 42;
                } else if (state.activity === 3) {
                    activityStart = 42;
                    activityEnd = 49;
                } else if (state.activity === 4) {
                    activityStart = 49;
                    activityEnd = 56;
                } else if (state.activity === 5) {
                    activityStart = 56;
                    activityEnd = 76;
                } else if (state.activity === 6) {
                    activityStart = 76;
                    activityEnd = 95;
                }
                const progressPercent = activityStart + ((activityEnd - activityStart) * state.currentRound / state.totalRounds);
                updateProgress(Math.min(progressPercent, 95));
                loadVisualRound();
            } else {
                endVisualExercise();
            }
        }, 1500);
    } else {
        imageOption.classList.add('incorrect');
        feedbackEl.textContent = '';
        feedbackEl.style.display = 'none';
        feedbackEl.className = 'feedback-text error';
        
        setTimeout(() => {
            imageOption.classList.remove('incorrect');
        }, 600);
    }
}

function endVisualExercise() {
    const state = window.visualExerciseState;
    
    // If activity 2 is done, transition to activity 3
    if (state.activity === 2) {
        // Store activity 2 scores
        if (!window.accumulatedScores) {
            window.accumulatedScores = {
                activity1: { correctClicks: 5, roundAttempts: [1, 1, 1, 1, 1] }
            };
        }
        window.accumulatedScores.activity2 = { correctClicks: state.correctClicks, roundAttempts: [...state.roundAttempts] };
        
        // Reset for activity 3 and start it
        document.getElementById('visualPhase').style.display = 'none';
        startVisualExercise();
        document.getElementById('visualPhase').style.display = 'block';
        return;
    }
    
    // If activity 3 is done, transition to activity 4 (Color-based matching visual)
    if (state.activity === 3) {
        // Store activity 3 scores
        if (!window.accumulatedScores) {
            window.accumulatedScores = {};
        }
        window.accumulatedScores.activity3 = { correctClicks: state.correctClicks, roundAttempts: [...state.roundAttempts] };
        
        // Reset for activity 4 (color-based matching) and start it
        document.getElementById('visualPhase').style.display = 'none';
        startVisualExercise();
        document.getElementById('visualPhase').style.display = 'block';
        return;
    }
    
    // If activity 4 is done, transition to activity 5 (Wheel Game)
    if (state.activity === 4) {
        // Store activity 4 scores
        if (!window.accumulatedScores) {
            window.accumulatedScores = {};
        }
        window.accumulatedScores.activity4 = { correctClicks: state.correctClicks, roundAttempts: [...state.roundAttempts] };
        
        // Hide visual phase and start wheel game
        document.getElementById('visualPhase').style.display = 'none';
        startWheelGame();
        return;
    }
    
    // If activity 5 (Wheel Game) is done, transition to activity 6 (Speech Recognition)
    if (state.activity === 5) {
        // Store activity 5 scores
        if (!window.accumulatedScores) {
            window.accumulatedScores = {};
        }
        window.accumulatedScores.activity5 = { correctClicks: state.correctClicks, roundAttempts: [...state.roundAttempts] };
        
        // Hide wheel game and start speech recognition
        if (document.getElementById('wheelGame')) {
            document.getElementById('wheelGame').style.display = 'none';
        }
        startSpeechRecognition();
        return;
    }
}

function startWheelGame() {
    // Create wheel game phase if it doesn't exist
    if (!document.getElementById('wheelGame')) {
        const wheelGameDiv = document.createElement('div');
        wheelGameDiv.id = 'wheelGame';
        wheelGameDiv.style.display = 'none';
        document.body.appendChild(wheelGameDiv);
    }
    
    document.getElementById('wheelGame').style.display = 'block';
    
    // Initialize wheel game state
    if (!window.wheelGameState) {
        window.wheelGameState = {
            currentRound: 1,
            totalRounds: 1,
            correctClicks: 0,
            roundAttempts: [],
            activity: 5
        };
    }
    
    // Fetch target images and distractors for wheel game
    const category = sessionData.item;
    const subcategory = sessionData.tertiary;
    
    // Fetch both target images and distractors
    Promise.all([
        fetch(`/api/images/${category}/${subcategory}`).then(r => r.json()).catch(() => ({ status: 'failed' })),
        fetch(`/api/distractors/${category}/${subcategory}`).then(r => r.json()).catch(() => ({ status: 'failed' }))
    ])
    .then(([targetData, distractorData]) => {
        if (targetData.status === 'success' && targetData.images) {
            window.wheelGameState.targetImages = targetData.images;
        } else {
            window.wheelGameState.targetImages = [];
        }
        
        if (distractorData.status === 'success' && distractorData.distractors) {
            window.wheelGameState.distractorImages = distractorData.distractors;
        } else {
            // If distractors not available, use alternative approach
            window.wheelGameState.distractorImages = [];
            // Try to fetch all available images as fallback
            return fetch(`/api/all_items/${category}`).then(r => r.json()).catch(() => ({ status: 'failed' }));
        }
    })
    .then((allData) => {
        if (allData && allData.status === 'success' && allData.images && !window.wheelGameState.distractorImages.length) {
            window.wheelGameState.distractorImages = allData.images.filter(img => img.subcategory !== subcategory);
        }
        loadWheelGameRound();
    })
    .catch(error => {
        console.error('Error fetching images:', error);
        loadWheelGameRound();
    });
}

function loadWheelGameRound() {
    const state = window.wheelGameState;
    const category = sessionData.item;
    const subcategory = sessionData.tertiary;
    
    state.currentRoundAttempts = 0;
    
    // Pick 1 target dress image
    const targetImages = state.targetImages || [];
    const distractorImages = state.distractorImages || [];
    
    let targetImage = null;
    if (targetImages.length > 0) {
        targetImage = targetImages[Math.floor(Math.random() * targetImages.length)];
    }
    
    // Pick 5 distractor images (different subcategories)
    const images = [];
    if (targetImage) {
        images.push({ name: targetImage, subcategory: subcategory, isTarget: true });
    }
    
    for (let i = 0; i < 5 && distractorImages.length > 0; i++) {
        const randomIdx = Math.floor(Math.random() * distractorImages.length);
        const distractor = distractorImages[randomIdx];
        // Distractor is either a string or object with name and subcategory
        if (typeof distractor === 'object') {
            images.push({ name: distractor.name, subcategory: distractor.subcategory, isTarget: false });
        } else {
            images.push({ name: distractor, subcategory: 'other', isTarget: false });
        }
    }
    
    // Ensure we have 6 images (reuse distractors if necessary)
    while (images.length < 6 && distractorImages.length > 0) {
        const randomIdx = Math.floor(Math.random() * distractorImages.length);
        const distractor = distractorImages[randomIdx];
        if (typeof distractor === 'object') {
            images.push({ name: distractor.name, subcategory: distractor.subcategory, isTarget: false });
        } else {
            images.push({ name: distractor, subcategory: 'other', isTarget: false });
        }
    }
    
    // If still not enough images, reuse target image as distractors (fallback when no distractors available)
    while (images.length < 6 && targetImage) {
        images.push({ name: targetImage, subcategory: subcategory, isTarget: false });
    }
    
    // Shuffle all images and ensure target position is different from previous round
    let shuffledImages;
    let targetPosition;
    
    do {
        shuffledImages = images.sort(() => 0.5 - Math.random());
        targetPosition = shuffledImages.findIndex(img => img.isTarget);
    } while (state.previousTargetPosition !== undefined && targetPosition === state.previousTargetPosition);
    
    state.targetPosition = targetPosition;
    state.previousTargetPosition = targetPosition;
    
    // Render wheel game UI
    const wheelGameDiv = document.getElementById('wheelGame');
    wheelGameDiv.innerHTML = `
        <div class="wheel-game-container">
            <div class="wheel-images">
                ${shuffledImages.map((img, idx) => `
                    <div class="wheel-image-slot" onclick="selectWheelImage(${idx})">
                        <img src="/static/items/${category}/${img.subcategory}/${img.name}.png" alt="image">
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Update progress
    const progressPercent = 56 + (state.currentRound * 20 / state.totalRounds);
    updateProgress(Math.min(progressPercent, 76));
}

function selectWheelImage(index) {
    const state = window.wheelGameState;
    state.currentRoundAttempts++;
    
    if (index === state.targetPosition) {
        state.correctClicks++;
        state.roundAttempts.push(state.currentRoundAttempts);
        
        // Highlight correct image
        const slots = document.querySelectorAll('.wheel-image-slot');
        slots[index].style.border = '3px solid green';
        
        setTimeout(() => {
            if (state.currentRound < state.totalRounds) {
                state.currentRound++;
                loadWheelGameRound();
            } else {
                endWheelGame();
            }
        }, 1500);
    } else {
        // Highlight incorrect image but don't shuffle - keep same layout
        const slots = document.querySelectorAll('.wheel-image-slot');
        slots[index].style.border = '3px solid red';
        
        setTimeout(() => {
            slots[index].style.border = '';  // Remove red border after timeout
        }, 1000);
    }
}

function endWheelGame() {
    const state = window.wheelGameState;
    
    // Store wheel game scores
    if (!window.accumulatedScores) {
        window.accumulatedScores = {};
    }
    window.accumulatedScores.activity4 = { correctClicks: state.correctClicks, roundAttempts: [...state.roundAttempts] };
    
    // Hide wheel game and start speech recognition
    document.getElementById('wheelGame').style.display = 'none';
    startSpeechRecognition();
}

function startSpeechRecognition() {
    // Create speech phase if it doesn't exist
    if (!document.getElementById('speechPhase')) {
        const speechDiv = document.createElement('div');
        speechDiv.id = 'speechPhase';
        speechDiv.style.display = 'none';
        document.body.appendChild(speechDiv);
    }
    
    document.getElementById('speechPhase').style.display = 'block';
    
    // Initialize speech recognition state
    if (!window.speechState) {
        window.speechState = {
            currentRound: 1,
            totalRounds: 1,
            correctClicks: 0,
            roundAttempts: [],
            activity: 6
        };
    }
    
    // Fetch images for speech recognition
    const category = sessionData.item;
    const subcategory = sessionData.tertiary;
    
    fetch(`/api/images/${category}/${subcategory}`)
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success' && data.images) {
            window.speechState.allImages = data.images;
        }
        loadSpeechRound();
    })
    .catch(error => {
        console.error('Error fetching images:', error);
        loadSpeechRound();
    });
}

function loadSpeechRound() {
    const state = window.speechState;
    const category = sessionData.item;
    const subcategory = sessionData.tertiary;
    
    state.currentRoundAttempts = 0;
    
    // Select a random target image
    const allImages = state.allImages || [];
    const targetImage = allImages.length > 0 ? allImages[Math.floor(Math.random() * allImages.length)] : '';
    
    state.currentTarget = targetImage;
    state.targetWord = subcategory; // The word user should say
    
    // Render speech recognition UI
    const speechDiv = document.getElementById('speechPhase');
    speechDiv.innerHTML = `
        <div class="speech-container">
            <div class="speech-image">
                <img src="/static/items/${category}/${subcategory}/${targetImage}.png" alt="target">
            </div>
            <div id="speechResult"></div>
        </div>
    `;
    
    // Update progress
    const progressPercent = 75 + (state.currentRound * 20 / state.totalRounds);
    updateProgress(Math.min(progressPercent, 95));
    
    // Auto-start recording
    setTimeout(() => {
        autoStartRecording();
    }, 300);
}

// Global audio management
let currentAudio = null;

function stopAllAudio() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
}

function autoStartRecording() {
    const state = window.speechState;
    state.currentRoundAttempts++;
    
    // Stop any previous audio
    stopAllAudio();
    
    // Play the question audio first
    const audioPath = `/static/what_is_this.m4a`;
    currentAudio = new Audio(audioPath);
    currentAudio.play().catch(() => {
        console.log('Could not play question audio');
    });
    
    // Start recording after audio finishes + 0.5 second delay
    const audioLength = 1.5; // Approximate length of "what is this" audio
    setTimeout(() => {
        stopAllAudio();  // Stop the question audio before recording
        recordAndCompareAudio();
    }, (audioLength * 1000) + 500); // Audio duration + 0.5 second delay
}

function startRecording() {
    const state = window.speechState;
    state.currentRoundAttempts++;
    
    const speechDiv = document.getElementById('speechPhase');
    const resultDiv = speechDiv.querySelector('#speechResult');
    
    // Stop any previous audio
    stopAllAudio();
    
    // Play the question audio first
    const audioPath = `/static/what_is_this.m4a`;
    currentAudio = new Audio(audioPath);
    currentAudio.play().catch(() => {
        console.log('Could not play question audio');
    });
    
    // Start recording after audio finishes + 0.5 second delay
    const audioLength = 1.5; // Approximate length of "what is this" audio
    setTimeout(() => {
        stopAllAudio();  // Stop the question audio before recording
        recordAndCompareAudio();
    }, (audioLength * 1000) + 500); // Audio duration + 0.5 second delay
}

function recordAndCompareAudio() {
    const state = window.speechState;
    const resultDiv = document.getElementById('speechPhase').querySelector('#speechResult');
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // Audio recording not supported - auto-complete this round
        resultDiv.innerHTML = '<p class="correct-speech">✓ تم تخطي التسجيل</p>';
        state.correctClicks++;
        state.roundAttempts.push(1);
        
        setTimeout(() => {
            if (state.currentRound < state.totalRounds) {
                state.currentRound++;
                loadSpeechRound();
            } else {
                endSpeechRecognition();
            }
        }, 1200);
        return;
    }
    
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            const mediaRecorder = new MediaRecorder(stream);
            const audioChunks = [];
            
            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };
            
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                stream.getTracks().forEach(track => track.stop());
                
                // Play back recorded audio for verification
                const audioUrl = URL.createObjectURL(audioBlob);
                currentAudio = new Audio(audioUrl);
                resultDiv.innerHTML = '<p class="status-speech">تشغيل التسجيل...</p>';
                currentAudio.play();
                
                // After playback finishes, send for comparison
                currentAudio.onended = () => {
                    stopAllAudio();  // Clean up
                    compareAudio(audioBlob);
                };
                
                // Timeout: if playback takes too long, compare anyway
                setTimeout(() => {
                    if (currentAudio && (currentAudio.paused || currentAudio.ended)) {
                        stopAllAudio();  // Clean up
                        compareAudio(audioBlob);
                    }
                }, 5000);
            };
            
            // Record for 3 seconds
            mediaRecorder.start();
            setTimeout(() => {
                mediaRecorder.stop();
            }, 3000);
        })
        .catch(error => {
            console.error('Microphone access error:', error);
            // Fallback: auto-complete if permission denied
            resultDiv.innerHTML = '<p class="correct-speech">✓ تم تخطي التسجيل</p>';
            state.correctClicks++;
            state.roundAttempts.push(1);
            
            setTimeout(() => {
                if (state.currentRound < state.totalRounds) {
                    state.currentRound++;
                    loadSpeechRound();
                } else {
                    endSpeechRecognition();
                }
            }, 1200);
        });
}

function compareAudio(audioBlob) {
    const state = window.speechState;
    const resultDiv = document.getElementById('speechPhase').querySelector('#speechResult');
    const recordBtn = document.getElementById('startRecordingBtn');
    
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('category', sessionData.item);
    formData.append('subcategory', sessionData.tertiary);
    
    fetch('/api/compare_audio', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Check if match confidence is above threshold (70%)
        const isCorrect = data.match && data.confidence > 70;
        
        // Build detailed metrics string with safe defaults
        const confidence = Math.round(data.confidence || 0);
        const mfcc = (data.mfcc_similarity !== undefined ? data.mfcc_similarity.toFixed(2) : 'N/A');
        const refDur = (data.ref_duration !== undefined ? data.ref_duration.toFixed(2) : 'N/A');
        const recDur = (data.rec_duration !== undefined ? data.rec_duration.toFixed(2) : 'N/A');
        const metrics = `(${confidence}% | MFCC: ${mfcc} | Ref: ${refDur}s | Rec: ${recDur}s)`;
        
        if (isCorrect) {
            state.correctClicks++;
            state.roundAttempts.push(state.currentRoundAttempts);
            resultDiv.innerHTML = `<p class="correct-speech">صحيح! ✓ ${metrics}</p>`;
            
            setTimeout(() => {
                if (state.currentRound < state.totalRounds) {
                    state.currentRound++;
                    loadSpeechRound();
                } else {
                    endSpeechRecognition();
                }
            }, 1500);
        } else {
            resultDiv.innerHTML = `<p class="incorrect-speech">حاول مجددا ${metrics}</p>`;
            
            setTimeout(() => {
                loadSpeechRound();
            }, 1500);
        }
    })
    .catch(error => {
        console.error('Error comparing audio:', error);
        resultDiv.innerHTML = '<p class="incorrect-speech">حدث خطأ في المقارنة</p>';
        setTimeout(() => {
            loadSpeechRound();
        }, 1500);
    });
}

function endSpeechRecognition() {
    const state = window.speechState;
    
    // Store speech recognition scores
    if (!window.accumulatedScores) {
        window.accumulatedScores = {};
    }
    window.accumulatedScores.activity5 = { correctClicks: state.correctClicks, roundAttempts: [...state.roundAttempts] };
    
    // Hide speech phase and show results
    document.getElementById('speechPhase').style.display = 'none';
    
    // Build results summary for all six activities
    const activity1Correct = window.accumulatedScores.activity1?.correctClicks || 0;
    const activity1Attempts = window.accumulatedScores.activity1?.roundAttempts || [];
    const activity2Correct = window.accumulatedScores.activity2?.correctClicks || 0;
    const activity2Attempts = window.accumulatedScores.activity2?.roundAttempts || [];
    const activity3Correct = window.accumulatedScores.activity3?.correctClicks || 0;
    const activity3Attempts = window.accumulatedScores.activity3?.roundAttempts || [];
    const activity4Correct = window.accumulatedScores.activity4?.correctClicks || 0;
    const activity4Attempts = window.accumulatedScores.activity4?.roundAttempts || [];
    const activity5Correct = window.accumulatedScores.activity5?.correctClicks || 0;
    const activity5Attempts = window.accumulatedScores.activity5?.roundAttempts || [];
    const activity6Correct = window.accumulatedScores.activity6?.correctClicks || 0;
    const activity6Attempts = window.accumulatedScores.activity6?.roundAttempts || [];
    const totalCorrect = activity1Correct + activity2Correct + activity3Correct + activity4Correct + activity5Correct + activity6Correct;
    const totalRounds = 6; // Activity 1: 1, Activity 2: 1, Activity 3: 1, Activity 4: 1, Activity 5: 1, Activity 6: 1 (dev mode)
    
    // Show results
    const resultsHtml = `
        <div class="results-container">
            <h1>انتهت الجلسة!</h1>
            <div class="score-display">
                <p class="score-text">النتيجة النهائية</p>
                <p class="score-number">${totalCorrect} / ${totalRounds}</p>
            </div>
        </div>
    `;
    
    document.getElementById('listeningPhase').innerHTML = resultsHtml;
    document.getElementById('listeningPhase').style.display = 'block';
    
    // Build description with all attempts
    let allAttemptsText = `النشاط الأول (الاستماع):\nانتهى تلقائيا\n`;
    allAttemptsText += `\nالنشاط الثاني (التعرف البصري - المستوى الأول):\n`;
    activity2Attempts.forEach((attempts, idx) => {
        allAttemptsText += `الجولة ${idx + 1}: ${attempts} محاولة\n`;
    });
    allAttemptsText += `\nالنشاط الثالث (التعرف البصري - المستوى الثاني):\n`;
    activity3Attempts.forEach((attempts, idx) => {
        allAttemptsText += `الجولة ${idx + 1}: ${attempts} محاولة\n`;
    });
    allAttemptsText += `\nالنشاط الرابع (التعرف البصري - تطابق الألوان):\n`;
    activity4Attempts.forEach((attempts, idx) => {
        allAttemptsText += `الجولة ${idx + 1}: ${attempts} محاولة\n`;
    });
    allAttemptsText += `\nالنشاط الخامس (لعبة العجلة):\n`;
    activity5Attempts.forEach((attempts, idx) => {
        allAttemptsText += `الجولة ${idx + 1}: ${attempts} محاولة\n`;
    });
    allAttemptsText += `\nالنشاط السادس (التعرف الصوتي):\n`;
    activity6Attempts.forEach((attempts, idx) => {
        allAttemptsText += `الجولة ${idx + 1}: ${attempts} محاولة\n`;
    });
    
    const scoreDescription = `النتيجة الكلية: ${totalCorrect} من ${totalRounds}\nالمحاولات:\n${allAttemptsText}`;
    
    // Save session with score to database
    saveSessionToDatabase(scoreDescription);
}

function goBackToSession() {
    window.history.back();
}
