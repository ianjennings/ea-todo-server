'use strict';
const express = require('express');
const path = require('path');
const app = express();
const request = require('request');
// const isDevelopment = process.env.NODE_ENV === 'development';
const isDevelopment = false;

var version;
// Fetch manifest info every 5 minutes
const FETCH_INTERVAL = 300000;

app.use(require('morgan')('dev'));

if (isDevelopment) {
    app.use('/updates/latest', express.static(path.join(__dirname, 'updates/latest')));
}

app.get('/updates/latest', (req, res) => {
    if (version) {
        const clientVersion = req.query.v;

        if (clientVersion === version) {
            res.status(204).end();
        } else {
            res.json({
                url: `${getBaseUrl()}/updates/latest/osx/ScreenSquid-${version}-mac.zip`
            });
        }
    }
    else {
        res.status(204).end();
    }
});


app.get('/download/latest', (req, res) => {

    var path = `osx/ScreenSquid-${version}.dmg`;

    if(req.query.platform && req.query.platform == "win32") {
        path = `${req.query.platform}/ScreenSquid Setup ${version}-ia32.exe`;
    }

    console.log(`${getBaseUrl()}/updates/latest/${path}`)

    res.redirect(`${getBaseUrl()}/updates/latest/${path}`);

});

let getBaseUrl = () => {
    if (isDevelopment) {
        return 'http://localhost:3000';
    } else {
        return 'http://screensquid-updates.s3.amazonaws.com'
    }
}

let getVersion = () => {
    console.log(`Fetching latest version from ${versionUrl}`);
    request.get(versionUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            version = body;
            console.log('version is ' + version)
        }
        else if (error) {
            console.error(error);
        }
    });
    
    setTimeout(getVersion, FETCH_INTERVAL);
}

const versionUrl = `${getBaseUrl()}/updates/latest/osx/VERSION`;
getVersion();

app.listen(process.env.PORT || 3000, () => {
    console.log(`Express server listening on port ${process.env.PORT}`);
});
