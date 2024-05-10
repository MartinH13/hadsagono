# Use the official Node.js image as the base
FROM node:20-alpine

WORKDIR /app

COPY . ./
RUN npm install --omit=dev

EXPOSE 3000

# Start the Express application
CMD ["npm", "run", "prod"]