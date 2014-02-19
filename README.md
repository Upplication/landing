Upplication landing page
=======

TODO: New Upplication Landing Page.
This is project builds an static and internationalized page.

Requirements
============
grunt
bower
ruby
sass
 * Compass
 * Sussy

Install
============

HOW TO
============
TODO:
Add a new view
------------
Note: you don't need to follow this process in order to link external resources (blog, youtube videos, etc.) using the language file.

* URI
Update: urls.json

* Template
Create: views/[view_name].jade

* Styles
Create: styles/sass/[view_name].sass using styles/sass/_foo.sass schema
Add sass file to main.sass

* Localization
Update all: locales/[contry_lang].json schema in locales/_foo.json
Notes:
  - Do not overwrite any other URL (you can check the languages files or the auto-generated routing.json file)
  - All de variable starting with "_" are mandatory

* Links
Create a link using $.{section._url} translation

New language
-------------------
Update: locales/languages.json adding the new language

Add the translation file: locales/[country_language].json