#!/bin/bash

# halt script on error
set -ev

if [ "$TRAVIS_BRANCH" = "master" ] ; then
    netlify deploy -s 914901f4-03d3-4a52-b3ce-1a499b5f90f5 -a $NETLIFY_ACCESS_TOKEN -d ./dist --prod

elif [ "$TRAVIS_BRANCH" = "develop" ] ; then
    netlify deploy -s 47f96b73-9e2b-4d08-9935-767b12fdf79b -a $NETLIFY_ACCESS_TOKEN -d ./dist --prod

else
  echo "Build successful, but not publishing!"
fi