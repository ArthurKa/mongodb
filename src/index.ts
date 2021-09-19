import { MongoClient, Db, Collection, Document, OptionalId } from 'mongodb';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const dbName = process.env.DB_NAME || process.env.MONGO_URL.split('/').pop()!;
let data: {
  client: MongoClient;
  db: Db;
} | null = null;
const collections: Record<string, Collection<any>> = {};

async function throwIfNoCollection(db: Db, collectionName: string) {
  const collections = await db.listCollections().toArray().then(e => e.map(e => e.name));
  if(!collections.includes(collectionName)) {
    throw new Error(`There is no such collection as "${collectionName}" in ${dbName}`);
  }
}

export async function getDBCollection<T extends Document = Document>(collectionName: string, createCollection?: true) {
  if(!data) {
    const client = await MongoClient.connect(process.env.MONGO_URL);
    data = {
      client,
      db: client.db(dbName),
    };
  }

  let collection: Collection<T> | undefined = collections[collectionName];
  if(!collection) {
    if(!createCollection) {
      await throwIfNoCollection(data.db, collectionName);
    }
    collection = collections[collectionName] = data.db.collection<T>(collectionName);
  }

  if(createCollection) {
    await collection.insertOne({} as OptionalId<T>);
    await collection.deleteMany({});
  }
  return collection;
}

export const closeDB = () => {
  const result = data?.client.close();
  data = null;
  return result;
};
