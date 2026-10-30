---
title: "쿠버네티스 네트워킹: 서비스, DNS, Ingress, NetworkPolicy"
concept: "Kubernetes Networking"
summary: "파드마다 IP를 주는 네트워크 모델과 CNI, 서비스의 가상 IP가 kube-proxy(iptables·nftables·IPVS) 규칙으로 파드에 닿는 원리, 서비스 유형별 세부 동작, CoreDNS와 이름 해석, 외부로 나가는 트래픽, Ingress·Gateway API, NetworkPolicy, 서비스 메시(Istio·Linkerd), 연결·DNS 문제 진단을 정리한다."
tags: ["devops", "kubernetes", "network", "infra", "msa"]
source: other
date: "2026-10-30"
sources: ["https://github.com/fru1tworld/cs-basic/blob/main/interview/infrastructure/kubernetes.md", "https://kubernetes.io/docs/concepts/services-networking/", "https://kubernetes.io/docs/reference/networking/virtual-ips/", "https://kubernetes.io/docs/concepts/services-networking/network-policies/", "https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/", "https://gateway-api.sigs.k8s.io/", "https://istio.io/latest/docs/concepts/", "https://www.k8s.dev/resources/keps/5495/"]
---

> fru1tworld/cs-basic 모의 면접 질문 목록의 「[Kubernetes](https://github.com/fru1tworld/cs-basic/blob/main/interview/infrastructure/kubernetes.md)」 항목이 묻는 개념을 쿠버네티스·Gateway API·Istio 공식 문서로 확인해 정리한 노트다.

서비스 네 유형의 개요는 [[kubernetes-architecture|쿠버네티스 구조와 핵심 개념]]에, 클러스터 밖에서 파드까지의 요청 경로와 사이드카·앰비언트 메시의 비교는 [[kubernetes-request-path|쿠버네티스 위 웹 서비스의 요청 경로]]에 있다. 이 노트는 각 계층이 **어떻게** 동작하는지를 다룬다.

## 네트워크 모델과 CNI

쿠버네티스의 네트워크 모델은 세 가지를 요구한다.

1. 모든 파드는 클러스터 안에서 고유한 IP를 가진다.
2. 모든 파드는 다른 노드의 파드와도 **NAT 없이** 그 IP로 통신한다.
3. 노드의 에이전트(kubelet 등)는 그 노드의 모든 파드와 통신한다.

쿠버네티스는 이 모델을 직접 구현하지 않고 **CNI(Container Network Interface)** 플러그인에 맡긴다. 파드가 만들어질 때 런타임이 CNI 플러그인을 호출하면, 플러그인이 파드의 네트워크 네임스페이스에 veth 인터페이스를 만들고 IP를 배정(IPAM)하고 노드 사이 경로를 잡는다. 같은 노드 안 파드끼리는 노드의 브리지나 라우팅으로, 다른 노드의 파드와는 라우팅(BGP 등)이나 오버레이(VXLAN 캡슐화)로 통신한다. 파드 안에서 네트워크를 공유하는 pause 컨테이너는 [[kubernetes-architecture|구조 노트]], veth와 네임스페이스의 원리는 [[linux-network-namespace|리눅스 네트워크 네임스페이스와 ip 명령]]에 있다.

| CNI | 방식 | 특징 |
| --- | --- | --- |
| Flannel | VXLAN 오버레이 | 단순하고 가볍다. **NetworkPolicy를 강제하지 않는다** |
| Calico | BGP 라우팅 또는 VXLAN·IP-in-IP, eBPF 데이터플레인 선택 가능 | NetworkPolicy와 자체 확장 정책. 온프레미스에서 많이 쓴다 |
| Cilium | eBPF | kube-proxy 대체, L7(HTTP) 정책, Hubble로 흐름 관측. 관리형 클러스터의 기본값으로도 쓰인다 |
| 클라우드 VPC CNI (AWS VPC CNI, Azure CNI) | 파드에 VPC 대역 IP를 직접 준다 | 오버레이 없이 VPC 라우팅을 그대로 쓴다. 서브넷 IP가 빨리 소진될 수 있다 |

## 서비스가 파드에 닿는 원리

### EndpointSlice와 kube-proxy

서비스의 ClusterIP는 **어느 인터페이스에도 붙어 있지 않은 가상 IP**다. 핑에 응답하지 않는 것도 그래서다. 실제 전달은 두 구성 요소가 나눠 맡는다.

```text
EndpointSlice 컨트롤러: 셀렉터에 맞고 Ready인 파드 IP:포트 목록을 EndpointSlice에 기록
kube-proxy (노드마다):   Service·EndpointSlice를 watch → 노드 커널에 규칙을 심음
파드가 10.96.0.10:80 으로 보냄 → 커널 규칙이 목적지를 10.244.2.7:8080 (파드 하나)로 DNAT
```

kube-proxy 자체는 패킷을 중계하지 않는다. 커널에 규칙만 심고, 전달은 커널이 한다.

| 모드 | 방식 | 특징 |
| --- | --- | --- |
| `iptables` | 서비스·엔드포인트마다 iptables 체인을 만들고 확률 규칙으로 파드를 무작위로 고른다 | 오래된 기본값. 서비스가 수만 개면 규칙이 선형으로 늘어 갱신이 느려진다 |
| `nftables` | 리눅스 nftables의 맵(map)·집합으로 규칙을 표현 | 1.33에서 정식 기능. 대규모에서 갱신과 처리가 빠르다. 리눅스 노드의 권장 모드 |
| `ipvs` | 커널의 L4 로드 밸런서 IPVS의 해시 테이블 사용, rr·lc 같은 분배 알고리즘 선택 | 1.35에서 폐기 예정(deprecated)이 됐다. 새 클러스터는 nftables를 쓴다 |
| kube-proxy 대체 (Cilium 등) | eBPF 프로그램이 소켓·패킷 단계에서 직접 변환 | kube-proxy 없이 서비스 로드 밸런싱을 처리한다 |

### 서비스 유형별 세부 동작

| 유형 | 세부 동작 |
| --- | --- |
| ClusterIP | 서비스 CIDR에서 가상 IP를 받는다. 클러스터 안 서비스 간 통신의 기본 |
| NodePort | 모든 노드의 같은 포트(기본 범위 30000~32767, API 서버의 `--service-node-port-range`로 변경)로 받아 ClusterIP 규칙으로 넘긴다. 범위가 정해진 이유는 노드의 다른 포트와 충돌하지 않게 하기 위해서다 |
| LoadBalancer | cloud-controller-manager(또는 AWS Load Balancer Controller 같은 컨트롤러)가 서비스를 보고 클라우드 로드 밸런서를 만든다. 로드 밸런서는 노드의 NodePort나 파드 IP를 대상으로 등록하고, 받은 외부 주소를 `status.loadBalancer.ingress`에 기록한다. 온프레미스에서는 MetalLB 같은 구현이 필요하다 |
| ExternalName | 프록시나 IP 없이 클러스터 DNS가 지정한 외부 도메인으로 CNAME을 돌려준다. 클러스터 밖 DB를 클러스터 안 이름으로 부르다가, 나중에 클러스터 안으로 옮겨도 클라이언트 설정을 바꾸지 않게 한다. HTTP Host 헤더·TLS 인증서 이름은 원래 도메인과 달라질 수 있어 주의한다 |
| 헤드리스 (`clusterIP: None`) | 가상 IP와 kube-proxy 규칙이 없고, DNS가 Ready 파드들의 IP를 A 레코드로 바로 돌려준다. StatefulSet 멤버를 이름으로 찾는 방법이다([[kubernetes-workloads\|쿠버네티스 워크로드]]) |

`externalTrafficPolicy`는 외부 트래픽의 경로를 정한다. `Cluster`(기본)는 어느 노드로 들어와도 아무 파드로 보내지만 다른 노드로 한 번 더 건너가고 출발지 IP가 노드 IP로 바뀐다(SNAT). `Local`은 파드가 있는 노드만 트래픽을 받아 **클라이언트 IP를 보존**하고 홉을 줄이는 대신, 노드별 파드 수가 고르지 않으면 부하가 치우친다.

## DNS: 이름으로 서비스 찾기

클러스터 DNS는 kube-system 네임스페이스의 **CoreDNS**(서비스 이름은 호환을 위해 `kube-dns`)가 맡는다. 파드의 `/etc/resolv.conf`는 kubelet이 이 DNS 서버와 검색 도메인으로 채운다.

| 대상 | 이름 | 응답 |
| --- | --- | --- |
| 서비스 | `api.shop.svc.cluster.local` | ClusterIP (헤드리스면 파드 IP들) |
| 이름 붙은 포트 | `_http._tcp.api.shop.svc.cluster.local` | SRV 레코드(포트 번호) |
| StatefulSet 파드 | `db-0.db.shop.svc.cluster.local` | 그 파드의 IP |

```text
# 파드 안의 /etc/resolv.conf
nameserver 10.96.0.10
search shop.svc.cluster.local svc.cluster.local cluster.local
options ndots:5
```

같은 네임스페이스에서는 `api`, 다른 네임스페이스는 `api.shop`만 써도 검색 도메인이 붙어 풀린다. 다만 `ndots:5`는 점이 5개 미만인 이름을 먼저 검색 도메인을 붙여 시도하게 하므로, `api.example.com` 같은 외부 이름 하나에 실패 질의가 여러 번 먼저 나간다. 외부 호출이 많으면 끝에 점을 붙인 FQDN(`api.example.com.`)을 쓰거나 파드의 `dnsConfig`로 ndots를 낮추고, 노드마다 DNS 캐시를 두는 NodeLocal DNSCache로 CoreDNS 부하를 줄인다. DNS 자체의 동작은 [[dns|DNS]]에 있다.

## 파드에서 외부로 나가는 트래픽

```text
파드(10.244.2.7) → 노드의 라우팅 → 노드에서 SNAT(masquerade): 출발지를 노드 IP로
  → (프라이빗 서브넷이면) NAT 게이트웨이에서 공인 IP로 다시 변환 → 외부 서비스
응답은 변환 테이블(conntrack)을 거슬러 파드로 돌아온다
```

외부 서비스가 IP 허용 목록을 요구하면 출발지가 노드마다 달라지므로, NAT 게이트웨이의 고정 IP나 CNI·서비스 메시의 이그레스 게이트웨이로 나가는 경로를 하나로 모은다. VPC 쪽 NAT 게이트웨이는 [[aws-vpc-networking|AWS VPC 네트워크 구성]]에 있다.

## Ingress

서비스는 L4(IP·포트)까지만 다룬다. **Ingress는 HTTP(S) 요청을 호스트 이름과 경로에 따라 여러 서비스로 나누는 L7 라우팅 규칙**이다. 외부 진입점 하나(로드 밸런서 하나)로 여러 서비스를 노출할 수 있어, 서비스마다 LoadBalancer를 만드는 비용을 줄인다.

Ingress 리소스는 규칙일 뿐이고, 규칙을 읽어 실제 프록시를 설정하는 **Ingress 컨트롤러**를 따로 설치해야 동작한다. `ingressClassName`으로 어느 컨트롤러가 처리할지 고른다.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: shop
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt   # cert-manager가 인증서 발급
spec:
  ingressClassName: traefik
  tls:
    - hosts: [shop.example.com, api.example.com]
      secretName: shop-tls                        # kubernetes.io/tls 타입 Secret
  rules:
    - host: shop.example.com                      # 호스트 기반
      http:
        paths:
          - { path: /, pathType: Prefix, backend: { service: { name: web, port: { number: 80 } } } }
    - host: api.example.com
      http:
        paths:
          - { path: /v1, pathType: Prefix, backend: { service: { name: api-v1, port: { number: 80 } } } }   # 경로 기반
```

- `pathType`은 `Prefix`(경로 구간 단위 접두사), `Exact`(정확히 일치), `ImplementationSpecific`(컨트롤러 마음대로)이다.
- **TLS**: 인증서와 키를 `kubernetes.io/tls` Secret에 넣고 `spec.tls`에서 가리키면 컨트롤러가 TLS를 종료한다. **cert-manager**는 Issuer·ClusterIssuer(Let's Encrypt 같은 ACME, 사설 CA)를 정의해 두면, 어노테이션이나 Certificate 리소스를 보고 인증서를 받아 Secret에 넣고 만료 전에 갱신한다.
- **어노테이션**: 리라이트, 레이트 리밋, 타임아웃, CORS 같은 기능은 Ingress 명세에 없어 컨트롤러별 어노테이션(예: Ingress NGINX의 `nginx.ingress.kubernetes.io/rewrite-target`, `limit-rps`)으로 켰다. 어노테이션은 컨트롤러마다 달라 이식되지 않고 검증도 약하다. 이것이 Gateway API가 나온 이유다.

| 컨트롤러 | 특징 |
| --- | --- |
| Ingress NGINX (커뮤니티) | 가장 널리 쓰였으나 2026년 3월 유지보수가 끝났다. 새로 쓰지 않는다 |
| F5 NGINX Ingress Controller | NGINX 사가 만든 별개의 구현. 자체 CRD로 기능을 확장한다 |
| Traefik | 설정을 동적으로 반영하고 미들웨어·Let's Encrypt를 내장한다. Gateway API도 구현한다 |
| HAProxy Ingress | HAProxy 기반. 높은 처리량과 세밀한 부하 분산 |
| 클라우드 컨트롤러 (AWS Load Balancer Controller, GKE Ingress) | Ingress마다 클라우드 L7 로드 밸런서(ALB 등)를 만든다 |
| Envoy 기반 (Envoy Gateway, Contour, Istio) | Gateway API 중심 |

### Gateway API

**Gateway API는 Ingress의 후속 표준**이다. Ingress API는 기능 추가가 멈췄고, 새 기능은 Gateway API에 들어간다.

| | Ingress | Gateway API |
| --- | --- | --- |
| 리소스 | Ingress 하나에 진입점과 라우팅을 함께 | GatewayClass(인프라 제공자) · Gateway(클러스터 운영자: 리스너·포트·TLS) · HTTPRoute 등(앱 개발자: 라우팅)으로 **역할별 분리** |
| 프로토콜 | HTTP(S) | HTTP, gRPC, TLS, TCP·UDP 라우트 |
| 고급 기능 | 컨트롤러별 어노테이션 | 가중치 분배(카나리), 헤더·쿼리 매칭, 요청 미러링, 헤더 수정이 명세에 있다 |
| 네임스페이스 | 같은 네임스페이스의 서비스만 | ReferenceGrant로 허용하면 다른 네임스페이스의 라우트·서비스를 잇는다 |

## NetworkPolicy

**NetworkPolicy는 파드 사이 L3·L4(IP·포트) 트래픽을 허용 목록으로 제한하는 네임스페이스 단위 방화벽**이다.

- **기본은 모두 허용**이다. 어떤 정책도 고르지 않은 파드는 누구와도 통신한다.
- 한 파드가 어떤 정책의 `podSelector`에 걸리고 그 정책의 `policyTypes`에 Ingress(또는 Egress)가 있으면, 그 방향은 **정책들이 허용한 것만** 통과한다. 정책은 더해지기만 하고 「거부」 규칙은 없다.
- 상대는 `podSelector`, `namespaceSelector`, `ipBlock`(CIDR)으로, 포트는 `ports`로 지정한다.

```yaml
# 1. 네임스페이스의 모든 파드에 들어오는 트래픽 기본 거부
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: default-deny-ingress, namespace: shop }
spec:
  podSelector: {}
  policyTypes: [Ingress]
---
# 2. web 파드에서 api 파드의 8080만 허용
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: api-from-web, namespace: shop }
spec:
  podSelector: { matchLabels: { app: api } }
  policyTypes: [Ingress]
  ingress:
    - from: [{ podSelector: { matchLabels: { app: web } } }]
      ports: [{ protocol: TCP, port: 8080 }]
```

| 함정 | 설명 |
| --- | --- |
| CNI가 지원하지 않는다 | NetworkPolicy는 CNI가 강제한다. Flannel만 쓰면 정책을 만들어도 **오류 없이 무시된다** |
| Egress 기본 거부 후 DNS가 막힌다 | 이그레스를 막으면 CoreDNS로 가는 UDP·TCP 53도 막히므로 따로 허용한다 |
| `from` 안의 셀렉터 조합 | 한 항목 안의 `namespaceSelector`와 `podSelector`는 AND, 별개 항목으로 나누면 OR다 |
| L7 규칙 | HTTP 경로·메서드 단위 제어는 표준 NetworkPolicy로 안 된다. Cilium 정책이나 서비스 메시의 인가 정책을 쓴다 |

RBAC가 **쿠버네티스 API에 대한 사람·프로그램의 접근**을 제어한다면, NetworkPolicy는 **파드 사이 네트워크 접근**을 제어한다. RBAC는 [[kubernetes-security|쿠버네티스 보안]]에 있다.

## 서비스 메시

**서비스 메시는 서비스 간 트래픽을 프록시 계층에 통과시켜, 앱 코드를 고치지 않고 트래픽 제어·보안(mTLS)·관측을 붙이는 인프라 계층**이다. 서비스가 많아지면 재시도·타임아웃·서킷 브레이커·인증·지표를 언어마다 라이브러리로 넣기 어려워 플랫폼으로 내린다.

```text
컨트롤 플레인 (istiod)  ── 설정·인증서 배포 (xDS) ──▶ 데이터 플레인 프록시들
                                                     앱 A ⇄ 프록시 ⇄ (mTLS) ⇄ 프록시 ⇄ 앱 B
```

사이드카 프록시는 iptables 규칙(또는 CNI 플러그인)으로 파드의 들고 나는 트래픽을 모두 가로채, 앱은 평문으로 `http://b`를 불러도 프록시끼리 mTLS로 통신한다. 사이드카와 앰비언트(노드 공용 프록시) 방식의 비교는 [[kubernetes-request-path|요청 경로 노트]]에 있다.

### Istio

| 구성 요소 | 역할 |
| --- | --- |
| Envoy | 데이터 플레인 프록시. 사이드카 방식에서 파드마다 주입된다. 앰비언트 방식은 노드의 ztunnel(L4)과 필요한 곳의 waypoint(Envoy, L7)를 쓴다 |
| istiod | 컨트롤 플레인 단일 바이너리. 서비스 정보를 모아 프록시 설정으로 내려보내고(옛 Pilot), 워크로드 인증서를 발급·교체하는 CA 역할(옛 Citadel)을 한다 |

| 리소스 | 역할 |
| --- | --- |
| VirtualService | **어디로 보낼지**: 경로·헤더 매칭, 버전별 가중치 분배(90:10 카나리), 재시도, 타임아웃, 장애 주입 |
| DestinationRule | **도착한 뒤 어떻게 보낼지**: 라벨로 서브셋(v1·v2) 정의, 로드 밸런싱 방식, 커넥션 풀, 이상치 감지(서킷 브레이커), 대상 TLS 설정 |
| PeerAuthentication | 서비스 간 mTLS 모드. `STRICT`는 mTLS만 받고, `PERMISSIVE`는 이전 기간용으로 평문도 받는다 |
| AuthorizationPolicy | mTLS로 확인한 상대의 신원(서비스 계정 기반 SPIFFE ID), 네임스페이스, HTTP 메서드·경로로 허용·거부 |

라우팅은 Istio 전용 리소스 대신 Gateway API의 HTTPRoute로도 쓸 수 있다.

### Linkerd

| | Istio | Linkerd |
| --- | --- | --- |
| 프록시 | Envoy (범용, C++) | 메시 전용으로 Rust로 만든 경량 프록시 |
| 철학 | 기능이 넓고 설정 항목이 많다 | 단순함과 낮은 자원 사용. 설치하면 mTLS가 기본으로 켜진다 |
| 모드 | 사이드카, 앰비언트 | 사이드카 |
| 트래픽 제어 | 풍부(장애 주입, 미러링, 세밀한 정책) | 재시도·타임아웃·트래픽 분할 등 핵심 위주 |
| 배포판 | 오픈 소스 정식 릴리스 | 오픈 소스는 edge 릴리스, 안정 릴리스는 Buoyant의 배포판으로 제공 |

메시가 필요 없는 규모라면 도입하지 않는 편이 낫다. 프록시 비용과 운영 복잡도가 생기기 때문이다. mTLS만 필요하면 앰비언트 L4 모드나 Cilium의 기능으로도 충분할 수 있다.

## 연결 문제 진단

### 서비스로 파드에 닿지 않을 때

```bash
kubectl get svc api -o wide                                   # selector, port, targetPort
kubectl get endpointslices -l kubernetes.io/service-name=api  # 엔드포인트가 비었나
kubectl get pods -l app=api --show-labels                     # 라벨이 셀렉터와 맞나, READY인가
kubectl run tmp --rm -it --image=busybox:1.37 -- wget -qO- http://api:80/healthz
```

| 증상 | 원인 |
| --- | --- |
| 엔드포인트가 비었다 | 셀렉터와 파드 라벨 불일치, 또는 파드가 readiness 실패로 Ready가 아님 |
| 엔드포인트는 있는데 연결 거부 | `targetPort`가 컨테이너가 실제로 듣는 포트와 다름, 앱이 `127.0.0.1`에만 바인드 |
| 타임아웃 | NetworkPolicy 차단, 다른 네임스페이스 이름을 짧게 씀 |
| 파드 IP로는 되고 서비스 IP로는 안 된다 | kube-proxy·CNI 이상. 노드의 kube-proxy 로그 확인 |

### DNS 문제

```bash
kubectl get pods -n kube-system -l k8s-app=kube-dns           # CoreDNS가 떠 있나
kubectl logs -n kube-system -l k8s-app=kube-dns
kubectl exec -it <파드> -- cat /etc/resolv.conf               # nameserver가 kube-dns IP인가
kubectl run dnstest --rm -it --image=busybox:1.37 -- nslookup kubernetes.default
```

이름은 안 풀리고 IP로는 되면 DNS 문제다. CoreDNS 파드 상태, 이그레스 정책의 53번 포트 허용, CoreDNS 설정(ConfigMap `coredns`)의 업스트림 DNS, `ndots`로 인한 지연을 차례로 본다.

## 정리

- 쿠버네티스는 「모든 파드가 NAT 없이 서로 통신」이라는 모델만 정하고 구현은 CNI에 맡긴다.
- 서비스의 ClusterIP는 가상 IP다. kube-proxy가 EndpointSlice를 보고 커널에 DNAT 규칙을 심는다. 새 클러스터는 nftables 모드를 쓰고, IPVS는 폐기 예정이다.
- 이름 해석은 CoreDNS가 맡고, `ndots:5` 때문에 외부 이름 조회에 질의가 늘 수 있다.
- Ingress는 컨트롤러가 있어야 동작하는 L7 규칙이고, 후속 표준은 역할별로 나뉜 Gateway API다.
- NetworkPolicy는 기본 허용에서 출발하는 허용 목록 방화벽이며, CNI가 지원해야 효과가 있다.
- 서비스 메시는 프록시로 mTLS·트래픽 제어·관측을 앱 밖에서 처리한다.

관련 노트: [[kubernetes-architecture|쿠버네티스 구조와 핵심 개념]], [[kubernetes-request-path|쿠버네티스 위 웹 서비스의 요청 경로와 구성 요소]], [[kubernetes-workloads|쿠버네티스 워크로드와 파드 생명주기]], [[kubernetes-security|쿠버네티스 보안]], [[linux-network-namespace|리눅스 네트워크 네임스페이스와 ip 명령]], [[dns|DNS]], [[deployment-strategies|배포 전략]]
