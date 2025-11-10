FROM node:18-alpine

WORKDIR /app

# Create .env file BEFORE copying files and running npm install
RUN echo "VITE_SUPABASE_URL=https://prhsliwzscnekhpbnwnq.supabase.co" > .env
RUN echo "VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByaHNsaXd6c2NuZWtocGJud25xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MDI3OTksImV4cCI6MjA3ODI3ODc5OX0.4XwTD491YO55bad5--ywf5RJqnGZuEkULkluaHfVneU" >> .env

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
