import { MongoClient, Db, Collection } from "mongodb"
import connect from "./connect";
import setupTestData from "./setUpTestData"

(async function Tester() {
  const client = await connect();
  const db = client.db("day1ex1")
  const collection = db.collection("inventory")
  const status = await setupTestData(collection)
  
  //Add your play-around code here
  const result = collection.find(
    {
      status: { $in: ['A', 'D'] },
      qty: { $lt: 30 }
    },
    {projection:{item:1, _id:0, qty:1}
  })
  //.skip(3).limit(3);
  const asArray = await result.toArray();
  //console.log(asArray);

  const result1 = collection.find(
    {
      status: 'A',
      $or: [{ qty: { $lt: 30 } }, { item: { $regex: '^p' } }]
    },
    {projection:{item:1, _id:0, qty:1}
  })
  const asArray1 = await result.toArray();
  //console.log(asArray1);

  const result2 = await collection.find(
    {
      tags: { $all: ['red', 'blank'] }
    }
  ).toArray();
  console.log(result2);



  client.close()
})()
