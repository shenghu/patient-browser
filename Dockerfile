FROM nginx:alpine

# support running as arbitrary user which belogs to the root group
RUN chmod -R g+rwx /var/cache/nginx /var/run /var/log/nginx

# users are not allowed to listen on priviliged ports
RUN sed -i.bak 's/listen\(.*\)80;/listen 8080;/' /etc/nginx/conf.d/default.conf
EXPOSE 8080

# comment user directive as master process is run as user in OpenShift anyhow
RUN sed -i.bak 's/^user/#user/' /etc/nginx/nginx.conf

COPY ./build /usr/share/nginx/html
RUN chmod -R g+rwx /usr/share/nginx 

user 1001

CMD ["sh", "-c", "nginx -g 'daemon off;'"]
