#!/bin/sh
set -eu

site_root=/usr/share/nginx/html
site_source=/opt/astauria/site
initialization_marker="$site_root/.astauria-initialized"

if [ ! -f "$initialization_marker" ]; then
    cp -a "$site_source/." "$site_root/"
    touch "$initialization_marker"
fi
