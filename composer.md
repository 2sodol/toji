services:
oracle11g:
image: oracleinanutshell/oracle-xe-11g
container_name: oracle11g
ports: - "1521:1521"
environment:
ORACLE_ALLOW_REMOTE: "true"
volumes: - oracle_data:/u01/app/oracle
shm_size: 2gb
restart: unless-stopped

volumes:
oracle_data:
name: oracle11g_data
driver: local
