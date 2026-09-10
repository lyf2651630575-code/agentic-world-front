FROM node:20-alpine

WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .

# 浏览器访问宿主机上的 API 时，请在运行时注入 VITE_API_BASE_URL
ENV VITE_API_BASE_URL=http://host.docker.internal:8000

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
