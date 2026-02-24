docker run -it -v "D:\Projects\Personal\Self monitoring\app:/app" -w /app node:24-alpine npm install --legacy-peer-deps

docker run -it -p 5173:5173 -v "D:\Projects\Personal\Self monitoring\app:/app" -w /app node:24-alpine npm run dev -- --host