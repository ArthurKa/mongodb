import MongoDB, { MongoClient, Db, Collection, Document, OptionalId } from 'mongodb';

export default MongoDB;
export * from 'mongodb';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const dbName = process.env.DB_NAME || process.env.MONGO_URL.split('/').pop()!;
let dbData: {
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
  if(!dbData) {
    const client = await MongoClient.connect(process.env.MONGO_URL);
    dbData = {
      client,
      db: client.db(dbName),
    };
  }

  let collection: Collection<T> | undefined = collections[collectionName];
  if(!collection) {
    if(!createCollection) {
      await throwIfNoCollection(dbData.db, collectionName);
    }
    collection = collections[collectionName] = dbData.db.collection<T>(collectionName);
  }

  if(createCollection) {
    await collection.insertOne({} as OptionalId<T>);
    await collection.deleteMany({});
  }
  return collection;
}

export const closeDB = () => {
  const result = dbData?.client.close();
  dbData = null;
  return result;
};
