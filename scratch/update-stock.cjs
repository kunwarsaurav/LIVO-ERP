const { MongoClient } = require('mongodb');

async function main() {
  const uri = "mongodb+srv://kunwarsaurav10_db_user:dTGh0DyBD1HmiYoq@cluster0.bu4yeu7.mongodb.net/livo_furniture?retryWrites=true&w=majority&appName=Cluster0";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('livo_furniture');
    const productsCollection = db.collection('products');

    const result = await productsCollection.updateMany(
      {},
      { 
        $set: { currentStock: 10, reservedStock: 0 },
        $unset: { inStock: "" }
      }
    );

    console.log(`Matched ${result.matchedCount} documents and modified ${result.modifiedCount} documents.`);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
