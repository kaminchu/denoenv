#!/usr/bin/env bash
set -e

exec_name=${0##*/}


if [ -e $(pwd)/.deno-version ]; then
  version=$(cat $(pwd)/.deno-version)
fi

versions_dir=$(dirname $0)/../versions


export DENO_INSTALL_ROOT=$versions_dir/$version
$versions_dir/$version/bin/$exec_name "$@"
