#!/bin/bash
if [ ! -f /root/.ssh/id_rsa ]; then
    ssh-keygen -t rsa -f /root/.ssh/id_rsa -N ''
    cat /root/.ssh/id_rsa.pub >> /root/.ssh/authorized_keys
fi

# 추가명령 실행하여 커스텀시.
if [[ "$#" -ne 0 ]]; then
    exec "$@"
fi