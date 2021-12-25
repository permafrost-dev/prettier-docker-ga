FROM {{package.action.baseimage}}

LABEL "com.github.actions.name"="{{package.action.name}}"
LABEL "com.github.actions.description"="{{package.description}}"
LABEL "com.github.actions.icon"="{{package.action.icon}}"
LABEL "com.github.actions.color"="{{package.action.color}}"

LABEL "repository"="http://github.com/{{package.vendor.github}}/{{package.name}}"
LABEL "homepage"="http://github.com/actions"
LABEL "maintainer"="{{package.author.name}} <{{package.author.email}}>"

# TODO: install container specifics

ADD entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]