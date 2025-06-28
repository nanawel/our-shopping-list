ARG node_version="22"
ARG node_variant="-alpine"
ARG build_version
ARG build_id
ARG build_date

FROM node:${node_version}${node_variant} as client-builder

RUN apk add git

COPY ./client/ /app/client

RUN cd /app/client \
  && yarn install \
  && NODE_ENV=production yarn build \
  && rm -rf /app/client/node_modules

FROM node:${node_version}${node_variant}

ARG build_version
ARG build_id
ARG build_date

RUN apk add --no-cache bash

WORKDIR /app
EXPOSE 8080

HEALTHCHECK --interval=1m --timeout=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${LISTEN_PORT:-8080}/${BASE_URL}/healthcheck || exit 1

COPY ./docker-entrypoint.sh /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]

CMD ["node", "index.js"]

COPY ./server/ /app
COPY --from=client-builder /app/client /app/client

RUN yarn install --production

# LABEL + ENV at the end to optimize layers cache during build
LABEL org.label-schema.name="Our Shopping List"
LABEL org.label-schema.vcs-url="https://github.com/nanawel/our-shopping-list"
LABEL org.label-schema.vendor="Anaël Ollier <nanawel@gmail.com>"
LABEL org.label-schema.version="${build_version}#${build_id}"
LABEL org.label-schema.build-date="${build_date}"

ENV APP_ENV=production
ENV APP_VERSION=${build_version}
ENV APP_BUILD_ID=${build_id}
ENV VITE_APP_I18N_LOCALE=en
ENV VITE_APP_I18N_FALLBACK_LOCALE=en
