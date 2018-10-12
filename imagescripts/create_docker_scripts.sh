#!/bin/bash

set -o errexit

readonly DOCKER_SCRIPT_DIR=$VOLUMERIZE_HOME

DOCKER_CONTAINERS=""
RANCHER_SERVICES=""

cat > ${VOLUMERIZE_SCRIPT_DIR}/stopContainers <<_EOF_
#!/bin/bash

set -o errexit
_EOF_

if [ -n "${VOLUMERIZE_CONTAINERS}" ]; then
  DOCKER_CONTAINERS=${VOLUMERIZE_CONTAINERS}
  for container in $DOCKER_CONTAINERS
  do
    cat >> ${VOLUMERIZE_SCRIPT_DIR}/stopContainers <<_EOF_
docker stop ${container}
_EOF_
    # preprend (to insert containers in reverse order in start script)
    echo -e "docker start ${container}\n$(cat ${VOLUMERIZE_SCRIPT_DIR}/startContainers)" > ${VOLUMERIZE_SCRIPT_DIR}/startContainers
  done
  echo -e "#!/bin/bash\n\nset -o errexit\n$(cat ${VOLUMERIZE_SCRIPT_DIR}/startContainers)" > ${VOLUMERIZE_SCRIPT_DIR}/startContainers
elif
[ -n "${VOLUMERIZE_SERVICES}" ]; then
  RANCHER_SERVICES=${VOLUMERIZE_SERVICES}
  for service in $RANCHER_SERVICES
  do
    cat >> ${VOLUMERIZE_SCRIPT_DIR}/stopServices <<_EOF_
rancher stop ${service}
_EOF_
    # preprend (to insert containers in reverse order in start script)
    echo -e "rancher start ${service}\n$(cat ${VOLUMERIZE_SCRIPT_DIR}/startServices)" > ${VOLUMERIZE_SCRIPT_DIR}/startServices
  done
  echo -e "#!/bin/bash\n\nset -o errexit\n$(cat ${VOLUMERIZE_SCRIPT_DIR}/startServices)" > ${VOLUMERIZE_SCRIPT_DIR}/startServices
fi

if [ -n "${RANCHER_URL}" ] && [ -n "${RANCHER_ACCESS_KEY}" ] && [ -n "${RANCHER_ACCESS_SECRET}" ]; then
       RANCHER_URL=${RANCHER_URL}
       RANCHER_ACCESS_KEY=${RANCHER_ACCESS_KEY}
       RANCHER_ACCESS_SECRET=${RANCHER_ACCESS_SECRET}
     readonly rancherconfig="/root/.rancher/cli.json"
     touch ${rancherconfig}
     cat >> ${rancherconfig} <<_EOF_
{"accessKey":"${RANCHER_ACCESS_KEY}","secretKey":"${RANCHER_ACCESS_SECRET}","url":"http://${RANCHER_URL}/v2-beta/schemas"}
_EOF_
fi