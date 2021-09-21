import MongoDB, {
  MongoClient,
  Db,
  Collection,
  Document,
  OptionalId,
  InsertManyResult,
  BulkWriteOptions,
} from 'mongodb';

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

interface ExtendedCollection<T> extends Collection<T> {
  insertManyWithEmptyArrayCheck(docs: OptionalId<T>[]): Promise<InsertManyResult<T>>;
  insertManyWithEmptyArrayCheck(docs: OptionalId<T>[], options: BulkWriteOptions): Promise<InsertManyResult<T>>;
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


  let collection = dbData.collections[collectionName] as ExtendedCollection<T> | undefined;
  if(!collection) {
    if(!createCollection) {
      await throwIfNoCollection(dbData.db, collectionName);
    }
    const newCollection = dbData.db.collection<T>(collectionName);
    dbData.collections[collectionName] = newCollection;
    collection = newCollection as ExtendedCollection<T>;

    // @ts-expect-error
    collection.insertManyWithEmptyArrayCheck = function(docs, ...restParams) {
      if(!docs.length) {
        const result: InsertManyResult<T> = {
          acknowledged: true,
          insertedCount: 0,
          insertedIds: {},
        };
        return Promise.resolve(result);
      }

      // @ts-expect-error
      return this.insertMany(docs, ...restParams);
    };

    if(createCollection && await collection.countDocuments() === 0) {
      await collection.insertOne({} as OptionalId<T>);
      await collection.deleteMany({});
    }
  }

  return collection;
}

export const closeDB = async () => {
  await dbData?.client.close();
  dbData = null;
};
