ARG node_version="15"
ARG node_variant="-alpine"
ARG build_version
ARG build_id
ARG build_date

FROM node:${node_version}${node_variant} as client-builder

COPY ./client/ /app/client

RUN cd /app/client \
  && yarn install \
  && yarn build

FROM node:${node_version}${node_variant}

ARG build_version
ARG build_id
ARG build_date

LABEL org.label-schema.name="Our Shopping List"
LABEL org.label-schema.vcs-url="https://github.com/nanawel/our-shopping-list"
LABEL org.label-schema.vendor="Anaël Ollier <nanawel@gmail.com>"
LABEL org.label-schema.version="${build_version}#${build_id}"
LABEL org.label-schema.build-date="${build_date}"

ENV APP_VERSION=${build_version}
ENV APP_BUILD_ID=${build_id}

WORKDIR /app
EXPOSE 8080

COPY ./server/ /app
COPY --from=client-builder /app/client /app/client

RUN yarn install --production

CMD [ "node", "server.js" ]
