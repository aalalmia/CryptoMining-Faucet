import { auth, database } from './firebase.js';
import { ref, get, set, update } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

// Initialize variables
let progressInterval;
let currentProgress = 0;
let captchaSolution;
let spinCount = 0;
let adsWatched = 0;

// Wait for auth state to be initialized
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        loadUserData(user.uid);
        initializePopupAds();
        setupEventListeners(user.uid);
    } else {
        // No user is signed in, redirect to login
        window.location.href = 'index.html';
    }
});

function loadUserData(userId) {
    get(ref(database, 'users/' + userId)).then((snapshot) => {
        if (snapshot.exists()) {
            const userData = snapshot.val();
            
            // Display Cwallet ID in modals
            document.getElementById('displayCwallet').textContent = userData.cwallet;
            document.getElementById('displayCwalletLC').textContent = userData.cwallet;
            
            // Update Bwallet balance
            document.getElementById('bwalletBalance').textContent = userData.bwalletBalance;
            document.getElementById('withdrawCondition').textContent = userData.bwalletBalance;
            
            // Update Lucky Cash balance
            document.getElementById('luckyCashBalance').textContent = userData.luckyCashBalance.toFixed(2);
            document.getElementById('cashCondition').textContent = userData.luckyCashBalance.toFixed(2);
            document.getElementById('adsCondition').textContent = userData.luckyAdsWatched;
            
            // Update spin count
            spinCount = userData.spinCount || 0;
            updateSpinButton();
        }
    });
}

function initializePopupAds() {
    // Load ads from database
    get(ref(database, 'ads/popup')).then((snapshot) => {
        if (snapshot.exists()) {
            const ads = snapshot.val();
            
            // Set ad content for each popup
            document.querySelectorAll('.ad-content').forEach((adElement, index) => {
                adElement.innerHTML = ads[`ad${index+1}`] || '<p>Ad Space</p>';
            });
            
            // Show popup ads with delay
            setTimeout(() => {
                document.querySelectorAll('.popup-ad').forEach(ad => {
                    ad.style.display = 'block';
                    
                    // Show close button after 10 seconds
                    setTimeout(() => {
                        ad.querySelector('.close-ad').style.display = 'block';
                    }, 10000);
                });
            }, 2000);
        }
    });
    
    // Close ad event listeners
    document.querySelectorAll('.close-ad').forEach(button => {
        button.addEventListener('click', function() {
            const ad = this.parentElement;
            ad.style.display = 'none';
            
            // Show ad again after 10 seconds
            setTimeout(() => {
                ad.style.display = 'block';
                
                // Show close button after another 10 seconds
                setTimeout(() => {
                    this.style.display = 'block';
                }, 10000);
            }, 10000);
        });
    });
}

function setupEventListeners(userId) {
    // Start progress bar
    startProgressBar(userId);
    
    // Modal buttons
    document.getElementById('bwalletBtn').addEventListener('click', () => {
        document.getElementById('bwalletModal').style.display = 'block';
    });
    
    document.getElementById('luckyCashBtn').addEventListener('click', () => {
        document.getElementById('luckyCashModal').style.display = 'block';
    });
    
    document.getElementById('tryYourLuckBtn').addEventListener('click', () => {
        document.getElementById('tryYourLuckModal').style.display = 'block';
    });
    
    // Close modal buttons
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Withdrawal buttons
    document.getElementById('withdrawBtn').addEventListener('click', () => {
        handleWithdrawal(userId, 'bwallet');
    });
    
    document.getElementById('withdrawBtnLC').addEventListener('click', () => {
        handleWithdrawal(userId, 'luckyCash');
    });
    
    // Spin button
    document.getElementById('spinBtn').addEventListener('click', () => {
        spinWheel(userId);
    });
    
    // Claim reward button
    document.getElementById('claimRewardBtn').addEventListener('click', () => {
        showIframeAd(userId, 'mining');
    });
    
    // Iframe claim button
    document.getElementById('iframeClaimBtn').addEventListener('click', () => {
        claimReward(userId);
    });
    
    // Close iframe button
    document.querySelector('.close-iframe').addEventListener('click', () => {
        document.getElementById('iframeAds').style.display = 'none';
    });
}

function startProgressBar(userId) {
    // Hide claim container, show progress bar
    document.getElementById('claimContainer').style.display = 'none';
    document.getElementById('progressBar').style.width = '0%';
    document.querySelector('.character').className = 'character digging';
    
    // Start progress
    currentProgress = 0;
    progressInterval = setInterval(() => {
        currentProgress += 0.33; // 5 minutes to fill (300 seconds / 100%)
        document.getElementById('progressBar').style.width = currentProgress + '%';
        
        if (currentProgress >= 100) {
            clearInterval(progressInterval);
            showCaptcha();
        }
    }, 1000);
}

function showCaptcha() {
    // Generate simple math captcha
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    captchaSolution = num1 + num2;
    
    document.getElementById('mathCaptcha').textContent = `${num1} + ${num2} = ?`;
    document.getElementById('captchaContainer').style.display = 'block';
    
    // Change character animation
    document.querySelector('.character').className = 'character jumping';
    
    // Submit captcha
    document.getElementById('submitCaptcha').addEventListener('click', () => {
        const userAnswer = parseInt(document.getElementById('captchaAnswer').value);
        
        if (userAnswer === captchaSolution) {
            document.getElementById('captchaContainer').style.display = 'none';
            document.getElementById('claimContainer').style.display = 'block';
        } else {
            alert('Wrong answer! Please try again.');
        }
    });
}

function showIframeAd(userId, type) {
    // Hide claim button
    document.getElementById('claimContainer').style.display = 'none';
    
    // Show iframe ad
    const iframeAds = document.getElementById('iframeAds');
    iframeAds.style.display = 'block';
    
    // Load appropriate ad based on type
    get(ref(database, `ads/${type === 'mining' ? 'claim' : 'lucky'}`)).then((snapshot) => {
        if (snapshot.exists()) {
            const adContent = snapshot.val().content;
            document.getElementById('adsFrame').srcdoc = adContent;
        }
    });
    
    // Start timer
    let timeLeft = 15;
    document.getElementById('adsTimer').textContent = timeLeft;
    
    const timer = setInterval(() => {
        timeLeft--;
        document.getElementById('adsTimer').textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            document.getElementById('iframeClaimBtn').style.display = 'block';
        }
    }, 1000);
}

function claimReward(userId) {
    // Update user balance in database
    update(ref(database, 'users/' + userId), {
        bwalletBalance: increment(10000) // 10k Babydoge
    }).then(() => {
        // Hide iframe
        document.getElementById('iframeAds').style.display = 'none';
        document.getElementById('iframeClaimBtn').style.display = 'none';
        
        // Restart progress bar
        startProgressBar(userId);
    });
}

function spinWheel(userId) {
    if (spinCount === 0 || document.getElementById('spinBtn').textContent === 'Free Spin') {
        // First spin is free
        performSpin(userId);
    } else {
        // Subsequent spins require watching ads
        showIframeAd(userId, 'lucky');
        
        // After watching ad, increment count
        adsWatched++;
        
        if (adsWatched >= 15) {
            adsWatched = 0;
            performSpin(userId);
        }
    }
}

function performSpin(userId) {
    const wheel = document.getElementById('wheel');
    const spinBtn = document.getElementById('spinBtn');
    const resultDisplay = document.getElementById('spinResult');
    
    // Disable button during spin
    spinBtn.disabled = true;
    
    // Determine possible prizes based on spin count
    let possiblePrizes;
    if (spinCount === 0) {
        // First spin - only $0.5 or $1
        possiblePrizes = [
            { value: 0.5, probability: 0.7 },
            { value: 1, probability: 0.3 }
        ];
    } else {
        // Subsequent spins - wider range with lower probabilities
        possiblePrizes = [
            { value: 0.01, probability: 0.5 },
            { value: 0.03, probability: 0.2 },
            { value: 0.05, probability: 0.15 },
            { value: "Try Again", probability: 0.1 },
            { value: 0.1, probability: 0.02 },
            { value: 0.3, probability: 0.01 },
            { value: 0.5, probability: 0.01 },
            { value: "3x Spin", probability: 0.005 },
            { value: 1, probability: 0.002 },
            { value: 3, probability: 0.001 },
            { value: 5, probability: 0.001 }
        ];
    }
    
    // Spin animation
    let spinDegrees = 0;
    const spinInterval = setInterval(() => {
        spinDegrees += 30;
        wheel.style.transform = `rotate(${spinDegrees}deg)`;
        
        if (spinDegrees >= 360 * 5) { // 5 full rotations
            clearInterval(spinInterval);
            
            // Select a random prize based on probabilities
            const randomValue = Math.random();
            let cumulativeProbability = 0;
            let selectedPrize;
            
            for (const prize of possiblePrizes) {
                cumulativeProbability += prize.probability;
                if (randomValue <= cumulativeProbability) {
                    selectedPrize = prize.value;
                    break;
                }
            }
            
            // Update UI with result
            if (selectedPrize === "Try Again") {
                resultDisplay.textContent = "Try Again! No prize this time.";
            } else if (selectedPrize === "3x Spin") {
                resultDisplay.textContent = "You won 3 free spins!";
                spinCount -= 3; // Give 3 free spins
            } else {
                resultDisplay.textContent = `You won $${selectedPrize}!`;
                
                // Update database with winnings
                update(ref(database, 'users/' + userId), {
                    luckyCashBalance: increment(selectedPrize),
                    spinCount: increment(1)
                }).then(() => {
                    // Reload user data to update display
                    loadUserData(userId);
                });
            }
            
            // Update spin button for next spin
            spinCount++;
            updateSpinButton();
            spinBtn.disabled = false;
        }
    }, 50);
}

function updateSpinButton() {
    const spinBtn = document.getElementById('spinBtn');
    
    if (spinCount === 0) {
        spinBtn.textContent = "Free Spin";
    } else {
        spinBtn.textContent = `Watch ${15 - adsWatched} Lucky Ads to Spin Again`;
        spinBtn.disabled = adsWatched < 15;
    }
}

function handleWithdrawal(userId, type) {
    const amount = parseFloat(document.getElementById(`withdrawAmount${type === 'bwallet' ? '' : 'LC'}`).value);
    const conditionElement = document.getElementById(`${type}Condition`);
    const statusElement = document.getElementById(`withdrawalStatus${type === 'bwallet' ? '' : 'LC'}`);
    
    // Check conditions based on withdrawal type
    if (type === 'bwallet') {
        if (amount < 50000) {
            conditionElement.style.color = 'red';
            statusElement.textContent = 'Minimum withdrawal is 50,000 Babydoge';
            return;
        }
    } else { // luckyCash
        const cashCondition = parseFloat(document.getElementById('cashCondition').textContent);
        const adsCondition = parseInt(document.getElementById('adsCondition').textContent);
        
        if (cashCondition < 2.5 || adsCondition < 20) {
            document.querySelectorAll('.conditions .condition').forEach(cond => {
                cond.style.color = 'red';
            });
            statusElement.textContent = 'You need $2.5 and 20 Lucky Ads watched to withdraw';
            return;
        }
    }
    
    // If conditions are met, process withdrawal
    statusElement.textContent = 'Withdrawal is in pending...';
    
    // Create withdrawal request in database
    const withdrawalRef = ref(database, 'withdrawals').push();
    set(withdrawalRef, {
        userId: userId,
        type: type,
        amount: amount,
        cwallet: document.getElementById('displayCwallet').textContent,
        timestamp: Date.now(),
        status: 'pending'
    }).then(() => {
        // Update user balance
        update(ref(database, 'users/' + userId), {
            [`${type}Balance`]: 0,
            luckyAdsWatched: 0, // Reset for lucky cash
            lastWithdrawalRequest: withdrawalRef.key
        });
        
        // Show success message
        setTimeout(() => {
            statusElement.textContent = 'Withdrawal request submitted!';
            document.getElementById(`withdrawAmount${type === 'bwallet' ? '' : 'LC'}`).value = '';
            
            // Reload user data
            loadUserData(userId);
        }, 10000);
    });
}

// Helper function for Firebase increment
function increment(value) {
    return [value, 'increment'];
}