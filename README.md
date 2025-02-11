# Sciset backend

Tools:

- [Nest](https://github.com/nestjs/nest)
- [PrismaORM](https://github.com/prisma/prisma)
- PostgreSQL

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Database development

```bash
# migration
$ npx prisma migrate dev
# seed add mockaup data
$ npx prisma migrate dev
```

## Database development

```bash
$ npx prisma migrate deploy
```

## Deploy .env

According to the variable names in the env file, you can change it in AWS SSM service - Parameter store section

After replacement, you need to restart the API in ECS
