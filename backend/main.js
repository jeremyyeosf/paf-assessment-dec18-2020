require('dotenv').config();
const sha1 = require('sha1');
const { MongoClient, Timestamp } = require('mongodb')
const fs = require('fs')


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

const MONGO_DATABASE = 'paf2020'
const MONGO_COLLECTION = 'stuff'
const MONGO_URL = 'mongodb://localhost:27017'
const mongoClient = new MongoClient(MONGO_URL, 
	{ useNewUrlParser: true, useUnifiedTopology: true })





const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000

const app = express()



const makeQuery = (sql, pool) =>  {
    console.log(sql);
    return (async (args) => {
        const conn = await pool.getConnection();
        try {
            let results = await conn.query(sql, args || []);
            // console.log('return from SQL:', results[0]);
            if (results[0].length == 0) {
                throw new Error
            } else {return results[0]}
            
        }catch(err){
            console.log('no results from SQL', err);
        } finally {
            conn.release();
        }
    });
};

const checkCredentials = `SELECT * FROM user
where user_id=? && password=?`

const authenticateUser = makeQuery(checkCredentials, pool);

app.use(cors());
app.use(morgan('combined'))
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.post('/authentication', async (req, res) => {
    try {
        let result
        // console.log('authenticating...', req.body)
        await authenticateUser([req.body.username, sha1(req.body.password)])
            .then(result => {
                this.result = result
            })
        if (this.result === undefined) {
            throw new Error
        } else {
            res.status(200)
            res.type('application/json')
            res.send({message: 'user validated'})
        }
    } catch (e) {
        console.log('ERROR: ', e)
        res.status(401)
        res.type('application/json')
        res.send({message: 'wrong username or password'})
    }
})

// ---------------------------------------------------------------------------------------------------------------------------------------
// share and upload (this works on ARC upload to s3)
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: AWS_S3_BUCKET_NAME,
        acl: 'public-read',
        key: (req, file, callback) => {
            console.log('file:', file) 
            callback(null, new Date().getTime() + '_' + file.originalname)
        }
    })
}).single('upload')

app.post('/share', (req, res) => {
    try {
        mongoClient.db(MONGO_DATABASE).collection(MONGO_COLLECTION)
        .insertOne(
            {
                title: req.body.title,
                comments: req.body.comments,
                imageRef: 'wwww',
                timestamp: Timestamp()
            }
        )

    upload(req, res, (error) => {
        if (error) {
            console.log(error)
            return res.redirect('/error')
        }
        console.log('Image upload success')
        res.status(200).json({
            message: 'Image uploaded to DigitalOcean',
            // s3_file_key: res.req.file.location
        })
        // console.log('Response from Ng: ', res.req.file)
    })
    } catch(e) {
        res.status(500).send(e)

    }
    
})

// app.post('/share', (req, res, next)=> {
//     console.log('I have entered express app.post.share', req.body)
//     upload(req, res, (error)=> {
//         if (error) {
//           console.log(error);
//           res.status(500).json({error: error.message});
//         }
//         console.log('File uploaded successfully.');
//         res.status(200).json({
//           message: "uploaded",
//         //   s3_file_key: response.req.file.location
//         });
//     });
// });

// -------------------------------------------------------------------------------------------------------------------------------------------
// const upload = multer({
//     storage: multerS3({
//       s3: s3,
//       bucket: AWS_S3_BUCKET_NAME,
//       acl: 'public-read',
//     //   metadata: function (req, file, cb) {
//     //     cb(null, {
//     //         fieldName: file.fieldname,
//     //         originalFileName: file.originalname,
//     //         uploadTimeStamp: new Date().toString(),
//     //         uploader: req.body.uploader? req.body.uploader: req.query.uploader,
//     //         note: req.body.note ? req.body.note: req.query.note
//     //     });
//     //   },
//       key: function (request, file, cb) {
//         console.log(file);
//         cb(null, new Date().getTime()+'_'+ file.originalname);
//       }
//     })
//   }).single('upload');



// app.post('/share', async (req, res) => {
//     try {
//         console.log('info from Angular: ', req.file.originalname)
//         res.status(200)
//         res.type('application/json')
//         res.send({message: 'share success!!'})

//     } catch(e) {
//         console.log('ERROR: ', e)
//         res.status(401)
//         res.type('application/json')
//         res.send({message: 'share is unsuccessful'})
//     }
// })
// -------------------------------------------------------------------------

// const mkTemperature = (params, image) => {
// 	return {
// 		ts: new Date(),
// 		user: params.userName,
// 		q1: 'true' == params.q1.toLowerCase(),
// 		q2: 'true' == params.q2.toLowerCase(),
// 		temperature: parseFloat(params.temperature),
// 		image
// 	}
// }

// const readFile = (path) => new Promise(
// 	(resolve, reject) => 
// 		fs.readFile(path, (err, buff) => {
// 			if (null != err)
// 				reject(err)
// 			else 
// 				resolve(buff)
// 		})
// )

// const putObject = (file, buff, s3) => new Promise(
// 	(resolve, reject) => {
// 		const params = {
// 			Bucket: 'acme',
// 			Key: file.filename, 
// 			Body: buff,
// 			ACL: 'public-read',
// 			ContentType: file.mimetype,
// 			ContentLength: file.size
// 		}
// 		s3.putObject(params, (err, result) => {
// 			if (null != err)
// 				reject(err)
// 			else
// 				resolve(result)
// 		})
// 	}
// )

// const upload = multer({
// 	dest: process.env.TMP_DIR || '/opt/tmp/uploads'
// })

// app.post('/temperature', upload.single('temp-img'), (req, resp) => {
// 	console.info('>>> req.body: ', req.body)
// 	console.info('>>> req.file: ', req.file)

// 	resp.on('finish', () => {
// 		// delete the temp file
// 		fs.unlink(req.file.path, () => { })
// 	})

// 	const doc = mkTemperature(req.body, req.file.filename)

// 	readFile(req.file.path)
// 		.then(buff => 
// 			putObject(req.file, buff, s3)
// 		)
// 		.then(() => 
// 			mongoClient.db(DATABASE).collection(COLLECTION)
// 				.insertOne(doc)
// 		)
// 		.then(results => {
// 			console.info('insert results: ', results)
// 			resp.status(200)
// 			resp.json({ id: results.ops[0]._id })
// 		})
// 		.catch(error => {
// 			console.error('insert error: ', error)
// 			resp.status(500)
// 			resp.json({ error })
// 		})
// })

const p0 = new Promise(
	(resolve, reject) => {
		if ((!!process.env.AWS_S3_ACCESSKEY_ID) && (!!process.env.AWS_S3_SECRET_ACCESSKEY))
			resolve()
		else
			reject('S3 keys not found')
	}
)
const p1 = mongoClient.connect()

Promise.all([[p0, p1]])
	.then(() => {
		app.listen(PORT, () => {
			console.info(`Application started on port ${PORT} at ${new Date()}`)
		})
	})
	.catch(err => { console.error('Cannot connect: ', err) })
