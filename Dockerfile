FROM node:22

WORKDIR /app

# Install phase CLI
RUN apt-get update && apt-get install -y curl wget && \
    curl -fsSL https://pkg.phase.dev/install.sh | bash

COPY package.json .
COPY yarn.lock .
RUN yarn install

COPY . .

RUN yarn build

EXPOSE 4000

CMD phase run --app "$PHASE_APP" --env "$PHASE_ENV" node dist