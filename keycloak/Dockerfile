FROM registry.gitlab.com/xdev-tech/xdev-enterprise-business-network/keycloak:0.2.0-develop.118
# clear existing extra theme
RUN rm -rf /opt/keycloak/themes/extra/
COPY themes/extra /opt/keycloak/themes/extra/
COPY configurator/* /tf/
