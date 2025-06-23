#!/bin/sh

IFS=$'\n'; for envVar in $(env | sort); do
  if [[ $envVar =~ VUE_APP_* ]]; then
    IFS='=' read k v <<< "$envVar"
    viteVar=$(echo ${k/VUE_APP_/VITE_})
    if [ -z "$(eval $viteVar)" ]; then
      echo >&2 "WARN Deprecated env variable found: $k"
      echo >&2 "     Replace it by $viteVar instead."
      export $viteVar=$v
    fi
  fi
done

env | grep VITE

exec "$@"
