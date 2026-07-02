# Start from the official Node.js v20 image using Alphine Linux a small lightweight base
FROM node:20-alpine 

# Create a /app and set it as the working directory inside the container
WORKDIR /app

# Copy the dependency files first (before full source). This is caching optimization so if depecdencies dont change npm install dont need to run again
COPY package.json package-lock.json ./

# install all dependencies listed in package.json
RUN npm install


# Copy the rest of your project files into the container
COPY . .

# Build application 
RUN npm run build

# Document that the container listens on port 3000.
EXPOSE 3000

# Default command to run when container starts  
CMD ["npm", "start"]

