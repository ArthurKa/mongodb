## tsconfig.json
```json
{
  "include": [
    "node_modules/<pkg.name>/build/modules.d.ts",
  ],
  "exclude": [
    // no "node_modules",
  ],
}
```

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
import { getCollection, closeDB } from '<pkg.name>';

(async () => {
  const collection = await getCollection('collection');

  await closeDB();
})();
```

### Or
```ts
import { getCollection, closeDB } from '<pkg.name>';

interface Document {
  name: string;
  age: number;
}

(async () => {
  const collection = await getCollection<Document>('collection');

  await closeDB();
})();
```
