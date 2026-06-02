global.crypto = require('crypto');

const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

const JWT_SECRET = process.env.JWT_SECRET || 'sauti_studio_secure_key_2026';

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Atlas Live Core Engine Operational'))
    .catch(err => console.error('Database instantiation error:', err));

const User = mongoose.model('User', new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Scout', 'Artist'], required: true }
}));

const ArtistSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    genre: { type: String, enum: ['Gengetone', 'Benga', 'Ohangla', 'Kapuka', 'Afrobeats'], default: 'Gengetone' },
    pricePerHour: { type: Number, default: 2000 },
    rating: { type: Number, default: 5.0 },
    reviewCount: { type: Number, default: 0 },
    aiScore: { type: Number, default: 75 },
    description: { type: String, default: "" },
    walletBalance: { type: Number, default: 0 },
    reviews: [
        {
            reviewerName: String,
            rating: Number,
            comment: String,
            date: { type: Date, default: Date.now }
        }
    ],
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], default: [36.8219, -1.2921] }
    }
});
ArtistSchema.index({ location: '2dsphere' });
const Artist = mongoose.model('Artist', ArtistSchema);

const Scout = mongoose.model('Scout', new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true },
    studioName: { type: String, default: "" },
    scoutType: { type: String, default: "Independent Producer" },
    preferredGenres: { type: String, default: "" },
    lookingFor: { type: String, default: "" },
    bio: { type: String, default: "" }
}));

const Booking = mongoose.model('Booking', new mongoose.Schema({
    artistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
    scoutId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scoutName: { type: String, required: true },
    date: { type: String, required: true },
    duration: { type: Number, required: true },
    status: { type: String, enum: ['Pending Verification', 'Confirmed', 'Completed'], default: 'Pending Verification' },
    payout: { type: Number, required: true }
}));

const Message = mongoose.model('Message', new mongoose.Schema({
    roomId: { type: String, required: true },
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
}));


const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Access denied. Token missing." });

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        res.status(403).json({ error: "Invalid token validation parameters." });
    }
};

const fetchMpesaToken = async (req, res, next) => {
    const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
    try {
        const response = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
            headers: { Authorization: `Basic ${auth}` }
        });
        req.mpesaToken = response.data.access_token;
        next();
    } catch (error) {
        res.status(500).json({ error: "M-Pesa token handshake failed." });
    }
};


app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await User.create({ name, email, password: hashedPassword, role });
        const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: newUser._id, name, role } });
    } catch (err) {
        res.status(400).json({ error: "Email address already registered." });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(444).json({ error: "Account details not found." });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Incorrect password." });
        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/artists/discover', async (req, res) => {
    try {
        const { lng, lat, maxDistanceKm, genres, minRating } = req.body;
        let query = {};
        if (lng && lat) {
            query.location = {
                $near: {
                    $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                    $maxDistance: (maxDistanceKm || 30) * 1000
                }
            };
        }
        if (genres && genres.length > 0) query.genre = { $in: genres };
        if (minRating) query.rating = { $gte: parseFloat(minRating) };
        res.json(await Artist.find(query).sort({ aiScore: -1 }));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/artists/profile', verifyToken, async (req, res) => {
    try {
        let profile = await Artist.findOne({ userId: req.user.id });
        if (!profile) {
            const acc = await User.findById(req.user.id);
            profile = await Artist.create({ userId: req.user.id, name: acc.name, role: "Independent Artist", genre: "Gengetone" });
        }
        res.json(profile);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/artists/profile', verifyToken, async (req, res) => {
    try {
        const { pricePerHour, genre, role, description } = req.body;
        const userAccount = await User.findById(req.user.id);
        
        const resProfile = await Artist.findOneAndUpdate(
            { userId: req.user.id },
            { 
                $set: { 
                    userId: req.user.id,
                    name: userAccount.name,
                    pricePerHour: Number(pricePerHour), 
                    genre, 
                    role, 
                    description 
                } 
            },
            { new: true, upsert: true, runValidators: true }
        );
        res.json({ success: true, profile: resProfile });
    } catch (err) { res.status(400).json({ error: err.message }); }
});


app.get('/api/scouts/profile', verifyToken, async (req, res) => {
    try {
        let profile = await Scout.findOne({ userId: req.user.id });
        if (!profile) {
            const acc = await User.findById(req.user.id);
            profile = await Scout.create({ userId: req.user.id, name: acc.name });
        }
        res.json(profile);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/scouts/profile', verifyToken, async (req, res) => {
    try {
        const { studioName, scoutType, preferredGenres, lookingFor, bio } = req.body;
        const userAccount = await User.findById(req.user.id);
        
        const resProfile = await Scout.findOneAndUpdate(
            { userId: req.user.id },
            { 
                $set: { 
                    userId: req.user.id,
                    name: userAccount.name,
                    studioName,
                    scoutType,
                    preferredGenres,
                    lookingFor,
                    bio
                } 
            },
            { new: true, upsert: true, runValidators: true }
        );
        res.json({ success: true, profile: resProfile });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/artists/:id', verifyToken, async (req, res) => {
    try { res.json(await Artist.findById(req.params.id)); } 
    catch { res.status(404).json({ error: "Profile not found." }); }
});

app.get('/api/chat/history/:roomId', verifyToken, async (req, res) => {
    try { res.json(await Message.find({ roomId: req.params.roomId }).sort({ timestamp: 1 })); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/chat/conversations', verifyToken, async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const messages = await Message.find({ roomId: { $regex: currentUserId } }).sort({ timestamp: -1 });
        const conversationsMap = {};
        
        for (const msg of messages) {
            if (!conversationsMap[msg.roomId]) {
                const ids = msg.roomId.split('_');
                const otherUserId = ids.find(id => id !== currentUserId);
                let partnerName = "Workspace Scout";
                
                if (msg.senderId !== currentUserId) {
                    partnerName = msg.senderName;
                } else {
                    const userAccount = await User.findById(otherUserId);
                    if (userAccount) partnerName = userAccount.name;
                }

                conversationsMap[msg.roomId] = {
                    roomId: msg.roomId, scoutName: partnerName, scoutUserId: otherUserId, lastMessage: msg.text, time: msg.timestamp
                };
            }
        }
        res.json(Object.values(conversationsMap));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/bookings/artist', verifyToken, async (req, res) => {
    try {
        const artistProfile = await Artist.findOne({ userId: req.user.id });
        if (!artistProfile) return res.json([]);
        res.json(await Booking.find({ artistId: artistProfile._id }).sort({ _id: -1 }));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/booking/pay', verifyToken, fetchMpesaToken, async (req, res) => {
    const { phoneNumber, amount, artistId } = req.body;
    const shortCode = "174379"; 
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = Buffer.from(`${shortCode}${process.env.MPESA_PASSKEY}${timestamp}`).toString('base64');
    const cleanPhone = phoneNumber.startsWith('0') ? `254${phoneNumber.slice(1)}` : phoneNumber;

    try {
        const scoutAccount = await User.findById(req.user.id);
        const artistProfile = await Artist.findById(artistId);

        if (!artistProfile) return res.status(404).json({ error: "Artist profile missing." });

        await Booking.create({
            artistId: artistProfile._id,
            scoutId: scoutAccount._id,
            scoutName: scoutAccount.name,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2026' }),
            duration: 2,
            status: 'Pending Verification',
            payout: artistProfile.pricePerHour * 2
        });

        await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
            BusinessShortCode: shortCode, Password: password, Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline", Amount: amount, PartyA: cleanPhone,
            PartyB: shortCode, PhoneNumber: cleanPhone, CallBackURL: "https://domain.com/callback",
            AccountReference: `Sauti_${artistId.slice(-4)}`, TransactionDesc: "Session Hold"
        }, { headers: { Authorization: `Bearer ${req.mpesaToken}` } });

        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "M-Pesa payment gateway error." }); }
});


app.use(express.static(path.join(__dirname, 'frontend', 'dist')));

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
});


io.on('connection', (socket) => {
    socket.on('join_room', (data) => { socket.join(data.roomId); });
    socket.on('send_message', async (data) => {
        try {
            const savedMsg = await Message.create({ roomId: data.roomId, senderId: data.senderId, senderName: data.senderName, text: data.text });
            io.to(data.roomId).emit('receive_message', savedMsg);
        } catch (err) { console.error("Socket error:", err); }
    });
});

const PORT = 5000;
server.listen(PORT, () => console.log(`Unified Full-Stack App live on port: ${PORT}`));
