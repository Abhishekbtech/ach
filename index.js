const express = require('express')
const fileUpload = require('express-fileupload')
const mongodb = require('mongodb')
const fs = require('fs')

const app = express()
const router = express.Router()
const mongoClient = mongodb.MongoClient
const binary = mongodb.Binary

router.get('/', (req, res) => {
    res.sendFile('./index.html', {root: __dirname})
})

router.get("/", (req, res) => {
    getFiles(res)
})

app.use(fileUpload())

router.post("/upload", (req, res) => {
    let file = {
        name: req.body.name,
        file: binary(req.file.uploadedFile.data)
    }
    insertFile(file, res)
})

function insertFile(file, res) {
    mongoClient.connect("mongodb://127.0.0.1:27017", {
        useNewUrlParser:true,
        useUnifiedTopology:true,
        useCreateIndex:true
    }), (err, client) => {
        if (err) {
            return err
        }else{
            let db = client.db('uploadDB')
            let collection = db.collection('files')
            try{
                collection.insertOne(file)
                console.log("file inserted")
            }
            catch(err){
                console.log('Error:', err)
            }
            client.close()
            res.redirect('/')
        }
    }
}

function getFiles(res){
    mongoClient.connect("mongodb://127.0.0.1:27017", {
        useNewUrlParser:true,
        useUnifiedTopology:true,
        useCreateIndex:true
    }), (err, client) => {
        if (err) {
            return err
        }else{
            let db = client.db('uploadDB')
            let collection = db.collection('files')
            collection.find({}).toArray((err, doc) => {
                if(err){
                    console.log('err in finding doc:', err)
                }
                else{
                    let buffer = doc[0].file.buffer
                    fs.writeFileSync('uploadedImages.jps', buffer)
                }
            })
            client.close()
            res.redirect('/')
        }
    }
}

app.use("/", router)
app.listen(3000, () => console.log("started on 300"))