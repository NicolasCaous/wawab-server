FROM node:14.15.4-alpine3.12

RUN apk add --update --no-cache make g++ python3 postgresql-dev

WORKDIR /app

COPY package.json .
RUN yarn install --prod

COPY . .
COPY .* ./

CMD ["yarn", "run", "prodstart"]