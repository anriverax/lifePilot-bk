interface IEnv {
  nodeEnv: string | undefined;
  port: number;
  database: {
    host: string | undefined;
    port: number;
    username: string | undefined;
    password: string | undefined;
    name: string | undefined;
    url: string | undefined;
  };
  jwt: {
    expiration: string | undefined;
    refreshToken: string | undefined;
    privateKey: string | undefined;
    publicKey: string | undefined;
  };
  redis: string | undefined;
  resend: string | undefined;
  privatekeySecret: string | undefined;
  aws: {
    accessKeyId: string | undefined;
    secretAccessKey: string | undefined;
    region: string | undefined;
    bucketName: string | undefined;
    url: string | undefined;
  };
}

export default (): IEnv => ({
  nodeEnv: process.env.NODE_ENV?.toString(),
  port: parseInt(process.env.PORT || "3001"),
  database: {
    host: process.env.POSTGRES_HOST?.toString(),
    port: parseInt(process.env.POSTGRES_PORT || "5432"),
    username: process.env.POSTGRES_USER?.toString(),
    password: process.env.POSTGRES_PASSWORD?.toString(),
    name: process.env.POSTGRES_DB?.toString(),
    url: process.env.DATABASE_URL?.toString()
  },
  jwt: {
    expiration: process.env.JWT_EXPIRATION?.toString(),
    refreshToken: process.env.JWT_REFRESH_TOKEN?.toString(),
    privateKey: process.env.JWT_PRIVATE_KEY?.toString(),
    publicKey: process.env.JWT_PUBLIC_KEY?.toString()
  },
  redis: process.env.REDIS?.toString(),
  resend: process.env.RESEND?.toString(),
  privatekeySecret: process.env.PRIVATE_KEY_SECRET?.toString(),
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID?.toString(),
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY?.toString(),
    region: process.env.AWS_REGION?.toString(),
    bucketName: process.env.AWS_BUCKET_NAME?.toString(),
    url: process.env.AWS_URL?.toString()
  }
});
