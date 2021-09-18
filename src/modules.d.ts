declare namespace NodeJS {
  export interface ProcessEnv {
    MONGO_URL: string;
    DB_NAME?: string;
  }
}
