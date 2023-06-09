const express = require('express')
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId} = require('mongodb');
const app = express()
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json())


const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster.9zce0xe.mongodb.net/?retryWrites=true&w=majority`;
// const uri = 'mongodb://0.0.0.0:27017';

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

        const indexKeys = { name: 1 };
        const indexOptions = { name: "toyTitle" };
        const result = await toysCollection.createIndex(indexKeys, indexOptions);

        app.get("/search/:text", async (req, res) => {
            const text = req.params.text;
            console.log(text)
            const result = await toysCollection
                .find({
                    $or: [
                        { name: { $regex: text, $options: "i" } },
                    ],
                })
                .toArray();
            res.send(result);
        });

        app.get('/mongo', (req, res) => {
            res.send('mango is ok');
        })


        app.get('/my-toys/:email/:sortByPrice', async (req, res) => {
            const email = req.params.email;
            const sortByPrice = req.params.sortByPrice;
            const query = {sellerEmail : email};
            let sort = { price: -1 };
            if(sortByPrice !== '0'){
                sort = { price: sortByPrice };
            }
            const cursor = await toysCollection.find(query).sort(sort).collation({locale: "en_US", numericOrdering: true}).limit(20);
            const result = await cursor.toArray();
            return res.send(result);
        })


        app.get('/single-toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const cursor = await toysCollection.findOne(query);
            return res.send(cursor);
        })


        app.put('/update-toys/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            const query = { _id: new ObjectId(id) };
            const updateDocument = {
                $set: {
                    name : data.name,
                    price : data.price,
                    rating: data.rating,
                    quantity : data.quantity,
                    brand : data.brand,
                    age : data.age,
                    image : data.image,
                    description : data.description,
                },
            };
            const cursor = await toysCollection.updateOne(query, updateDocument);
            return res.send(cursor);
        })


        app.get('/all-toys/:sortByPrice', async (req, res) => {
            const sortByPrice = req.params.sortByPrice;
            let sort = { price: -1 };
            if(sortByPrice !== '0'){
                sort = { price: sortByPrice };
            }
            const cursor = await toysCollection.find().sort(sort).collation({locale: "en_US", numericOrdering: true}).limit(20);
            const result = await cursor.toArray();
            return res.send(result);
        })


        app.post('/create-toy', async (req, res) => {
            const data = req.body;
            const result = await toysCollection.insertOne(data);
            res.send(result);
        })

        app.get('/category-toy/:category', async (req, res) => {
            const category = req.params.category;
            let query = {};
            if(category !== 'All'){
                query = {category : category};
            }
            const cursor = await toysCollection.find(query).limit(6);
            const result = await cursor.toArray();
            return res.send(result);
        })

        app.delete('/toy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toysCollection.deleteOne(query);
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