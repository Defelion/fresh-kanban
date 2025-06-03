FROM node:22-alpine as base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN corepack prepare pnpm@latest --activate
COPY package.json ./
COPY pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:22-alpine as build
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN corepack prepare pnpm@latest --activate
COPY --from=base /app/package.json ./
COPY --from=base /app/pnpm-lock.yaml ./

COPY --from=base /app/node_modules ./node_modules
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./index.html
COPY vite.config.mts ./vite.config.mts
COPY tsconfig.json ./tsconfig.json
COPY tsconfig.app.json ./tsconfig.app.json
COPY tsconfig.node.json ./tsconfig.node.json
COPY env.d.ts ./env.d.ts
COPY .editorconfig ./.editorconfig
COPY .browserslistrc ./.browserslistrc
RUN pnpm run build
FROM nginx:1.27-alpine as production
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
