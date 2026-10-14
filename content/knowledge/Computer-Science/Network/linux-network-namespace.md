---
title: "리눅스 네트워크 네임스페이스와 ip 명령"
concept: "Network Namespace"
summary: "리눅스에서 네트워크 설정을 다루는 ip 명령의 구조와 출력 읽는 법(인터페이스 플래그·MTU·scope·라우팅 테이블), 한 호스트 안에 격리된 네트워크 공간을 만드는 네트워크 네임스페이스와 veth 쌍, 이것이 컨테이너 네트워크의 바탕이 되는 원리를 정리한다."
tags: ["network", "linux", "os", "devops", "virtualization"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/a6a43912cd6e485e9031fbc3969aa335", "https://80000coding.notion.site/4c0e1e36e7db4fb4a9c69c3073e89e9d", "https://80000coding.notion.site/54aafe0b4c2447dea6364de4dcc092b9", "https://www.man7.org/linux/man-pages/man8/ip-netns.8.html"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「리눅스 네트워크 네임스페이스 살펴보기」, 「ip 명령어 메세지 살펴보기」, 「서버 관리 맛보기」를 바탕으로 재구성한 노트입니다.

## ip 명령

`ip`(iproute2 패키지)는 리눅스의 네트워크 인터페이스, 주소, 라우팅을 보고 바꾸는 표준 도구다. 예전의 `ifconfig`·`route`·`arp`(net-tools)는 오래전에 유지보수가 멈춰 최신 배포판에는 기본 설치되지 않는다.

```text
ip [옵션] 객체 명령
         │     └ show(생략 가능)·add·del·set
         └ link(인터페이스) · address(주소) · route(라우팅) · neigh(ARP) · netns(네임스페이스)
```

| 하고 싶은 일 | 명령 |
| --- | --- |
| 인터페이스와 주소 보기 | `ip a` (`ip address show`), 짧게 `ip -br a` |
| 인터페이스 켜기·끄기 | `ip link set eth0 up` / `down` |
| 주소 붙이기 | `ip addr add 10.0.0.2/24 dev eth0` |
| 라우팅 테이블 보기 | `ip r` (`ip route show`) |
| 기본 게이트웨이 설정 | `ip route add default via 10.0.0.1` |
| 이 목적지로 어떻게 나가나 | `ip route get 8.8.8.8` |
| ARP 캐시(이웃 테이블) | `ip neigh` |

`ip`로 바꾼 설정은 **즉시 반영되지만 재부팅하면 사라진다.** 영구 설정은 배포판의 네트워크 관리 도구(netplan, NetworkManager의 `nmcli`, systemd-networkd, Debian의 `/etc/network/interfaces`)로 한다.

## 출력 읽기

```text
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP qlen 1000
    link/ether 02:ab:c7:6d:fe:70 brd ff:ff:ff:ff:ff:ff
    inet 192.168.42.101/24 brd 192.168.42.255 scope global dynamic eth0
       valid_lft 2724sec preferred_lft 2724sec
    inet6 fe80::5e:e7ff:fe6e:fe70/64 scope link
```

| 항목 | 뜻 |
| --- | --- |
| `eth0` | 인터페이스 이름. 요즘 배포판은 `enp0s3`처럼 장치 위치 기반 이름을 쓴다. `lo`는 자기 자신을 가리키는 루프백 |
| `<BROADCAST,MULTICAST>` | 브로드캐스트·멀티캐스트 지원 |
| `UP` / `LOWER_UP` | 관리자가 켰음 / 물리 링크(케이블)가 연결됨 |
| `mtu 1500` | 한 프레임에 실을 수 있는 최대 바이트. 이더넷 기본 1500, 루프백은 65536 |
| `qdisc` | 송신 큐 스케줄링 방식 (`noqueue`, `fq_codel` 등) |
| `state UP` | 동작 중. `DOWN`은 사용 불가, `UNKNOWN`은 상태를 알리지 않는 장치(루프백 등) |
| `link/ether` | MAC 주소, `brd`는 브로드캐스트 MAC |
| `inet 192.168.42.101/24` | IPv4 주소와 프리픽스 길이(서브넷 마스크 255.255.255.0) |
| `brd 192.168.42.255` | 이 서브넷의 브로드캐스트 주소 |
| `scope` | `host`: 이 호스트 안에서만, `link`: 같은 LAN에서만, `global`: 어디서나 유효 |
| `dynamic` | DHCP로 받은 주소. `valid_lft`·`preferred_lft`는 임대 남은 시간 |
| `inet6 fe80::…` | IPv6 링크 로컬 주소. 모든 IPv6 인터페이스가 자동으로 가진다 |

```text
default via 192.168.42.1 dev eth0
192.168.42.0/24 dev eth0 proto kernel scope link src 192.168.42.101
```

- 첫 줄: 아래 규칙에 안 걸리는 모든 목적지는 `eth0`으로 게이트웨이 `192.168.42.1`에 보낸다(기본 경로).
- 둘째 줄: 같은 서브넷은 게이트웨이 없이 직접 보낸다. 주소를 붙일 때 커널이 자동으로 만든 경로이고(`proto kernel`), 이때 출발지 주소로 `src`를 쓴다.
- 여러 규칙에 걸리면 **프리픽스가 가장 긴 규칙**이 이긴다([[network-layer|네트워크 계층 프로토콜]]의 라우팅 테이블).

## 네트워크 네임스페이스

네트워크 네임스페이스(network namespace)는 **인터페이스, IP 주소, 라우팅 테이블, 방화벽 규칙, 포트 공간을 통째로 따로 가진 격리된 네트워크 스택**이다. 호스트의 기본 네트워크도 하나의 네임스페이스(루트 네임스페이스)이고, 보통의 모든 프로세스가 이를 공유한다. 새 네임스페이스에 들어간 프로세스는 자기만의 `lo`와 라우팅 테이블만 본다. 같은 포트 80을 네임스페이스마다 따로 열 수 있다.

리눅스에는 네트워크 외에도 PID, 마운트, 사용자, UTS(호스트 이름), IPC, cgroup 네임스페이스가 있다. 이것들을 조합하고 cgroups로 자원을 제한한 것이 **컨테이너**다([[virtualization|가상화와 하이퍼바이저]]).

### 직접 만들어 보기

```text
루트 네임스페이스                         새 네임스페이스 web
[eth0]                                   [lo]
[veth0] 10.200.0.2/24 ◀──── veth 쌍 ────▶ [veth1] 10.200.0.3/24  ← nginx
```

```bash
sudo ip netns add web                              # 네임스페이스 생성 (/var/run/netns/web)
sudo ip link add veth0 type veth peer name veth1   # 가상 이더넷 쌍 생성
sudo ip link set veth1 netns web                   # 한쪽 끝을 web으로 옮김
sudo ip addr add 10.200.0.2/24 dev veth0
sudo ip link set veth0 up
sudo ip netns exec web ip addr add 10.200.0.3/24 dev veth1
sudo ip netns exec web ip link set veth1 up
sudo ip netns exec web ip link set lo up           # 새 네임스페이스는 lo도 꺼져 있다
sudo ip netns exec web nginx -g 'daemon off;'      # web 안에서 nginx 실행
curl 10.200.0.3                                    # 루트 네임스페이스에서 접속
```

- **veth**는 항상 쌍으로 만들어지는 가상 케이블이다. 한쪽에 넣은 패킷이 반대쪽으로 나온다. 서로 다른 네임스페이스를 잇는 기본 수단이다.
- 연결 전에는 web 안의 nginx에 `ip netns exec web curl 127.0.0.1`로만 접속할 수 있고, 호스트의 `127.0.0.1`과는 별개다.
- `ip netns exec web bash`로 들어가면 그 안에서 평소처럼 명령을 칠 수 있다. 네임스페이스 전용 `resolv.conf`는 `/etc/netns/web/`에 둔다.

### 컨테이너 네트워크로 확장

컨테이너가 여러 개면 veth의 호스트 쪽 끝을 모두 **리눅스 브리지**(가상 스위치, Docker의 `docker0`)에 꽂는다. 컨테이너끼리는 브리지로 통신하고, 바깥으로 나갈 때는 호스트가 출발지 주소를 자기 주소로 바꾸는 NAT(IP masquerade)를 한다. `docker run -p 8080:80`은 반대 방향의 목적지 NAT(포트 포워딩) 규칙을 추가하는 것이다. Kubernetes의 Pod 하나는 네트워크 네임스페이스 하나를 컨테이너 여럿이 공유하는 구조다.

## 정리

- `ip`는 `객체 명령` 구조이고, `ip a`·`ip r`·`ip -br a`가 가장 자주 쓰인다. `ip`로 한 설정은 재부팅하면 사라진다.
- 출력의 `UP`·`LOWER_UP`, `scope`, `dynamic`, 기본 경로 줄을 읽을 줄 알면 대부분의 연결 문제를 좁힐 수 있다.
- 네트워크 네임스페이스는 네트워크 스택 전체의 사본이다.
- **컨테이너 네트워크 = 네임스페이스 + veth 쌍 + 브리지 + NAT** 의 조합이다.

관련 노트: [[network-layer|네트워크 계층 프로토콜]], [[network-basics|네트워크 기초]], [[virtualization|가상화와 하이퍼바이저]], [[vm-vs-container|VM과 컨테이너]]
