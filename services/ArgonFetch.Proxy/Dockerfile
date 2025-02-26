# Use Node 18 as the base image
FROM node:18-slim

# Set the working directory in the container
WORKDIR /app/argonfetch/proxy

# Copy the package.json and package-lock.json (if exists) to the container
COPY package.json package-lock.json ./

# Copy the server.js to the container
COPY server.js ./

# Install dependencies
RUN npm install

# Expose port 4442 to allow communication to/from the container
EXPOSE 4442

# Start the server when the container runs
CMD ["node", "server.js"]
