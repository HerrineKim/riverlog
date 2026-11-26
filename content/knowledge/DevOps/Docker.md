---
title: "Docker"
concept: "Docker"
summary: "가상 머신과 컨테이너의 차이, Dockerfile, Compose, 네트워크·볼륨, 운영 중의 자원 제한과 보안."
tags: ["devops","docker","container"]
source: mixed
date: "2026-11-26"
---

Docker 노트는 프로세스를 이미지로 포장해 어디서나 같게 실행하는 법을 다룬다. 가상 머신과의 차이, Dockerfile, Compose, 네트워크와 볼륨, 운영할 때의 자원 제한·보안·로그가 여기 있다.

## 하위 노트

- [VM과 컨테이너](DevOps/Docker/vm-vs-container.md): VM과 Docker 컨테이너 비교, 오케스트레이션·오토 스케일링과 쿠버네티스가 표준이 된 이유
- [Dockerfile 작성과 컨테이너의 PID 1](DevOps/Docker/dockerfile.md): 이미지와 컨테이너, RUN·CMD·ENTRYPOINT, Alpine vs Debian, 컨테이너가 바로 꺼지는 이유와 tini
- [Docker Compose: 여러 컨테이너 묶어 띄우기](DevOps/Docker/docker-compose.md): compose.yaml의 주요 키, 네트워크 드라이버, named volume·bind mount, 점검 명령
- [Docker 네트워크와 볼륨](DevOps/Docker/docker-network-volume.md): 네트워크 드라이버와 bridge 원리, 사용자 정의 네트워크·내장 DNS, -p와 EXPOSE, 통신 제한, 볼륨·바인드 마운트·tmpfs, 볼륨 수명·드라이버, 스토리지 드라이버
- [Docker 컨테이너 운영: 자원 제한, 보안, 로그, 장애 진단](DevOps/Docker/docker-container-operations.md): cgroups 자원 제한과 CPU 스로틀링·OOM, 비root·rootless·capability·seccomp, Docker 소켓·DinD 위험, 로그 회전, 종료 코드·재시작 정책·정리
