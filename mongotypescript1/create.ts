import { MongoClient, Db, Collection } from "mongodb"
import connect from "./connect";
import setupTestData from "./setUpTestData"

(async function Tester() {
  const client = await connect();
  const db = client.db("day1ex1")
  const collection = db.collection("inventory")
  const status = await setupTestData(collection)
  
  //Add your play-around code here
  await collection.insertOne(
    {
      item: 'canvas',
      qty: 100,
      tags: ['cotton'],
      size: {h: 28, w: 35.5, uom: 'cm'}
    });

  //const cursor = await collection.find({item: 'canvas'}).toArray();
  

  await collection.insertMany([
    {
      item: 'journal',
      qty: 25,
      tags: ['blank', 'red'],
      size: { h: 14, w: 21, uom: 'cm' }
    },
    {
      item: 'mat',
      qty: 85,
      tags: ['gray'],
      size: { h: 27.9, w: 35.5, uom: 'cm' }
    },
    {
      item: 'mousepad',
      qty: 25,
      tags: ['gel', 'blue'],
      size: { h: 19, w: 22.85, uom: 'cm' }
    }
  ]);

  const cursor = await db.collection('inventory').find({}).toArray();
  const test = await collection.deleteOne({item: "mousepad"});
  console.log(test);

  client.close()
})()
