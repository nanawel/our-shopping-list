#!/bin/bash

IFS=$'\n'; for envVar in $(env | sort); do
  if [[ $envVar =~ VUE_APP_* ]]; then
    IFS='=' read k v <<< "$envVar"
    viteVar=$(echo ${k/VUE_APP_/VITE_APP_})
    if [ -z "${!viteVar}" ]; then
      echo >&2 "WARN Deprecated env variable found: $k"
      echo >&2 "     Replace it by $viteVar instead."
      export $viteVar=$v
    fi
  fi
done

echo "[docker-entrypoint.sh] Found the following VITE env variables:"
env | grep VITE

exec "$@"
