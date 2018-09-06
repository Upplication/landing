# Upplication Landing
[![Build Status](https://travis-ci.org/Upplication/landing.svg?branch=develop)](https://travis-ci.org/Upplication/landing)

```
$ git clone git@github.com:Upplication/landing.git
$ npm install
$ npm start
```

## Requirements
* [node](http://nodejs.org/)
* [npm](https://docs.npmjs.com/)

Also, it's recomendend (but not mandatory) installing
* [bower](http://bower.io/) `npm install -g bower`
* [gulp-cli](http://gulpjs.com/) `npm install -g gulp-cli`

## Installation
```
$ git clone git@github.com:Upplication/landing.git
$ npm install
```

## Running
```
$ npm start
```

Starts a local development environment which:
* Is accesible at http://localhost:9000.
* Watches changes in css, jade, js ... folders and compiles if it is necessary.
* Browser lives reload.

## Deployment
```
$ npm run deploy --type=production
```

Builds the project with optimization for distribution.

If you are going to upload the project to a folder different than root (/), you can use a parameter called `config.base_path` with the destination root path. Example `grunt deploy --config.base_path=/new` to make the static files points to the proper path.

## Documentation
This is a quick reference that aims to help you to learn how to add new languages and views on this project.

### Configure environment

The file `config.json` contains the definition of all the configuration needed by the project. This definitions are grouped by environment. You can activate one environemnt by calling the paramenter `env`. Example `npm run deploy -- --env=localhost` load all the vars defined in the localhost section. All this vars are available at:

* Jade templates by calling `#{localConfig.xxxx}`
* Saas files by calling `@@config`. (#{localConfig.} cant be use because saas define his own vars in that way)
* JSON i18n files by calling `@@config`.

You can override this vars passing the concrete key as parameter with the prefix `config.`. Example `npm run deploy -- --env=localhost --config.token_manager=1337 --type=production` load all the vars defined in the localhost section and override the token_manager var with the value `1337`

### Add a new view

1. *Adding template*: Create:

    `app/views/[view_name].jade`

2. *Adding styles*:

    - Create a less file: `app/styles/less/[view_name]/[name].less`
    - Add the new result css to the view. Example:
    ```
    link(rel='stylesheet', href='#{localConfig.base_path}/styles/[view_name]/[name].css')
    ```

3. *Adding scripts*:

    Scripts are concatenated by folder.
    - Create multiple js files inside a folder:
    ```
    app/scripts/[folder]/1.js
    app/scripts/[folder]/2.js
    app/scripts/[folder]/3.js
    ```
    - Add the new result js to the view. Example:
     ```
    script(type="text/javascript", src='#{localConfig.base_path}/scripts/[folder].js')
    ```

4. *Add translations*:

    Update all: `app/locales/[names]_[language_code]-[country-code].json` with:

    - Add a new object in the root with the name of the file added to the view without the extension [view_name]
    - Add the following keys to the object:
     - _url: the absoulte url for the view in the current language
     - _meta_title: seo
     - _meta_description: seo
     - _keywords: seo
     - _priority: sitemap priority

We use Oneskyapp.com to translate/review the texts. You can use the task: grunt oneskyExport to override the lang with the translations in: https://upplication.oneskyapp.com (you need the access key and secret key)

Notes:

* You don't need to follow this process in order to link external resources (blog, youtube videos, etc.) using the language file.
* Do not overwrite any other URL (you can check the languages files or the auto-generated routing.json file)
* All variables starting with "_" are mandatory
* You can split the translations as many files as you want, only respects the naming: [name]_[language_code]-[country-code]*.json

### Add a new language
1. *Add language*:

    Update: `app/locales/languages.json` adding the new language

2. *Add the translation file*:

    Create: `app/locales/[custom_name]_[language_code]-[country_code]*.json`

Language code list: http://www.w3schools.com/tags/ref_language_codes.asp
Country code list: https://www.w3schools.com/tags/ref_country_codes.asp (optional)

\* country code is optional.