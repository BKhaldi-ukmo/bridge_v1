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
        // Display Arabic name
        document.getElementById('wordText').textContent = getArabicName(word);
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
    if (progressBar) {
        progressBar.style.width = percentage + '%';
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
                // All done - transition to visual exercise (Activity 2)
                updateProgress(35); // 35% when moving to visual exercise
                statusEl.className = 'status-text';
                
                setTimeout(() => {
                    startVisualExercise();
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
            totalRounds: 5,
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
    
    // Randomly position the correct answer (0, 1, or 2)
    const correctPosition = Math.floor(Math.random() * 3);
    const imageData = [{}, {}, {}];
    
    // Select correct image from current subcategory
    let correctImageName = (window.visualExerciseState.allImages || [])[0] || '';
    if (state.activity === 2 || state.activity === 3) {
        const allImages = (window.visualExerciseState.allImages || []);
        if (allImages.length > 0) {
            correctImageName = allImages[Math.floor(Math.random() * allImages.length)];
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
            imageData[i] = {
                name: distractor.name,
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
            
            // Activity 2: Target image larger (center)
            if (state.activity === 2) {
                const el = document.getElementById(`image-${index}`);
                el.style.width = '280px';
                el.style.height = '280px';
                el.style.transform = 'scale(1.1)';
            }
            // Activity 3: All equal size
            else if (state.activity === 3) {
                const el = document.getElementById(`image-${index}`);
                el.style.width = '140px';
                el.style.height = '140px';
                el.style.transform = 'none';
            }
        } else {
            const el = document.getElementById(`image-${index}`);
            el.style.width = '140px';
            el.style.height = '140px';
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
                // Distribute 35-95% across activities 2-5
                const activityStart = 35 + (state.activity - 2) * 15;
                const progressPercent = activityStart + (state.currentRound * 15 / state.totalRounds);
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
    
    // If activity 3 is done, transition to activity 4 (Wheel Game)
    if (state.activity === 3) {
        // Store activity 3 scores
        if (!window.accumulatedScores) {
            window.accumulatedScores = {};
        }
        window.accumulatedScores.activity3 = { correctClicks: state.correctClicks, roundAttempts: [...state.roundAttempts] };
        
        // Hide visual phase and start wheel game
        document.getElementById('visualPhase').style.display = 'none';
        startWheelGame();
        return;
    }
    
    // If activity 4 (Wheel Game) is done, transition to activity 5 (Speech Recognition)
    if (state.activity === 4) {
        // Store activity 4 scores
        if (!window.accumulatedScores) {
            window.accumulatedScores = {};
        }
        window.accumulatedScores.activity4 = { correctClicks: state.correctClicks, roundAttempts: [...state.roundAttempts] };
        
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
            totalRounds: 5,
            correctClicks: 0,
            roundAttempts: [],
            activity: 4
        };
    }
    
    // Fetch images for wheel game
    const category = sessionData.item;
    const subcategory = sessionData.tertiary;
    
    fetch(`/api/images/${category}/${subcategory}`)
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success' && data.images) {
            window.wheelGameState.allImages = data.images;
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
    
    // Get 6 random images from the subcategory
    const images = [];
    const allImages = state.allImages || [];
    
    for (let i = 0; i < 6 && allImages.length > 0; i++) {
        const randomIdx = Math.floor(Math.random() * allImages.length);
        images.push(allImages[randomIdx]);
    }
    
    // Ensure we have 6 images (reuse if necessary)
    while (images.length < 6 && allImages.length > 0) {
        const randomIdx = Math.floor(Math.random() * allImages.length);
        images.push(allImages[randomIdx]);
    }
    
    // Set target as first image, then shuffle
    const targetImage = images[0];
    const shuffledImages = images.sort(() => 0.5 - Math.random());
    
    // Store target for this round
    state.currentTarget = targetImage;
    state.targetPosition = shuffledImages.indexOf(targetImage);
    
    // Render wheel game UI
    const wheelGameDiv = document.getElementById('wheelGame');
    wheelGameDiv.innerHTML = `
        <div class="wheel-game-container">
            <div class="wheel-images">
                ${shuffledImages.map((img, idx) => `
                    <div class="wheel-image-slot" onclick="selectWheelImage(${idx})">
                        <img src="/static/items/${category}/${subcategory}/${img}.png" alt="image">
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Update progress
    const progressPercent = 55 + (state.currentRound * 20 / state.totalRounds);
    updateProgress(Math.min(progressPercent, 75));
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
        // Highlight incorrect image and reshuffle
        const slots = document.querySelectorAll('.wheel-image-slot');
        slots[index].style.border = '3px solid red';
        
        setTimeout(() => {
            loadWheelGameRound();
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
            totalRounds: 5,
            correctClicks: 0,
            roundAttempts: [],
            activity: 5
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
            <div class="speech-instruction">ما هاذا؟</div>
            <button id="startRecordingBtn" onclick="startRecording()" class="record-button">ابدأ التسجيل</button>
            <div id="speechResult"></div>
        </div>
    `;
    
    // Update progress
    const progressPercent = 75 + (state.currentRound * 20 / state.totalRounds);
    updateProgress(Math.min(progressPercent, 95));
}

function startRecording() {
    const state = window.speechState;
    state.currentRoundAttempts++;
    
    // Create a simple speech recognition mock for now
    // In production, this would use Web Speech API
    const speechDiv = document.getElementById('speechPhase');
    const resultDiv = speechDiv.querySelector('#speechResult');
    
    // Simulate automatic recording after "ما هاذا؟" sound
    const audioPath = `/static/items/${sessionData.item}/${sessionData.tertiary}/question.m4a`;
    const audio = new Audio(audioPath);
    audio.play().catch(() => {
        // If audio doesn't exist, just proceed with recording
    });
    
    // After 2 seconds of recording, simulate recognition
    setTimeout(() => {
        // For now, randomly decide success
        const isCorrect = Math.random() > 0.3; // 70% success rate for demo
        
        if (isCorrect) {
            state.correctClicks++;
            state.roundAttempts.push(state.currentRoundAttempts);
            resultDiv.innerHTML = '<p class="correct-speech">صحيح! ✓</p>';
            
            setTimeout(() => {
                if (state.currentRound < state.totalRounds) {
                    state.currentRound++;
                    loadSpeechRound();
                } else {
                    endSpeechRecognition();
                }
            }, 1500);
        } else {
            resultDiv.innerHTML = '<p class="incorrect-speech">حاول مجددا</p>';
            
            setTimeout(() => {
                loadSpeechRound();
            }, 1500);
        }
    }, 2000);
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
    
    // Build results summary for all five activities
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
    const totalCorrect = activity1Correct + activity2Correct + activity3Correct + activity4Correct + activity5Correct;
    const totalRounds = 25; // 5 rounds per activity * 5 activities
    
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
    allAttemptsText += `\nالنشاط الرابع (لعبة العجلة):\n`;
    activity4Attempts.forEach((attempts, idx) => {
        allAttemptsText += `الجولة ${idx + 1}: ${attempts} محاولة\n`;
    });
    allAttemptsText += `\nالنشاط الخامس (التعرف الصوتي):\n`;
    activity5Attempts.forEach((attempts, idx) => {
        allAttemptsText += `الجولة ${idx + 1}: ${attempts} محاولة\n`;
    });
    
    const scoreDescription = `النتيجة الكلية: ${totalCorrect} من ${totalRounds}\nالمحاولات:\n${allAttemptsText}`;
    
    // Save session with score to database
    saveSessionToDatabase(scoreDescription);
}

function goBackToSession() {
    window.history.back();
}
