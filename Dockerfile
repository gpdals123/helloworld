# version of node to use
FROM node:20

# copy all our source code into the working directory
COPY . .

# command to start our server
CMD [ "node", "index.js" ]
