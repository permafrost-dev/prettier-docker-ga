FROM node:16

LABEL "com.github.actions.name"="permafrost-prettier-docker-ga"
LABEL "com.github.actions.description"="run prettier on your code"
LABEL "com.github.actions.icon"="align-center"
LABEL "com.github.actions.color"="blue"

LABEL "repository"="http://github.com/permafrost-dev/prettier-docker-ga"
LABEL "homepage"="http://github.com/actions"
LABEL "maintainer"="Patrick Organ <patrick@permafrost.dev>"

# TODO: install container specifics

ADD entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]