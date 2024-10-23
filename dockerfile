FROM node:18
WORKDIR /usr/src/app

# Downgrade to NPM 6 because of an error
RUN npm install -g npm@6

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "start"]