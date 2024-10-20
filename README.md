# 🗳️ DIDI블록
## DID와 블록체인을 이용한 온라인 투표 시스템 
![image](https://github.com/user-attachments/assets/009af3fd-9ed6-41ae-9f18-48b4dfe703d3)

### 👥 팀원
---
👤 **박미라**: 팀장, 프로젝트 총괄<br>
 🔗 박미라 깃허브 <https://github.com/miracle-mira>

👤 **장정환**: 웹, 투표시스템, DID, VC, VP 발급 및 블록체인 구축<br>
 🔗 장정환 깃허브 <https://github.com/jjhwan-h>

👤 **하지민**: SSI앱 개발<br>
 🔗 하지민 깃허브 <https://github.com/hajimin1>

### 👩🏻‍🏫 프로젝트 소개
---
 오늘날 인터넷만 연결되면 모든 지 할 수 있는 시대를 도래했다고 과언이 아닐 정도로 우리는 인터넷만 연결되면 많은 일들을 할 수 있다. 하지만 아직 인터넷으로는 한계가 있는 또는 아직 대중화되지 않은 것이 하나있다. 그것은 투표이다. 우리는 아직 투표를 떠올리면 종이 투표를 생각한다. 투표를 온라인으로 하기에는 아직 보안성과 신뢰성 그리고 투명성에서 거부감이 드는 것이 사실이다. 그렇다면 현재 진행하는 종이 투표는 안전할까? 알다시피 종이 투표도 그 한계가 있다. 다음은 두 가지 투표 사례이다.
 대표적인 투표 조작으로는 프로듀스 101 투표 조작이 있다. 프로듀스 101이란 국민이 직접 연습생들을 뽑아 아이돌을 만든다는 취지의 프로그램이다. 이처럼 투표가 중요한 프로그램에서 투표를 조작했다는 의혹이 터졌고, 결국 관계자들은 구속됐다. 이는 온라인 투표의 가장 우려되는 부분, 특정인이 투표 결과를 임의 조작할 수 있다는 것을 여과 없이 보여준다. 2024년에는 중요한 투표인 총선이 있다. 하지만 다음 [표1-1]를 보면 알다시피 총선과 대통령 선거같이 중요한 투표에서 20-30대의 투표율이 다른 연령층에 비해 투표율이 저조하다. 어쩔 수 없는 종이 투표의 한계를 보여주며 이 또한 투표 조작의 위험성을 배제할 수 없다.<br>
![표](https://github.com/user-attachments/assets/1d296afe-f2f8-4348-a1e7-89bb3c95b979)<br>
따라서 우리는 새로운 투표 방법에 대해 생각해 보아야 한다. 투표의 투명성과 선거 4원칙을 지키면서 투표 참여율 증가를 보장할 수 있는 투표 방법이 필요하다. 이에 우리가 생각한 것이 블록체인과 DID를 활용한 온라인 투표이다. 블록체인을 통해 투명성을 보장하고, DID를 사용해 선거 4원칙을 보장하고, 그리고 온라인 투표를 통해 참여율을 증가시킬 수 있기 때문이다.



### ⏱️ 개발 기간
---
- **2023.09~2023.12 프로젝트 기획**<br>
- **2024.03~ 개발**

  
### ◼️ 개발 환경
---
**node.js v18.19.0**<br>
**go v1.22**<br>
**mysql v8.3.0**<br>
**postgres v13**<br>
**aries-framework v0.4.2**<br>
**hyperledger v0.1.3**<br>
**Test Indy Network**<br>

### ◼️ 주요 기능
---
|기능|설명|
|------|---|
|회원가입| 1. 사용자 기기에서 DID발급한다.<br> 2. 이메일/비밀번호/이름/DID 입력한다. <br> 3. 이메일 인증한다.<br> 
|방생성|1. 방정보입력(방이름, 투표시작 시간, 투표종료 시간, 설명)한다.<br> 2. 후보자 정보 입력(이름, 나이 , 성별, 공약)한다.<br>3. 유권자 정보 입력(아이디, 이메일)한다.<br> 4. 회원가입 되지 않은 유권자는 preUser로 등록한다.<br> 5. 유권자의 VC발급여부를 확인하는 레코드생성한다.<br> 6. 중복된 유권자 확인한다.<br> 7. 유권자 이메일로 유권자 등록메일 발송한다.<br> 8. Room-Scheduler로 room-id, 투표종료 시간 전송한다.<br> 9. Room-Scheduler의 DB에 저장한다.<br>
|투표권(VC)발급|1. 마이페이지에서 발급가능한 VC확인한다.<br>2. 발급버튼을 누르면 [로그인 검증] 3. [DID Auth]<br>4.[VC 중복 발급 확인]<br>5.VC발급확인<br>
|투표|1.투표방에 접속한다.<br>2.QR코드, URL를 사용자기기에 입력하여 서버와 연결한다.<br>3.로그인검증한다.<br>4.VC발급 주체 검증한다.<br>5.중복투표 검증한다.<br>6.사용자는 원하는 항목에 투표한다.<br>7.block chain으로 투표값 전송한다.
|개표방법|1. 투표방 생성 시 투표종료 시간을 스케줄러 서버로 전송한다.<br> 2. 스케줄러 서버는 투표 종료시간을 데이터베이스에 저장한다.<br> 3. 스케줄러 서버는 주기적으로(30분) 데이터베이스에 저장된 투표종료시간을 점검한다.<br> 4. 투표 종료시간이 넘은 투표방은 메세지큐를 통해 개표서버로 전달한다.<br> 5. 개표서버는 블록체인에 있는 해당 투표방 정보를 가져와 개표 후 웹서버로 전달한다.<br>

### ◼️ 프로젝트 아키텍쳐
![image](https://github.com/user-attachments/assets/65fb9779-132c-414a-ab82-ac982e89c0cd)




### ◼️ 시스템 흐름도
**방생성**
```mermaid
%%방생성
graph LR
  start(((Start))) --> id1{로그인여부}
  id1 -- yes --> id2[/방정보 입력/]
  id1 -- no --> id3(((End)))
  id2 --> id4{투표 시작/종료 시간
  유효성 체크}
  id4 -- no --> id2
  id4 -- yes --> id5[/후보자정보 입력/]
  id5 --> id6[/유권자정보 입력/]
  id6 --> id7{유권자 중복 체크}
  id7 -- no --> id6
  id7 -- yes --> id8{유권자 회원가입 여부}
  id8 -- no --> id9[Pre User로 생성]
  id8 -- yes --> id10[VC 발급 레코드 추가]
  id9 --> id10
  id10 --> id11[방생성 #40;VOTING상태#41;]
  id11 --> id12[Room-Scheduler로
  방성성 정보 전송]
  id11 --> id13[유권자 등록 이메일 발송]
  id12 --> id14[Room-Scheduler DB에 저장]
  id13 --> id15(((End)))
  id14 -->id15
  
```
**투표권(VC)발급**
```mermaid
graph LR
%%투표권(VC)발급
start(((Start))) --> id1[마이페이지 접속]
id1 --> id2[로그인 검증]
id2 --> id13[사용자 기기와 연결
QR 또는 URL]
id13 --> id3{DID Resolve}
%%DID Auth과정
id3 -- yes--> id4[사용자 Public key로 
문자열 암호화]
id3 -- no --> id5(((End)))
id4 --> id6[사용자 기기로 암호화된 문자열 전달]
id6 --> id7[Private키로 복호화 후 서버로 전달]
id7 --> id8{DID Auth
#40;복호화된 문자열 검증#41;}
id8 -- no --> id9(((End)))
id8 -- yes --> id10[VC발급여부 확인]
id10 --> id11[VC발급]
id11 --> id12(((End)))

```
**투표**
```mermaid
graph LR
%%투표
start(((Start))) --> id1[투표방 접속 시도]
id1 --> id2{투표방 상태 확인}
id2 -- VOTING --> id3[Room-Scheduler서버로 투표방 상태 요청]
id2 -- END --> id4(((End)))
id2 -- COUNTED --> id16[개표페이지]
id3 --> id5{NTP서버 시간과 비교}
id5 -- 종료 전 --> id6[투표방 접속]
id5 -- 종료 후 --> id7[투표방 상태 END로 저장]
id7 --> id8(((End)))
id6 -->id9[사용자 기기와 연결
QR또는 URL]
id9 --> id10[VP요청]
id10 --> id11[서버가 발급한것이 맞는지 확인]
id11 -->id12[투표 정보 사용자 기기로 전달]
id12 --> id13[투표값 서버로 전달]
id13 --> id14[중복투표검증]
id14 --> id15[block chain으로
투표값 전송]
```
**투표 종료확인**
```mermaid
graph LR
%%투표 종료시간 확인
start(((Start))) --> id0[cronjob 시작]
id0 --> id1[NTP 서버시간 불러오기]
id1 --> id2[DB에서 투표방 시간 불러오기]
id2 --> id3{NTP 서버시간과 종료시간비교}
id3 -- 종료 전 --> id4[continue]
id3 -- 종료 후 --> id5[메세지 큐로 투표방 id값 전송]
id5 --> id6[Vote-Counter에서 
읽을 준비가 되면 
메세지큐에서 메세지 전송]

```

**개표**
```mermaid
graph LR
%%개표
start(((Start))) --> id1[Vote-Counter에서 메세지 받음]
id1-->id2[block chain으로 room-id전송]
id2 --> id3[해당 room-id에 해당하는 block값들 전송]
id3 --> id4[개표진행]
id4 --> id5[웹서버로 개표값 전송]
id5 --> id6[투표방 상태 COUNTED로 저장]
id6 --> id7[투표값 저장]
id7 --> id8(((End)))
```

### ◼️ 참고 및 출처
**Credo-ts**<br>
https://github.com/openwallet-foundation/credo-ts<br>
**hyperledger/aries-askar**<br>
https://github.com/hyperledger/aries-askar<br>
**nomadcoders/nomadcoin**<br>
https://github.com/nomadcoders/nomadcoin<br>
### ◼️ 영상 및 사진
데모영상: https://drive.google.com/drive/folders/1ydreaF1cjDFiHgTD4mFt3JJdlTPqJVqw?usp=sharing



