FROM node:18-alpine

WORKDIR app

COPY package.json ./
COPY package-lock.json ./

COPY tsconfig.json ./

COPY drizzle ./drizzle
COPY src ./src

RUN npm install

CMD [ "npm", "run", "dev" ]

EXPOSE 3000
