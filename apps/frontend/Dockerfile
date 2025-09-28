# ---------- build stage ----------
FROM node:20-alpine AS build
WORKDIR /workspace

# Copy lock + manifests for caching
COPY package*.json ./
COPY apps/frontend/package*.json apps/frontend/
RUN npm ci

# Copy sources
COPY . .

# Build the Angular app (adjust if your build target/path differs)
# This assumes "build" script exists and outputs to dist/apps/frontend or similar.
RUN npm run -w frontend build

# ---------- nginx stage ----------
FROM nginx:1.27-alpine
# Copy our nginx config
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built app to the web root (adjust the path if your output differs)
# Common Nx/Angular outputs:
#  - dist/apps/frontend/browser
#  - dist/frontend/browser
#  - dist/frontend
# Check your actual output folder and update the line below accordingly.
COPY --from=build /workspace/dist/apps/frontend/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx","-g","daemon off;"]
