ARG node_version="16"
ARG node_variant="-alpine"
ARG build_version
ARG build_id
ARG build_date

FROM node:${node_version}${node_variant} as client-builder

RUN apk update \
 && apk add git

COPY ./client/ /app/client

RUN cd /app/client \
  && yarn install \
  && NODE_ENV=production yarn build

FROM node:${node_version}${node_variant}

ARG build_version
ARG build_id
ARG build_date

WORKDIR /app
EXPOSE 8080

HEALTHCHECK --interval=1m --timeout=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/healthcheck || exit 1

CMD [ "node", "index.js" ]

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
ENV VUE_APP_I18N_LOCALE=en
ENV VUE_APP_I18N_FALLBACK_LOCALE=en
