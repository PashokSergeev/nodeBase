const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/flags', express.static(path.join(__dirname, 'flags')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/videos', express.static(path.join(__dirname, 'videos')));
app.use('/style', express.static(path.join(__dirname, 'style')));

// Setup for JSON processing
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended: true, limit: '50mb'}));

//РАСПИСАНИЕ ИГР
const SCHEDULE_FILE = path.join(__dirname, 'schedule.json');

app.get('/api/schedule', (req, res) => {
    fs.readFile(SCHEDULE_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error reading schedule');
        res.json(JSON.parse(data));
    });
});

app.post('/api/schedule', (req, res) => {
    fs.writeFile(SCHEDULE_FILE, JSON.stringify(req.body, null, 2), err => {
        if (err) return res.status(500).send('Error saving schedule');
        res.sendStatus(200);
    });
});


//СЕТКА ТУРНИРА
const NET_INFO_FILE = path.join(__dirname, 'net_info.json');

app.get('/api/net-info', (req, res) => {
    fs.readFile(NET_INFO_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error reading schedule');
        res.json(JSON.parse(data));
    });
});

app.post('/api/net-info', (req, res) => {
    fs.writeFile(NET_INFO_FILE, JSON.stringify(req.body, null, 2), err => {
        if (err) return res.status(500).send('Error saving schedule');
        res.sendStatus(200);
    });
});

//ПРЕДСТАВЛЕНИЕ КОМАНД
const TEAMS_FILE = path.join(__dirname, 'teams.json');
// Чтение JSON
app.get('/api/data', (req, res) => {
    fs.readFile(TEAMS_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({error: 'Ошибка чтения данных'});
        res.json(JSON.parse(data));
    });
});

// Обновление JSON
app.post('/api/data', (req, res) => {
    fs.writeFile(TEAMS_FILE, JSON.stringify(req.body, null, 2), (err) => {
        if (err) return res.status(500).json({error: 'Ошибка сохранения данных'});
        res.json({success: true});
    });
});

//ВИДЕО СТРАНИЦА
// Create videos directory if it doesn't exist
const videosDir = path.join(__dirname, 'videos');
if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, {recursive: true});
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
    fs.mkdirSync(dataDir, {recursive: true});
}

// Initialize data file if it doesn't exist
if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify({groups: [], activeGroupId: null}));
}

// API for video upload
app.post('/api/upload', upload.single('video'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({error: 'File was not uploaded'});
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
        res.status(500).json({error: 'Error uploading file'});
    }
});

// API for saving data
app.post('/api/videos', (req, res) => {
    try {
        const data = req.body;
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
        res.json({success: true});
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({error: 'Error saving data'});
    }
});

// API for retrieving data
app.get('/api/videos', (req, res) => {
    try {
        if (fs.existsSync(dataFilePath)) {
            const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
            res.json(data);
        } else {
            res.json({groups: [], activeGroupId: null});
        }
    } catch (error) {
        console.error('Error reading data:', error);
        res.status(500).json({error: 'Error reading data'});
    }
});

// Multer error handling
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({error: 'File is too large. Maximum size is 500 MB.'});
        }
        return res.status(400).json({error: err.message});
    } else if (err) {
        return res.status(500).json({error: err.message});
    }
    next();
});

// УПРАВЛЕНИЕ МУЗЫКОЙ
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


//ГЛАВНАЯ СТРАНИЦА
const BUTTONS_FILE = path.join(__dirname, 'buttons.json');
// Чтение JSON
app.get('/api/buttons', (req, res) => {
    fs.readFile(BUTTONS_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({error: 'Ошибка чтения данных'});
        res.json(JSON.parse(data));
    });
});

// Обновление JSON
app.post('/api/buttons', (req, res) => {
    fs.writeFile(BUTTONS_FILE, JSON.stringify(req.body, null, 2), (err) => {
        if (err) return res.status(500).json({error: 'Ошибка сохранения данных'});
        res.json({success: true});
    });
});



// ОБЪЯВЛЕНИЕ НА СТРАНИЦЕ advertisement
const ADVERTISEMENT_FILE = path.join(__dirname, 'advertisement.json');
// Чтение JSON
app.get('/api/advertisement', (req, res) => {
    fs.readFile(ADVERTISEMENT_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({error: 'Ошибка чтения данных'});
        res.json(JSON.parse(data));
    });
});

// Обновление JSON
app.post('/api/advertisement', (req, res) => {
    fs.writeFile(ADVERTISEMENT_FILE, JSON.stringify(req.body, null, 2), (err) => {
        if (err) return res.status(500).json({error: 'Ошибка сохранения данных'});
        res.json({success: true});
    });
});

// Олимпийская система olympic system
const OLYMPIC_SYSTEM_FILE = path.join(__dirname, 'olympic.json');
// Чтение JSON
app.get('/api/olympic', (req, res) => {
    fs.readFile(OLYMPIC_SYSTEM_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({error: 'Ошибка чтения данных'});
        res.json(JSON.parse(data));
    });
});

// Обновление JSON
app.post('/api/olympic', (req, res) => {
    fs.writeFile(OLYMPIC_SYSTEM_FILE, JSON.stringify(req.body, null, 2), (err) => {
        if (err) return res.status(500).json({error: 'Ошибка сохранения данных'});
        res.json({success: true});
    });
});




app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'buttons.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
    console.log(`Videos will be saved to: ${videosDir}`);
});
