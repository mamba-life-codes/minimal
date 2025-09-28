// --- Minimal Telegram Mini App Backend (Express) ---

const express = require('express');
const path = require('path');
const cors = require('cors'); // Necessary for local development, though Mini Apps often run in a webview.
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware Setup
app.use(cors());
app.use(bodyParser.json());

// --- Telegram WebApp Validation Mock ---
// NOTE: For production, you MUST validate the initData server-side
// using the Telegram Bot API method (checking the hash).
// We skip the complex crypto for this *minimal* blueprint, but it is CRITICAL.
const mockValidateInitData = (initData) => {
    // In a real app, this would perform HMAC-SHA-256 validation.
    // For this blueprint, we just check if it's present.
    if (!initData || initData.length < 10) {
        return { valid: false, message: 'Invalid or missing initData.' };
    }

    try {
        // Simple attempt to parse user info for demonstration
        const userMatch = initData.match(/user=({[^&]+})/);
        const user = userMatch ? JSON.parse(decodeURIComponent(userMatch[1])) : { id: 'unknown' };
        
        return { valid: true, userId: user.id };

    } catch (e) {
        console.error('Error parsing initData:', e);
        return { valid: false, message: 'Error parsing initData.' };
    }
};

// --- API Endpoint: Mini App sends data to the Bot/Backend ---
app.post('/api/submit_data', async (req, res) => {
    const { initData, payload } = req.body;

    console.log(`Received data from Mini App. Payload: ${JSON.stringify(payload)}`);

    // 1. Validate the Mini App session data
    const validationResult = mockValidateInitData(initData);

    if (!validationResult.valid) {
        console.warn('Validation Failed:', validationResult.message);
        return res.status(401).json({ status: 'error', message: validationResult.message });
    }

    // 2. Process the data and communicate with the Telegram Bot API
    // --- START MOCK BOT API CALL ---
    const botResponse = `User ${validationResult.userId} submitted: "${payload.message}". Action taken.`;
    console.log(`Mock Bot API Action: ${botResponse}`);

    // In a real application, you would use 'axios' or 'node-fetch' here:
    /*
    try {
        await axios.post(`https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage`, {
            chat_id: validationResult.userId, // Or the chat_id where the Mini App was opened
            text: `Data received: ${payload.message}`
        });
    } catch (error) {
        console.error('Error sending message via Bot API:', error);
    }
    */
    // --- END MOCK BOT API CALL ---

    // 3. Send confirmation back to the Mini App
    res.json({
        status: 'success',
        message: 'Data received and processed successfully by the backend.',
        bot_feedback: botResponse
    });
});

// --- Serving the Frontend (Mini App HTML) ---
app.get('/', (req, res) => {
    // Make sure 'index.html' is in the same directory as 'server.js'
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open your Mini App URL to access: http://localhost:${PORT}`);
});
