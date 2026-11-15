---
title: "객체 설계 6개와 시스템 설계 읽을거리"
concept: "OOD System Design References"
summary: "OOD 여섯 문제, 추가 시스템 설계 질문, 실전 아키텍처·기업 엔지니어링 자료와 역사적 지연 시간 부록."
tags: ["backend", "system-design", "object-oriented-design", "architecture", "reference"]
source: other
date: "2026-11-15"
sources: ["https://github.com/donnemartin/system-design-primer", "https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/README.md", "https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/solutions/system_design/pastebin/README.md"]
---

> Donne Martin의 「[The System Design Primer](https://github.com/donnemartin/system-design-primer)」에 제시된 개념과 사례를 주제별로 재구성한 노트다. 원본 라이선스는 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)이다.

## 객체지향 설계 문제와 접근법

객체지향 설계(OOD)는 한 서비스의 네트워크 아키텍처보다 **도메인 객체가 어떤 책임과 협력을 갖는지**에 초점을 둔다. 기본 자료구조와 상태·이벤트 흐름을 인터페이스로 분리한다.

| 객체 설계 과제 | 설계 초점 | 원본 실습 |
| --- | --- | --- |
| 해시맵 | 키·버킷·충돌을 숨기는 자료구조 인터페이스 | [Jupyter notebook](https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/solutions/object_oriented_design/hash_table/hash_map.ipynb) |
| LRU 캐시 | 캐시 조회와 최근 접근 순서를 일관되게 유지 | [Jupyter notebook](https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/solutions/object_oriented_design/lru_cache/lru_cache.ipynb) |
| 콜센터 | 직원 등급·대기열·상담 요청의 책임 분리 | [Jupyter notebook](https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/solutions/object_oriented_design/call_center/call_center.ipynb) |
| 카드 덱 | 카드·덱·게임 규칙의 객체 분리 | [Jupyter notebook](https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/solutions/object_oriented_design/deck_of_cards/deck_of_cards.ipynb) |
| 주차장 | 차량·구역·주차 슬롯의 제약 모델링 | [Jupyter notebook](https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/solutions/object_oriented_design/parking_lot/parking_lot.ipynb) |
| 온라인 채팅 | 사용자·대화방·메시지·상태 관리 | [Jupyter notebook](https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/solutions/object_oriented_design/online_chat/online_chat.ipynb) |

원본의 OOD 항목은 **Under development**로 표시돼 있다. Circular array는 해답이 아니라 기여 요청만 있다.

## 부록의 계산 기준

| 지표 | 참고할 값 |
| --- | --- |
| 이진 단위 | 2^10 = 1,024; 2^20 = 1,048,576; 2^30 ≈ 10억 |
| ns / μs / ms | 1 μs = 1,000 ns; 1 ms = 1,000 μs |
| 부하 분석 | 메모리·디스크·네트워크·프로세싱 시간을 각각 측정 |

원문의 "Latency Numbers Every Programmer Should Know"는 장치 성능을 비교해 보는 **과거의 교육용 지연 시간 표**다. 최신 SSD·네트워크·CPU의 실제 레이턴시와 동일하다고 가정하지 않는다. [원표와 근거 보기](https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/README.md#latency-numbers-every-programmer-should-know).

## 추가 시스템 설계 질문 목록

- **Design a file sync service like Dropbox**: [youtube.com](https://www.youtube.com/watch?v=PE4gwstWhmc)
- **Design a search engine like Google**: [queue.acm.org](http://queue.acm.org/detail.cfm?id=988407); [stackexchange.com](http://programmers.stackexchange.com/questions/38324/interview-question-how-would-you-implement-google-search); [ardendertat.com](http://www.ardendertat.com/2012/01/11/implementing-search-engines/); [stanford.edu](http://infolab.stanford.edu/~backrub/google.html)
- **Design a scalable web crawler like Google**: [quora.com](https://www.quora.com/How-can-I-build-a-web-crawler-from-scratch)
- **Design Google docs**: [code.google.com](https://code.google.com/p/google-mobwrite/); [neil.fraser.name](https://neil.fraser.name/writing/sync/)
- **Design a key-value store like Redis**: [codecapsule.com](http://codecapsule.com/2012/11/07/ikvs-implementing-a-key-value-store-table-of-contents/); [allthingsdistributed.com](https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf)
- **Design a cache system like Memcached**: [slideshare.net](http://www.slideshare.net/oemebamo/introduction-to-memcached)
- **Design a recommendation system like Amazon's**: [hulu.com](https://web.archive.org/web/20170406065247/http://tech.hulu.com/blog/2011/09/19/recommendation-system.html); [ijcai13.org](http://ijcai13.org/files/tutorial_slides/td3.pdf)
- **Design a tinyurl system like Bitly**: [n00tc0d3r.blogspot.com](http://n00tc0d3r.blogspot.com/)
- **Design a chat app like WhatsApp**: [highscalability.com](http://highscalability.com/blog/2014/2/26/the-whatsapp-architecture-facebook-bought-for-19-billion.html)
- **Design a picture sharing system like Instagram**: [highscalability.com](http://highscalability.com/flickr-architecture); [highscalability.com](http://highscalability.com/blog/2011/12/6/instagram-architecture-14-million-users-terabytes-of-photos.html)
- **Design the Facebook news feed function**: [quora.com](http://www.quora.com/What-are-best-practices-for-building-something-like-a-News-Feed); [quora.com](http://www.quora.com/Activity-Streams/What-are-the-scaling-issues-to-keep-in-mind-while-developing-a-social-network-feed); [slideshare.net](http://www.slideshare.net/danmckinley/etsy-activity-feeds-architecture)
- **Design the Facebook timeline function**: [facebook.com](https://www.facebook.com/note.php?note_id=10150468255628920); [highscalability.com](http://highscalability.com/blog/2012/1/23/facebook-timeline-brought-to-you-by-the-power-of-denormaliza.html)
- **Design the Facebook chat function**: [erlang-factory.com](http://www.erlang-factory.com/upload/presentations/31/EugeneLetuchy-ErlangatFacebook.pdf); [facebook.com](https://www.facebook.com/note.php?note_id=14218138919&id=9445547199&index=0)
- **Design a graph search function like Facebook's**: [facebook.com](https://www.facebook.com/notes/facebook-engineering/under-the-hood-building-out-the-infrastructure-for-graph-search/10151347573598920); [facebook.com](https://www.facebook.com/notes/facebook-engineering/under-the-hood-indexing-and-ranking-in-graph-search/10151361720763920); [facebook.com](https://www.facebook.com/notes/facebook-engineering/under-the-hood-the-natural-language-interface-of-graph-search/10151432733048920)
- **Design a content delivery network like CloudFlare**: [figshare.com](https://figshare.com/articles/Globally_distributed_content_delivery/6605972)
- **Design a trending topic system like Twitter's**: [michael-noll.com](http://www.michael-noll.com/blog/2013/01/18/implementing-real-time-trending-topics-in-storm/); [snikolov .wordpress.com](http://snikolov.wordpress.com/2012/11/14/early-detection-of-twitter-trends/)
- **Design a random ID generation system**: [blog.twitter.com](https://blog.twitter.com/2010/announcing-snowflake); [github.com](https://github.com/twitter/snowflake/)
- **Design a system that serves data from multiple data centers**: [highscalability.com](http://highscalability.com/blog/2009/8/24/how-google-serves-data-from-multiple-datacenters.html)
- **Design an online multiplayer card game**: [indieflashblog.com](https://web.archive.org/web/20180929181117/http://www.indieflashblog.com/how-to-create-an-asynchronous-multiplayer-game.html); [buildnewgames.com](http://buildnewgames.com/real-time-multiplayer/)
- **Design a garbage collection system**: [stuffwithstuff.com](http://journal.stuffwithstuff.com/2013/12/08/babys-first-garbage-collector/); [washington.edu](http://courses.cs.washington.edu/courses/csep521/07wi/prj/rick.pdf)
- **Design an API rate limiter**: [https://stripe.com/blog/](https://stripe.com/blog/rate-limiters)
- **Design a Stock Exchange (like NASDAQ or Binance)**: [Jane Street](https://youtu.be/b1e4t2k2KJY); [Golang Implementation](https://around25.com/blog/building-a-trading-engine-for-a-crypto-exchange/); [Go Implementation](http://bhomnick.net/building-a-simple-limit-order-in-go/)

## 실전 아키텍처 자료

- ****MapReduce** - Distributed data processing from Google**: [research.google.com](http://static.googleusercontent.com/media/research.google.com/zh-CN/us/archive/mapreduce-osdi04.pdf)
- ****Spark** - Distributed data processing from Databricks**: [slideshare.net](http://www.slideshare.net/AGrishchenko/apache-spark-architecture)
- ****Storm** - Distributed data processing from Twitter**: [slideshare.net](http://www.slideshare.net/previa/storm-16094009)
- ****Bigtable** - Distributed column-oriented database from Google**: [harvard.edu](http://www.read.seas.harvard.edu/~kohler/class/cs239-w08/chang06bigtable.pdf)
- ****HBase** - Open source implementation of Bigtable**: [slideshare.net](http://www.slideshare.net/alexbaranau/intro-to-hbase)
- ****Cassandra** - Distributed column-oriented database from Facebook**: [slideshare.net](http://www.slideshare.net/planetcassandra/cassandra-introduction-features-30103666)
- ****DynamoDB** - Document-oriented database from Amazon**: [harvard.edu](http://www.read.seas.harvard.edu/~kohler/class/cs239-w08/decandia07dynamo.pdf)
- ****MongoDB** - Document-oriented database**: [slideshare.net](http://www.slideshare.net/mdirolf/introduction-to-mongodb)
- ****Spanner** - Globally-distributed database from Google**: [research.google.com](http://research.google.com/archive/spanner-osdi2012.pdf)
- ****Memcached** - Distributed memory caching system**: [slideshare.net](http://www.slideshare.net/oemebamo/introduction-to-memcached)
- ****Redis** - Distributed memory caching system with persistence and value types**: [slideshare.net](http://www.slideshare.net/dvirsky/introduction-to-redis)

## 기업별 아키텍처 사례

- **Amazon**: [Amazon architecture](http://highscalability.com/amazon-architecture)
- **Cinchcast**: [Producing 1,500 hours of audio every day](http://highscalability.com/blog/2012/7/16/cinchcast-architecture-producing-1500-hours-of-audio-every-d.html)
- **DataSift**: [Realtime datamining At 120,000 tweets per second](http://highscalability.com/blog/2011/11/29/datasift-architecture-realtime-datamining-at-120000-tweets-p.html)
- **Dropbox**: [How we've scaled Dropbox](https://www.youtube.com/watch?v=PE4gwstWhmc)
- **ESPN**: [Operating At 100,000 duh nuh nuhs per second](http://highscalability.com/blog/2013/11/4/espns-architecture-at-scale-operating-at-100000-duh-nuh-nuhs.html)
- **Google**: [Google architecture](http://highscalability.com/google-architecture)
- **Instagram**: [14 million users, terabytes of photos](http://highscalability.com/blog/2011/12/6/instagram-architecture-14-million-users-terabytes-of-photos.html); [What powers Instagram](http://instagram-engineering.tumblr.com/post/13649370142/what-powers-instagram-hundreds-of-instances)
- **Justin.tv**: [Justin.Tv's live video broadcasting architecture](http://highscalability.com/blog/2010/3/16/justintvs-live-video-broadcasting-architecture.html)
- **Facebook**: [Scaling memcached at Facebook](https://cs.uwaterloo.ca/~brecht/courses/854-Emerging-2014/readings/key-value/fb-memcached-nsdi-2013.pdf); [TAO: Facebook’s distributed data store for the social graph](https://cs.uwaterloo.ca/~brecht/courses/854-Emerging-2014/readings/data-store/tao-facebook-distributed-datastore-atc-2013.pdf); [Facebook’s photo storage](https://www.usenix.org/legacy/event/osdi10/tech/full_papers/Beaver.pdf); [How Facebook Live Streams To 800,000 Simultaneous Viewers](http://highscalability.com/blog/2016/6/27/how-facebook-live-streams-to-800000-simultaneous-viewers.html)
- **Flickr**: [Flickr architecture](http://highscalability.com/flickr-architecture)
- **Mailbox**: [From 0 to one million users in 6 weeks](http://highscalability.com/blog/2013/6/18/scaling-mailbox-from-0-to-one-million-users-in-6-weeks-and-1.html)
- **Netflix**: [A 360 Degree View Of The Entire Netflix Stack](http://highscalability.com/blog/2015/11/9/a-360-degree-view-of-the-entire-netflix-stack.html); [Netflix: What Happens When You Press Play?](http://highscalability.com/blog/2017/12/11/netflix-what-happens-when-you-press-play.html)
- **Pinterest**: [From 0 To 10s of billions of page views a month](http://highscalability.com/blog/2013/4/15/scaling-pinterest-from-0-to-10s-of-billions-of-page-views-a.html); [18 million visitors, 10x growth, 12 employees](http://highscalability.com/blog/2012/5/21/pinterest-architecture-update-18-million-visitors-10x-growth.html)
- **Playfish**: [50 million monthly users and growing](http://highscalability.com/blog/2010/9/21/playfishs-social-gaming-architecture-50-million-monthly-user.html)
- **PlentyOfFish**: [PlentyOfFish architecture](http://highscalability.com/plentyoffish-architecture)
- **Salesforce**: [How they handle 1.3 billion transactions a day](http://highscalability.com/blog/2013/9/23/salesforce-architecture-how-they-handle-13-billion-transacti.html)
- **Stack Overflow**: [Stack Overflow architecture](http://highscalability.com/blog/2009/8/5/stack-overflow-architecture.html)
- **TripAdvisor**: [40M visitors, 200M dynamic page views, 30TB data](http://highscalability.com/blog/2011/6/27/tripadvisor-architecture-40m-visitors-200m-dynamic-page-view.html)
- **Tumblr**: [15 billion page views a month](http://highscalability.com/blog/2012/2/13/tumblr-architecture-15-billion-page-views-a-month-and-harder.html)
- **Twitter**: [Making Twitter 10000 percent faster](http://highscalability.com/scaling-twitter-making-twitter-10000-percent-faster); [Storing 250 million tweets a day using MySQL](http://highscalability.com/blog/2011/12/19/how-twitter-stores-250-million-tweets-a-day-using-mysql.html); [150M active users, 300K QPS, a 22 MB/S firehose](http://highscalability.com/blog/2013/7/8/the-architecture-twitter-uses-to-deal-with-150m-active-users.html); [Timelines at scale](https://www.infoq.com/presentations/Twitter-Timeline-Scalability); [Big and small data at Twitter](https://www.youtube.com/watch?v=5cKTP36HVgI); [Operations at Twitter: scaling beyond 100 million users](https://www.youtube.com/watch?v=z8LU0Cj6BOU); [How Twitter Handles 3,000 Images Per Second](http://highscalability.com/blog/2016/4/20/how-twitter-handles-3000-images-per-second.html)
- **Uber**: [How Uber scales their real-time market platform](http://highscalability.com/blog/2015/9/14/how-uber-scales-their-real-time-market-platform.html); [Lessons Learned From Scaling Uber To 2000 Engineers, 1000 Services, And 8000 Git Repositories](http://highscalability.com/blog/2016/10/12/lessons-learned-from-scaling-uber-to-2000-engineers-1000-ser.html)
- **WhatsApp**: [The WhatsApp architecture Facebook bought for $19 billion](http://highscalability.com/blog/2014/2/26/the-whatsapp-architecture-facebook-bought-for-19-billion.html)
- **YouTube**: [YouTube scalability](https://www.youtube.com/watch?v=w5WVu624fY8); [YouTube architecture](http://highscalability.com/youtube-architecture)

## 엔지니어링 블로그 참고 목록

* [Airbnb Engineering](http://nerds.airbnb.com/)
* [Atlassian Developers](https://developer.atlassian.com/blog/)
* [AWS Blog](https://aws.amazon.com/blogs/aws/)
* [Bitly Engineering Blog](http://word.bitly.com/)
* [Box Blogs](https://blog.box.com/blog/category/engineering)
* [Cloudera Developer Blog](http://blog.cloudera.com/)
* [Dropbox Tech Blog](https://tech.dropbox.com/)
* [Engineering at Quora](https://www.quora.com/q/quoraengineering)
* [Ebay Tech Blog](http://www.ebaytechblog.com/)
* [Evernote Tech Blog](https://blog.evernote.com/tech/)
* [Etsy Code as Craft](http://codeascraft.com/)
* [Facebook Engineering](https://www.facebook.com/Engineering)
* [Flickr Code](http://code.flickr.net/)
* [Foursquare Engineering Blog](http://engineering.foursquare.com/)
* [GitHub Engineering Blog](https://github.blog/category/engineering)
* [Google Research Blog](http://googleresearch.blogspot.com/)
* [Groupon Engineering Blog](https://engineering.groupon.com/)
* [Heroku Engineering Blog](https://engineering.heroku.com/)
* [Hubspot Engineering Blog](http://product.hubspot.com/blog/topic/engineering)
* [High Scalability](http://highscalability.com/)
* [Instagram Engineering](http://instagram-engineering.tumblr.com/)
* [Intel Software Blog](https://software.intel.com/en-us/blogs/)
* [Jane Street Tech Blog](https://blogs.janestreet.com/category/ocaml/)
* [LinkedIn Engineering](http://engineering.linkedin.com/blog)
* [Microsoft Engineering](https://engineering.microsoft.com/)
* [Microsoft Python Engineering](https://blogs.msdn.microsoft.com/pythonengineering/)
* [Netflix Tech Blog](http://techblog.netflix.com/)
* [Paypal Developer Blog](https://developer.paypal.com/community/blog/)
* [Pinterest Engineering Blog](https://medium.com/@Pinterest_Engineering)
* [Reddit Blog](http://www.redditblog.com/)
* [Salesforce Engineering Blog](https://developer.salesforce.com/blogs/engineering/)
* [Slack Engineering Blog](https://slack.engineering/)
* [Spotify Labs](https://labs.spotify.com/)
* [Stripe Engineering Blog](https://stripe.com/blog/engineering)
* [Twilio Engineering Blog](http://www.twilio.com/engineering)
* [Twitter Engineering](https://blog.twitter.com/engineering/)
* [Uber Engineering Blog](http://eng.uber.com/)
* [Yahoo Engineering Blog](http://yahooeng.tumblr.com/)
* [Yelp Engineering Blog](http://engineeringblog.yelp.com/)
* [Zynga Engineering Blog](https://www.zynga.com/blogs/engineering)
* [kilimchoi/engineering-blogs](https://github.com/kilimchoi/engineering-blogs)

## 학습 보조자료와 작성 중인 항목

- [Anki 카드와 인터랙티브 연습](https://github.com/donnemartin/system-design-primer/blob/ae9bbd7b02d90b9866215de185217d33f39ab733/README.md#anki-flashcards)은 기억 및 반복 문제 풀이에 활용한다.
- 설계 문제를 모두 암기하기보다, 여러 실제 아키텍처에서 공통되는 병목·트레이드오프를 비교한다.
- 원본에서 **작성 중**으로 표시한 MapReduce 분산 계산, Consistent hashing, Scatter gather 설명은 완성된 해설로 간주하지 않는다.
- 오래된 기업 사례·외부 사이트 URL은 역사적인 학습 레퍼런스다. 현행 제품 기능·최신 엔지니어링 환경의 증거로 사용하지 않는다.

관련 노트: [[ood-interview-approach|객체 설계 접근]], [[gof-design-patterns|디자인 패턴]], [[high-traffic-resilience|고트래픽 회복성]]
