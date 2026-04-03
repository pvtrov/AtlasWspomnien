FROM node:22-alpine

WORKDIR /app

RUN corepack enable

EXPOSE 3000

CMD ["sh", "-c", "if [ -f package.json ]; then pnpm install && pnpm dev --hostname 0.0.0.0 --port 3000; else echo 'Frontend scaffold not created yet. Container is ready for the future Next.js app.' && tail -f /dev/null; fi"]
