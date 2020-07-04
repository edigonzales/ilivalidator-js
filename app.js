var express = require('express');
var app = express();
app.use(express.static('public'));

const multer = require('multer');
const path = require('path');
const fs = require("fs");

// TODO: Ist nicht thread safe.
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    // By default, multer removes file extensions so let's add them back
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

const SettingsJavaClass = Java.type('ch.ehi.basics.settings.Settings');
const settings = new SettingsJavaClass();
const ValidatorJavaClass = Java.type('org.interlis2.validator.Validator');

app.get('/fubar', function (req, res) {
    res.send('Hello World!');
});

app.post('/', (req, res) => {
    let upload = multer({ storage: storage }).single('file');

    upload(req, res, function(err) {
        if (req.fileValidationError) {
            return res.send(req.fileValidationError);
        }
        else if (!req.file) {
            return res.send('Not a file.');
        }
        else if (err instanceof multer.MulterError) {
            return res.send(err);
        }
        else if (err) {
            return res.send(err);
        }

        settings.setValue(ValidatorJavaClass.SETTING_ILIDIRS, ValidatorJavaClass.SETTING_DEFAULT_ILIDIRS);
        // TODO: Ist nicht thread safe.
        var logFileName = "logs/" + req.file.originalname + ".log";
        settings.setValue(ValidatorJavaClass.SETTING_LOGFILE, logFileName);

        ValidatorJavaClass.runValidation("uploads/" + req.file.originalname, settings);
        var content = fs.readFileSync(logFileName, 'utf8');

        res.set('Content-Type', 'text/plain');
        res.send(content);
    });
});

app.listen(3000, function () {
    console.log('App listening on port 3000!');
});
