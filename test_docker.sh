export DOCKER_BUILDKIT=1
sudo systemctl restart containerd docker
docker compose build api
