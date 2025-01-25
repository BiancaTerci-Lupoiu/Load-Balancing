# Use the official Node.js image
FROM node:18-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy application files
COPY / .

# Install dependencies
RUN npm install express

# Expose the port the app runs on
EXPOSE 3000

# Run the application
CMD ["node", "app.js"]
