import { MongoClient, Db, Collection } from "mongodb"
import connect from "./connect";
import setupTestData from "./setUpTestData"

(async function Tester() {
  const client = await connect();
  const db = client.db("day1ex1")
  const collection = db.collection("inventory")
  const status = await setupTestData(collection)
  
  //Add your play-around code here
  await collection.updateOne(
    { item: 'paper' },
    {
      $set: { 'size.uom': 'cm', status: 'P' },
      $currentDate: { lastModified: true }
    }
  );

  await collection.updateMany(
    { qty: { $lt: 50 } },
    {
      $set: { 'size.uom': 'in', status: 'P' },
      $currentDate: { lastModified: true }
    }
  );

  await collection.replaceOne(
    { item: 'paper' },
    {
      item: 'paper',
      instock: [
        { warehouse: 'A', qty: 60 },
        { warehouse: 'B', qty: 40 }
      ]
    }
  );

  console.log(await collection.find({}).toArray());
  client.close()
})()
