const { MongoClient } = require("mongodb");
require("dotenv").config();

const LOCAL_URI = "mongodb://127.0.0.1:27017";
const DATABASE_NAME = "quiznova";

async function migrate() {
  const localClient = new MongoClient(LOCAL_URI);
  const atlasClient = new MongoClient(process.env.MONGODB_URI);

  try {
    console.log("🔄 Connecting to local MongoDB...");
    await localClient.connect();
    console.log("✅ Local MongoDB connected");

    console.log("🔄 Connecting to MongoDB Atlas...");
    await atlasClient.connect();
    console.log("✅ MongoDB Atlas connected");

    const localDB = localClient.db(DATABASE_NAME);
    const atlasDB = atlasClient.db(DATABASE_NAME);

    const collections = await localDB.listCollections().toArray();

    console.log("\n📦 Starting QuizNova data migration...\n");

    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;

      const localCollection = localDB.collection(collectionName);
      const atlasCollection = atlasDB.collection(collectionName);

      const documents = await localCollection.find({}).toArray();

      console.log(
        `📁 ${collectionName}: ${documents.length} documents found`
      );

      if (documents.length === 0) {
        console.log(`   ↳ Nothing to migrate\n`);
        continue;
      }

      for (const document of documents) {
        await atlasCollection.replaceOne(
          { _id: document._id },
          document,
          { upsert: true }
        );
      }

      console.log(
        `   ✅ ${documents.length} documents migrated successfully\n`
      );
    }

    console.log("========================================");
    console.log("🎉 QUIZNOVA MIGRATION COMPLETED!");
    console.log("========================================");

    // Verify Atlas data
    console.log("\n🔍 Verifying Atlas data...\n");

    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;

      const count = await atlasDB
        .collection(collectionName)
        .countDocuments();

      console.log(`${collectionName}: ${count} documents`);
    }

    console.log("\n✅ Your local data is still untouched.");
    console.log("✅ Atlas now contains the migrated data.");
  } catch (error) {
    console.error("\n❌ Migration failed:");
    console.error(error.message);
  } finally {
    await localClient.close();
    await atlasClient.close();
  }
}

migrate();