const express = require('express')
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json())




// const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster.9zce0xe.mongodb.net/?retryWrites=true&w=majority`;
const uri = 'mongodb://0.0.0.0:27017';

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        const myDB = client.db("CognitiveWonders");
        const toysCollection = myDB.collection("toys");

        app.get('/mongo', (req, res) => {
            res.send('mango is ok');
        })
        app.post('/create-toy', async (req, res) => {
            const data = req.body;
            const result = await toysCollection.insertOne(data);
            res.send(result);
        })




        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Cognitive Wonders Server is ok');
})

app.listen(port, () => {
    console.log(`CognitiveWondersServer app listening on port ${port}`)
})