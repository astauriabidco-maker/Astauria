FROM nginx:alpine

# Copier tous les fichiers statiques (HTML, CSS, JS) dans le dossier nginx
COPY . /usr/share/nginx/html

# Exclure le dossier cms pour éviter d'alourdir l'image inutilement
RUN rm -rf /usr/share/nginx/html/cms
RUN rm -f /usr/share/nginx/html/Dockerfile

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
