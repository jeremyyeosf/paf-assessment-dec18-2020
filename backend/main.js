require('dotenv').config();

const morgan = require('morgan')
const express = require("express"),
    cors = require('cors'),
    bodyParser = require("body-parser"),
    aws = require('aws-sdk'),
    multer = require('multer'),
    multerS3 = require('multer-s3');

const mysql = require('mysql2/promise')

const AWS_S3_HOSTNAME = process.env.AWS_S3_HOSTNAME;
const AWS_S3_ACCESSKEY_ID = process.env.AWS_S3_ACCESSKEY_ID
const AWS_S3_SECRET_ACCESSKEY= process.env.AWS_S3_SECRET_ACCESSKEY;
const AWS_S3_BUCKET_NAME=process.env.AWS_S3_BUCKET_NAME;

const spacesEndpoint = new aws.Endpoint(AWS_S3_HOSTNAME)
const s3 = new aws.S3({
    endpoint: spacesEndpoint,
    accessKeyId: AWS_S3_ACCESSKEY_ID,
    secretAccessKey: AWS_S3_SECRET_ACCESSKEY
})

const pool = mysql.createPool({
    host: process.env.MYSQL_SERVER,
    port: parseInt(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    connectionLimit: process.env.MYSQL_CONNECTION,
    timezone: '+08:00'
})






const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000

const app = express()

app.use(cors());
app.use(morgan('combined'))
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb'}));



app.listen(PORT, () => {
	console.info(`Application started on port ${PORT} at ${new Date()}`)
})
