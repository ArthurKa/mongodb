## .env
```
MONGO_URL = mongodb://localhost:27017/<DB_NAME>
```

### Or
```
MONGO_URL = mongodb://localhost:27017
DB_NAME = <DB_NAME>
```

## Usage

```ts
import { getCollection, closeDB } from '@arthurka/mongodb';

(async () => {
  const collection = await getCollection('collection');

  await closeDB();
})();
```

### Or
```ts
import { getCollection, closeDB } from '@arthurka/mongodb';

interface Document {
  name: string;
  age: number;
}

(async () => {
  const collection = await getCollection<Document>('collection');

  await closeDB();
})();
```
