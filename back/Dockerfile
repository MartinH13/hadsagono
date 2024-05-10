# Use the official Node.js image as the base
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY . ./
# Install the dependencies
RUN npm install --omit=dev

# Expose the port on which the Express application will run (adjust if needed)
EXPOSE 3000

# Start the Express application
CMD ["npm", "run", "prod"]