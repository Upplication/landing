#!/bin/bash

# halt script on error
set -ev

zip -r website.zip dist

if [ "$TRAVIS_BRANCH" = "master" ] ; then
    curl -H "Content-Type: application/zip" \
        -H "Authorization: Bearer $token" \
        --data-binary "@website.zip" \
        https://api.netlify.com/api/v1/sites/914901f4-03d3-4a52-b3ce-1a499b5f90f5/deploys
    echo "Build successful, publishing in production environment!"

elif [ "$TRAVIS_BRANCH" = "develop" ] ; then
    curl -H "Content-Type: application/zip" \
            -H "Authorization: Bearer $token" \
            --data-binary "@website.zip" \
            https://api.netlify.com/api/v1/sites/47f96b73-9e2b-4d08-9935-767b12fdf79b/deploys
    echo "Build successful, publishing in develop environment!"

else
  echo "Build successful, but not publishing!"
fi