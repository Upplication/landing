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
* Watch changes in sass, jade, ... folders and compiles if it is necessary
* Browser live's reload 

DEPLOYMENT
--------
`grunt build`

Builds the project:
Optimization for distribution.

DOCUMENTATION
--------
This is a quick reference that aims to help you to learn how to add new languages and views on this project.

## Add a new view
1. *URI definition*: 

    Update: `app/urls.json`

2. *Adding template*: Create: 

    `app/views/[view_name].jade`

3. *Adding styles*: 

    - Create: `app/styles/sass/[view_name].sass` using `app/styles/sass/_foo.sass` schema. 

    - Include your new sass file in `app/styles/sass/main.sass`

4. *Add translations*: 

    Update all: `app/locales/[contry_lang].json` schema in `app/locales/_foo.json`

Notes:

* You don't need to follow this process in order to link external resources (blog, youtube videos, etc.) using the language file.
* Do not overwrite any other URL (you can check the languages files or the auto-generated routing.json file)
* All variables starting with "_" are mandatory
* Links: To include links use the internationalized variables like `$.{section._url}` ex. #.{home._url}

## Add a new language
1. *Add language*: 

    Update: `app/locales/languages.json` adding the new language

2. *Add the translation file*: 

    Create: `app/locales/[country_language].json`