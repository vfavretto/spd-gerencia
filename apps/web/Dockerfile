FROM nginx:alpine

# Remover configuracao padrao do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar configuracao customizada (como template para envsubst)
COPY apps/web/nginx.conf /etc/nginx/templates/default.conf.template

# Copiar arquivos estaticos ja buildados localmente
COPY apps/web/dist/ /usr/share/nginx/html/

# Railway injeta $PORT; fallback para 80
ENV PORT=80

EXPOSE 80

# nginx:alpine image automaticamente executa envsubst nos
# arquivos em /etc/nginx/templates/ e gera /etc/nginx/conf.d/
CMD ["nginx", "-g", "daemon off;"]
