INSTALLATION
--------
Clone this repo and install the dependencies:

* [nodejs](http://nodejs.org/)
* [bower](http://bower.io/)
* [ruby](https://www.ruby-lang.org/)
* [sass](http://sass-lang.com/)
* [susy](http://susy.oddbird.net/)
* [Compass Core](http://compass-style.org/install/)
* [grunt-cli](http://gruntjs.com/getting-started)
* [Bower](http://bower.io/)
* Install node dependencies -- `npm install`
* Install project dependencies -- `bower install`

DEVELOPMENT
--------
`grunt server`

Starts development environment:
* Watch changes in sass, jade -> compile
* live reload browser

DEPLOYMENT
--------
`grunt build`

Builds the project:
* Unify/minify js & css

# How to


## Add a new view
1. *URI definition*: Update: urls.json
2. *Adding template*: Create: views/[view_name].jade
3. *Adding styles*: Create: styles/sass/[view_name].sass using styles/sass/_foo.sass schema. Add sass file to main.sass
4. *Add translations*: Update all: locales/[contry_lang].json schema in locales/_foo.json

Notes:

* You don't need to follow this process in order to link external resources (blog, youtube videos, etc.) using the language file.
* Do not overwrite any other URL (you can check the languages files or the auto-generated routing.json file)
* All de variable starting with "_" are mandatory
* Links: To include links use the internationalized variables like `$.{section._url}` ex. #.{home._url}

##New language
1. *Add language*: Update: locales/languages.json adding the new language
2. *Add the translation file*: Create: locales/[country_language].json