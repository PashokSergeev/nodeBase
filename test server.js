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



if (!player.country) {
    const flagElement = document.createElement('img');
    flagElement.className = `flag-icon flag-icon-${player.country || 'ru'}`;

}else{
    let flagSvg = '';
    switch (player.country) {
        case 'ady':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_adygea_new.jpg" alt="flag Адыгея">`;
            break;
        case 'alt':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_altay_new.jpg" alt="flag Алтай">`;
            break;
        case 'bash':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_bashkorkostan_res_new.jpg" alt="flag Башкортостан">`;
            break;
        case 'bury':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_buryatiya_new.jpg   " alt="flag Бурятия">`;
            break;
        case 'dnr':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_dnr.jpg" alt="flag ДНР">`;
            break;
        case 'dag':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_dagestan_enl.jpg" alt="flag Дагестан">`;
            break;
        case 'ing':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_ingushetiya_enl.jpg" alt="flag Ингушетия">`;
            break;
        case 'kb':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_kabardino_balkarskoy_pes_enl.jpg" alt="flag Кабардино-Балкария">`;
            break;
        case 'klm':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_kalmyikiya_enl.jpg  " alt="flag Калмыкия">`;
            break;
        case 'kar':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_karachaevo_cherkesskay_res_new.jpg" alt="flag Карачаево-Черкесия">`;
            break;
        case 'krl':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_kareliya_enl.jpg" alt="flag Карелия">`;
            break;
        case 'kom':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_komi_new.jpg" alt="flag Коми">`;
            break;
        case 'cr':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_krym.jpg" alt="flag Крым">`;
            break;
        case 'lnr':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_lnr1.jpg" alt="flag Луганская народная республика">`;
            break;
        case 'mr':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_mari_el_new.jpg" alt="flag Марий Эл">`;
            break;
        case 'mrd':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_mordovia_enl.jpg" alt="flag Мордовия">`;
            break;
        case 'sak':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_saha_yakuyiya_new.jpg" alt="flag Саха (Якутия)">`;
            break;
        case 'alv':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_sev_osetiya_new.jpg" alt="flag Северная Осетия — Алания">`;
            break;
        case 'tat':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_tatarstan_new.jpg" alt="flag Татарстан">`;
            break;
        case 'tuv':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_tyva_new.jpg" alt="flag Тыва">`;
            break;
        case 'udm':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_udmurtiya_res_new.jpg" alt="flag Удмуртия">`;
            break;
        case 'khk':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_hakasia_new.jpg" alt="flag Хакасия">`;
            break;
        case 'che':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_chechni.jpg" alt="flag Чечня">`;
            break;
        case 'chv':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_chuvashskaya_res_new.jpg" alt="flag Чувашия">`;
            break;

        case 'altk':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_altay_kray_enl.jpg" alt="flag Алтайский край">`;
            break;
        case 'zbk':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_zabaykalskiy_kray_enl.jpg" alt="flag Забайкальский край">`;
            break;
        case 'kam':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_kamchatskiy_kray_new.jpg" alt="flag Камчатский край">`;
            break;
        case 'kras':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_krasnodarskiy_kray_new.jpg" alt="flag Краснодарский край">`;
            break;
        case 'krd':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_krasnoyarskiy_kray_new.jpg" alt="flag Красноярский край">`;
            break;
        case 'per':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_permskiy_kray_new.jpg" alt="flag Пермский край">`;
            break;
        case 'pri':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_primorskiy_kray_new.jpg" alt="flag Приморский край">`;
            break;
        case 'sta':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_stavropolskiy_kray_new.jpg" alt="flag Ставропольский край">`;
            break;
        case 'hab':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_habarovskiy_kray_new.jpg" alt="flag Хабаровский край">`;
            break;

        case 'amur':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_amurskay_obl_new.jpg" alt="flag Амурская область">`;
            break;
        case 'arh':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_arhangelskaja_obl_new.jpg" alt="flag Архангельская область">`;
            break;
        case 'ast':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_astrahanskay_obl_new.jpg" alt="flag Астраханская область">`;
            break;
        case 'bel':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_belgorodskay_obl_new_0.jpg" alt="flag Белгородская область">`;
            break;
        case 'bry':
            flagSvg = `<img  class="flag-icon"src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_bryanskay_obl_new.jpg" alt="flag Брянская область">`;
            break;
        case 'vla':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_vladim_obl.jpg" alt="flag Владимирская область">`;
            break;
        case 'vlg':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_volgograd_obl_enl.jpg" alt="flag Волгоградская область">`;
            break;
        case 'vls':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_vologodskay_obl_enl_0.jpg" alt="flag Вологодская область">`;
            break;
        case 'vrn':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_voronezskay_obl_enl.jpg" alt="flag Воронежская область">`;
            break;
        case 'zpo':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_zaporogskaia_obl.jpg" alt="flag Запорожская область">`;
            break;
        case 'iva':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_ivanovskay_obl_enl.jpg" alt="flag Ивановская область">`;
            break;
        case 'irk':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_irkutskay_obl_new.jpg" alt="flag Иркутская область">`;
            break;
        case 'klg':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_kaliningradskoy_obl_new.jpg" alt="flag Калининградская область">`;
            break;
        case 'klz':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_kaluzskay_obl_enl.jpg" alt="flag Калужская область">`;
            break;
        case 'kem':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_kemerovskay_obl_new.jpg" alt="flag Кемеровская область">`;
            break;
        case 'kir':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_kirovskay_obl_new.jpg" alt="flag Кировская область">`;
            break;
        case 'kos':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_kostromskay_obl_enl.jpg" alt="flag Костромская область">`;
            break;
        case 'kur':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_kurganskay_obl_enl.jpg" alt="flag Курганская область">`;
            break;
        case 'kurs':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_kurskay_obl_new.jpg" alt="flag Курская область">`;
            break;
        case 'len':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_leningradskay_obl_new.jpg" alt="flag Ленинградская область">`;
            break;
        case 'lip':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_lipetskay_obl_enl.jpg" alt="flag Липецкая область">`;
            break;
        case 'mag':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_magadanskay_obl_enl.jpg" alt="flag Магаданская область">`;
            break;
        case 'mos':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_moskovskay_obl_new.jpg" alt="flag Московская область">`;
            break;
        case 'mur':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_murmanskay_obl_new.jpg" alt="flag Мурманская область">`;
            break;
        case 'nin':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_nizegorodskay_obl_new.jpg" alt="flag Нижегородская область">`;
            break;
        case 'nov':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_novgorodskay_obl_new.jpg" alt="flag Новгородская область">`;
            break;
        case 'nvs':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_novosibirskay_obl_new.jpg" alt="flag Новосибирская область">`;
            break;
        case 'oms':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_omskay_obl_new.jpg" alt="flag Омская область">`;
            break;
        case 'oren':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_orenburskay_obl_enl.jpg" alt="flag Оренбургская область">`;
            break;
        case 'orl':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_orlovskay_obl_enl.jpg" alt="flag Орловская область">`;
            break;
        case 'pnz':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_penza_region_new.jpg" alt="flag Пензенская область">`;
            break;
        case 'psk':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_pskovskay_obl_new.jpg" alt="flag Псковская область">`;
            break;
        case 'ros':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_rostovskaya_obl_enl.jpg" alt="flag Ростовская область">`;
            break;
        case 'rya':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_ryazanskaya_obl_enl.jpg" alt="flag Рязанская область">`;
            break;
        case 'sam':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_samarskaya_obl_new.jpg" alt="flag Самарская область">`;
            break;
        case 'sar':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_saratovskaya_obl_enl_0.jpg" alt="flag Саратовская область">`;
            break;
        case 'sah':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_sahalinskaya_obl_enl.jpg" alt="flag Сахалинская область">`;
            break;
        case 'sve':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_sverdlovskaya_obl_new.jpg" alt="flag Свердловская область">`;
            break;
        case 'smo':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_smolenskaya_obl_enl.jpg" alt="flag Смоленская область">`;
            break;
        case 'tam':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_tambovskaya_obl_new.jpg" alt="flag Тамбовская область">`;
            break;
        case 'tom':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_tomskaya_obl_enl.jpg" alt="flag Томская область">`;
            break;
        case 'tul':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_tulskaya_obl_enl.jpg" alt="flag Тульская область">`;
            break;
        case 'tyu':
            flagSvg = `<img class="flag-icon" src=https://www.megaflag.ru/sites/default/files/images/shop/products/flag_tumenskaya_obl_enl.jpg"" alt="flag Тюменская область">`;
            break;
        case 'uly':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_ulyanovskaya_obl_new.jpg" alt="flag Ульяновская область">`;
            break;
        case 'xobl':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_hersonskaia_obl.jpg" alt="flag Херсонская область">`;
            break;
        case 'cheb':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_chelyabinskaya_obl_enl.jpg" alt="flag Челябинская область">`;
            break;
        case 'yar':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_yaroslavskaya_obl_enl.jpg" alt="flag Ярославская область">`;
            break;

        case 'msk':
            flagSvg = `<img class="flag-icon" src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Flag_of_Moscow%2C_Russia.svg/1280px-Flag_of_Moscow%2C_Russia.svg.png" alt="flag Москва">`;
            break;
        case 'spb':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_st_peterburg.jpg" alt="flag Санкт-Петербург">`;
            break;
        case 'sev':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_sevastopol.jpg" alt="flag Севастополь">`;
            break;

        case 'evao':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_evrejskaja_ao.jpg" alt="flag Еврейская АО">`;
            break;
        case 'nao':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_nenetskiy_avt_okrug_enl.jpg" alt="flag Ненецкий АО">`;
            break;
        case 'hmao':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_hanty_mansiyskiy_avt_okr1.jpg" alt="flag ХМАО">`;
            break;
        case 'chao':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_chucotskiy_avt_okr_new.jpg" alt="flag Чукотский АО">`;
            break;
        case 'yamalo':
            flagSvg = `<img class="flag-icon" src="https://www.megaflag.ru/sites/default/files/images/shop/products/flag_jamalo_neneckogo_avt_okr.jpg" alt="flag Ямало-Ненецкий АО">`;
    }
    const flagElement = flagSvg;
}
