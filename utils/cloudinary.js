var dotenv = require('dotenv');
var path = require('path');
var url = require('url');
var cloudinary = require('cloudinary');
var __direname = path.dirname(url.fileURLToPath(import.meta.url));

dotenv.config({path:path.join(__direname,'../../config/.env')});

cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
    secure: true
})
export default cloudinary.v2;