FROM node:18-alpine AS base

RUN npm i -g pnpm
ENV PNPM_HOME=/usr/local/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN apk add --no-cache libc6-compat
RUN apk update

FROM base AS build
WORKDIR /app
COPY package.json .
COPY pnpm-lock.yaml .
RUN pnpm install
COPY . .
RUN pnpm build

FROM base AS release
WORKDIR /app
COPY --from=build /app/package.json .
COPY --from=build /app/pnpm-lock.yaml .
RUN pnpm install --prod
COPY --from=build /app/build ./build
COPY drizzle ./drizzle
COPY docs ./docs
ENV NODE_ENV=production
CMD pnpm migrate-prod ; pnpm start
