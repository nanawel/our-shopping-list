ARG node_version="15"
ARG node_variant="-alpine"
ARG version
ARG build_id

FROM node:${node_version}${node_variant} as client-builder

COPY ./client/ /app/client

RUN cd /app/client \
  && yarn install \
  && yarn build

FROM node:${node_version}${node_variant}

ARG version
ARG build_id

LABEL app-name="Our Shopping List"
LABEL maintainer="Anaël Ollier <nanawel@gmail.com>"

ENV APP_VERSION=${version}
ENV APP_BUILD_ID=${build_id}

COPY ./ /app
COPY --from=client-builder /app/client /app/client

WORKDIR /app

RUN yarn install --production

CMD [ "node", "server.js" ]
EXPOSE 8080