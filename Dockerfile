FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Install client dependencies and build
RUN npm run install-client
RUN npm run build

EXPOSE 3000
CMD [ "npm", "run", "dev" ]
