FROM node:24-alpine
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci


ARG NEXT_PUBLIC_BASE_PATH
RUN echo "NEXT_PUBLIC_BASE_PATH=${NEXT_PUBLIC_BASE_PATH}"

COPY . .
RUN npm run build

CMD ["npm", "start"]
