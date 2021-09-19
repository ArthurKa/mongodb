import MongoDB, { MongoClient, Db, Collection, Document, OptionalId } from 'mongodb';

export default MongoDB;
export * from 'mongodb';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const dbName = process.env.DB_NAME || process.env.MONGO_URL.split('/').pop()!;
let dbData: {
  client: MongoClient;
  db: Db;
  collections: Record<string, Collection<any>>;
} | null = null;

async function throwIfNoCollection(db: Db, collectionName: string) {
  const collectionsFromDB = await db.listCollections().toArray().then(e => e.map(e => e.name));
  if(!collectionsFromDB.includes(collectionName)) {
    throw new Error(`There is no such collection as "${collectionName}" in ${dbName}`);
  }
}

export async function getDBCollection<T extends Document = Document>(collectionName: string, createCollection?: boolean) {
  if(!dbData) {
    const client = await MongoClient.connect(process.env.MONGO_URL);
    dbData = {
      client,
      db: client.db(dbName),
      collections: {},
    };
  }

  let collection: Collection<T> | undefined = dbData.collections[collectionName];
  if(!collection) {
    if(!createCollection) {
      await throwIfNoCollection(dbData.db, collectionName);
    }
    collection = dbData.collections[collectionName] = dbData.db.collection<T>(collectionName);

    if(createCollection && await collection.countDocuments() === 0) {
      await collection.insertOne({} as OptionalId<T>);
      await collection.deleteMany({});
    }
  }

  return collection;
}

export const closeDB = () => {
  const result = dbData?.client.close();
  dbData = null;
  return result;
};
