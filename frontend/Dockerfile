# Frontend de Three Angels Dental: solo NGINX.
# La carpeta "sitio" ya contiene la web lista (HTML, CSS, JavaScript e imágenes).
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY sitio/ /usr/share/nginx/html/
EXPOSE 80
