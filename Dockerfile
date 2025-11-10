FROM node:18-alpine

WORKDIR /app

# Set build-time environment variables
ENV VITE_SUPABASE_URL=https://prhsliwzscnekhpbnwnq.supabase.co
ENV VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByaHNsaXd6c2NuZWtocGJud25xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MDI3OTksImV4cCI6MjA3ODI3ODc5OX0.4XwTD491YO55bad5--ywf5RJqnGZuEkULkluaHfVneU

COPY package*.json ./
RUN npm install

COPY . .

# BUILD the app (this embeds the environment variables)
RUN npm run build

# Install a simple HTTP server to serve the built app
RUN npm install -g serve

EXPOSE 3001
CMD ["serve", "-s", "dist", "-l", "3001"]
