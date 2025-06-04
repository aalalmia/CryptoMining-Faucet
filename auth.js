import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, database } from './firebase.js';
import { ref, set, get } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const cwallet = document.getElementById('cwallet').value;
    const password = document.getElementById('password').value;
    
    try {
        // Try to sign in
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        window.location.href = 'main.html';
    } catch (error) {
        // If user doesn't exist, create new account
        if (error.code === 'auth/user-not-found') {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                
                // Save user data to database
                await set(ref(database, 'users/' + user.uid), {
                    email: email,
                    cwallet: cwallet,
                    bwalletBalance: 0,
                    luckyCashBalance: 0,
                    luckyAdsWatched: 0,
                    lastWithdrawalRequest: null,
                    totalEarned: 0
                });
                
                window.location.href = 'main.html';
            } catch (createError) {
                alert('Error creating account: ' + createError.message);
            }
        } else {
            alert('Login error: ' + error.message);
        }
    }
});