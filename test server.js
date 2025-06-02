// server.js - Video Manager Server
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Setup for JSON processing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files configuration
app.use(express.static(path.join(__dirname, 'public')));
app.use('/videos', express.static(path.join(__dirname, 'videos')));

// Create videos directory if it doesn't exist
const videosDir = path.join(__dirname, 'videos');
if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, videosDir);
    },
    filename: function (req, file, cb) {
        // Save original filename, replacing unsafe characters
        const fileName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, fileName);
    }
});

// Filter to check file type
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new Error('Only video files are allowed!'), false);
    }
};

// Upload configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 500 // 500 MB maximum file size
    }
});

// Path to data file
const dataFilePath = path.join(__dirname, 'data', 'videos.json');

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize data file if it doesn't exist
if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify({ groups: [], activeGroupId: null }));
}

// API for video upload
app.post('/api/upload', upload.single('video'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'File was not uploaded' });
        }

        // Return information about the uploaded file
        res.json({
            success: true,
            file: {
                filename: req.file.filename,
                path: `/videos/${req.file.filename}`,
                size: req.file.size
            }
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Error uploading file' });
    }
});

// API for saving data
app.post('/api/videos', (req, res) => {
    try {
        const data = req.body;
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ error: 'Error saving data' });
    }
});

// API for retrieving data
app.get('/api/videos', (req, res) => {
    try {
        if (fs.existsSync(dataFilePath)) {
            const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
            res.json(data);
        } else {
            res.json({ groups: [], activeGroupId: null });
        }
    } catch (error) {
        console.error('Error reading data:', error);
        res.status(500).json({ error: 'Error reading data' });
    }
});

// Multer error handling
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File is too large. Maximum size is 500 MB.' });
        }
        return res.status(400).json({ error: err.message });
    } else if (err) {
        return res.status(500).json({ error: err.message });
    }
    next();
});

// Route for main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'buttons.html'));
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Videos will be saved to: ${videosDir}`);
});





// Server-side code for handling music uploads and serving music files

// Add this to server.js to handle music uploads and storage

// Create music directory if it doesn't exist
const musicsDir = path.join(__dirname, 'musics');
if (!fs.existsSync(musicsDir)) {
    fs.mkdirSync(musicsDir, { recursive: true });
}

// Configure multer for audio uploads
const audioStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, musicsDir);
    },
    filename: function (req, file, cb) {
        // Save original filename, replacing unsafe characters
        const fileName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, fileName);
    }
});

// Filter to check audio file type
const audioFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
        cb(null, true);
    } else {
        cb(new Error('Only audio files are allowed!'), false);
    }
};

// Audio upload configuration
const audioUpload = multer({
    storage: audioStorage,
    fileFilter: audioFileFilter,
    limits: {
        fileSize: 1024 * 1024 * 50 // 50 MB maximum file size for audio
    }
});

// Serve music files
app.use('/musics', express.static(path.join(__dirname, 'musics')));

// API for audio upload
app.post('/api/upload-audio', audioUpload.single('audio'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Audio file was not uploaded' });
        }

        // Return information about the uploaded file
        res.json({
            success: true,
            file: {
                filename: req.file.filename,
                path: `/musics/${req.file.filename}`,
                size: req.file.size
            }
        });
    } catch (error) {
        console.error('Error uploading audio file:', error);
        res.status(500).json({ error: 'Error uploading audio file' });
    }
});
