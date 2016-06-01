#!/usr/bin/env sh

# halt script on error
bash set -e

zip -r website.zip dist

if [[ $TRAVIS_BRANCH == "master" && $TRAVIS_PULL_REQUEST == "false" ]]
then
    curl -H "Content-Type: application/zip" \
        -H "Authorization: Bearer $token" \
        --data-binary "@website.zip" \
        https://api.netlify.com/api/v1/sites/landing-upplication/deploys
    echo "Build successful, publishing in production environment!"

elif [[ $TRAVIS_BRANCH == "develop" && $TRAVIS_PULL_REQUEST == "false" ]]
then
    curl -H "Content-Type: application/zip" \
            -H "Authorization: Bearer $token" \
            --data-binary "@website.zip" \
            https://api.netlify.com/api/v1/sites/landing-dev-upplication/deploys
    echo "Build successful, publishing in develop environment!"

else
  echo "Build successful, but not publishing!"
fi