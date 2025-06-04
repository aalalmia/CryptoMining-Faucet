import { database } from './firebase.js';
import { ref, set, get, onValue } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";

// Load current ads
function loadCurrentAds() {
    get(ref(database, 'ads')).then((snapshot) => {
        if (snapshot.exists()) {
            const ads = snapshot.val();
            
            // Login ads
            if (ads.login) {
                document.getElementById('loginAd1').value = ads.login.ad1 || '';
                document.getElementById('loginAd2').value = ads.login.ad2 || '';
            }
            
            // Popup ads
            if (ads.popup) {
                document.getElementById('popupAd1').value = ads.popup.ad1 || '';
                document.getElementById('popupAd2').value = ads.popup.ad2 || '';
                document.getElementById('popupAd3').value = ads.popup.ad3 || '';
                document.getElementById('popupAd4').value = ads.popup.ad4 || '';
            }
            
            // Claim ad
            if (ads.claim) {
                document.getElementById('claimAd').value = ads.claim.content || '';
            }
            
            // Lucky ad
            if (ads.lucky) {
                document.getElementById('luckyAd').value = ads.lucky.content || '';
            }
        }
    });
}

// Save ads
document.getElementById('saveLoginAds').addEventListener('click', () => {
    const ad1 = document.getElementById('loginAd1').value;
    const ad2 = document.getElementById('loginAd2').value;
    
    set(ref(database, 'ads/login'), {
        ad1: ad1,
        ad2: ad2
    }).then(() => {
        alert('Login ads saved successfully!');
    });
});

document.getElementById('savePopupAds').addEventListener('click', () => {
    const ad1 = document.getElementById('popupAd1').value;
    const ad2 = document.getElementById('popupAd2').value;
    const ad3 = document.getElementById('popupAd3').value;
    const ad4 = document.getElementById('popupAd4').value;
    
    set(ref(database, 'ads/popup'), {
        ad1: ad1,
        ad2: ad2,
        ad3: ad3,
        ad4: ad4
    }).then(() => {
        alert('Popup ads saved successfully!');
    });
});

document.getElementById('saveClaimAd').addEventListener('click', () => {
    const content = document.getElementById('claimAd').value;
    
    set(ref(database, 'ads/claim'), {
        content: content
    }).then(() => {
        alert('Claim ad saved successfully!');
    });
});

document.getElementById('saveLuckyAd').addEventListener('click', () => {
    const content = document.getElementById('luckyAd').value;
    
    set(ref(database, 'ads/lucky'), {
        content: content
    }).then(() => {
        alert('Lucky ad saved successfully!');
    });
});

// Load and manage withdrawal requests
function loadWithdrawalRequests() {
    const withdrawalList = document.getElementById('withdrawalList');
    
    onValue(ref(database, 'withdrawals'), (snapshot) => {
        withdrawalList.innerHTML = '';
        
        if (snapshot.exists()) {
            const withdrawals = snapshot.val();
            
            Object.keys(withdrawals).forEach(key => {
                const request = withdrawals[key];
                
                if (request.status === 'pending') {
                    const requestElement = document.createElement('div');
                    requestElement.className = 'withdrawal-request';
                    requestElement.innerHTML = `
                        <p><strong>Type:</strong> ${request.type}</p>
                        <p><strong>Amount:</strong> ${request.amount} ${request.type === 'bwallet' ? 'Babydoge' : '$'}</p>
                        <p><strong>Cwallet:</strong> ${request.cwallet}</p>
                        <p><strong>Date:</strong> ${new Date(request.timestamp).toLocaleString()}</p>
                        <div class="request-actions">
                            <button class="approve-btn" data-id="${key}">Approve</button>
                            <button class="reject-btn" data-id="${key}">Reject</button>
                        </div>
                    `;
                    
                    withdrawalList.appendChild(requestElement);
                }
            });
            
            // Add event listeners to action buttons
            document.querySelectorAll('.approve-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const requestId = this.getAttribute('data-id');
                    updateWithdrawalStatus(requestId, 'approved');
                });
            });
            
            document.querySelectorAll('.reject-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const requestId = this.getAttribute('data-id');
                    updateWithdrawalStatus(requestId, 'rejected');
                });
            });
        } else {
            withdrawalList.innerHTML = '<p>No pending withdrawal requests.</p>';
        }
    });
}

function updateWithdrawalStatus(requestId, status) {
    update(ref(database, `withdrawals/${requestId}`), {
        status: status,
        processedAt: Date.now()
    }).then(() => {
        alert(`Withdrawal request ${status} successfully!`);
    });
}

// Initialize admin panel
loadCurrentAds();
loadWithdrawalRequests();