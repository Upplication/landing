INSTALLATION
--------
Clone this repo and install the dependencies:

* [nodejs](http://nodejs.org/)
* [bower](http://bower.io/) `npm install -g bower`
* [grunt-cli](http://gruntjs.com/getting-started) `npm install -g grunt-cli`
* Install node dependencies -- `npm install`
* Install project dependencies -- `bower install`

DEVELOPMENT
--------
`grunt server`

Starts development environment:
* Watch changes in css, jade, js ... folders and compiles if it is necessary
* Browser live's reload 

DEPLOYMENT
--------
`grunt deploy`

If you are going to upload the project to a folder different than root (/), you can use a parameter called `config.base_path` with the destination root path. Example `grunt deploy --config.base_path=/new` to make the static files points to the proper path.

Builds the project:
Optimization for distribution.

UPDATE GH-PAGES
--------
Run this: `grunt upplication --path="https://raw.github.com/Upplication/landing/gh-pages"`
Go to: [http://upplication.github.io/landing](http://upplication.github.io/landing)

DOCUMENTATION
--------
This is a quick reference that aims to help you to learn how to add new languages and views on this project.

## Configure environment

The file config.json contains the definition of all the configuration needed by the project. This definitions are grouped by environment. You can activate one environemnt by calling the paramenter `env`. Example `grunt deploy --env=localhost` load all the vars defined in the localhost section. All this vars are available at:

* Jade templates by calling `#{localConfig.xxxx}`
* Saas files by calling `@@config`. (#{localConfig.} cant be use because saas define his own vars in that way)
* Jade i18n files by calling `@@config`.

You can override this vars passing the concrete key as parameter with the prefix `config.`. Example `grunt deploy --env=localhost --config.token_manager=1337` load all the vars defined in the localhost section and override the token_manager var with the value `1337`

## Add a new view
1. *URI definition*: 

    Update: `app/urls.json`

2. *Adding template*: Create: 

    `app/views/[view_name].jade`

3. *Adding styles*: 

    - Create: `app/styles/css/[view_name]/[name].css`
    - Add all the new css to the view with a 'usemin css block'. Example:
    ```
    // build:css({.tmp, app}) /styles/[view_name].min.css
    link(rel='stylesheet', href='/styles/css/[view_name]/first.css')
    link(rel='stylesheet', href='/styles/css/[view_name]/second.css')
    // endbuild
    ```
    - TODO: use less

4. *Add translations*: 

    Update all: `app/locales/[contry_lang].json` with:

    - First we must create the block for the view. This block must be named just like the key added in urls.json
    - Add the following keys to the block:
    -- _url: the absoulte url for the json lang
    -- _template: it must named just like the key added in urls.json and the block name. (TODO: eliminar y pensar como cargar el nombre del bloque en que estamos dinamicamente).
    -- _meta_title: seo
    -- _meta_description: seo
    -- _canonical: original url (TODO borrar canonical de los json de idioma ya que ahora en el base se carga dinamicamente como canoncial la española).
    -- _keywords: seo

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

Country language list: http://www.w3schools.com/tags/ref_language_codes.asp