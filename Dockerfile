# Utiliser une image de base de Node.js v20
FROM node:20

# Définir le répertoire de travail
WORKDIR /app

# Copier le package.json et le package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers de l'application
COPY . .

# Générer les fichiers Prisma Client
RUN npx prisma generate

# Exposer le port utilisé par l'application Next.js
EXPOSE 3000

# Commande pour démarrer l'application en mode développement
CMD ["npm", "run", "dev"]
