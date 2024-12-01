// mongoDB logic
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = 'mongodb+srv://jasuahonen:JasunMongoDatabase@cluster0.483oq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


async function connectToDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB!");
        return client.db('moviesDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
}

module.exports = connectToDB;
