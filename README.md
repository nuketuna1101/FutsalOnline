# FutsalOnline

#### FutsalOnline backend teamproject
<br><br>

## w. Team Six (임시 팀명)

> **team leader**: 

https://github.com/nuketuna1101
<br>

> **team members**: 

https://github.com/ssy1248
<br>
https://github.com/junstar96
<br>
https://github.com/CubeTale
<br>
https://github.com/seniii99


<br>

---

# Code Convention

> 1) Naming 
    대부분 변수 : camelCase 통일 (snake, Pascal 지양)
>    .env, cofig, enum 에 대해선 UpperSnake
> 2) Multiline Formatting
    열거된 데이터/객체에 대해선 line break로 가독성 높이기
> 3) Commnet 주석: Block Comment 형식
    코드의 오른쪽이 아닌, 기능 상단/ 라인 상단에 주석 추가

```js
/*
    컨밴션 예시
*/
    const testString = "이런 식으로 카멜케이스 작성합니다.";
    // 주석은 기능 상단 위에
    loggers.error({
        message: '[Error] error occurred',
        error: err.message,
        stack: err.stack,
    });
    // 열거할 때는 멀티라인, enum은 Upper Snakecase
    enum Status {
        ACTIVE,
        INACTIVE,
    }
```

<br><br>

---

<br><br>

## IDE/language/technology stack
- IDE: VSCode
- runtime env: Node
- main framework: express
- package manager: npm
- DB: MySQL w. AWS RDS
- ORM: Prisma

<br>

## 프로젝트 세팅
```cmd
# npm 초기화
npm init -y

# 사용할 라이브러리들
npm add express prisma @prisma/client cookie-parser jsonwebtoken bcrypt winston winston-daily-rotate-file

# nodemon 라이브러리 DevDependency로 설치
npm add -D nodemon dotenv

# prisma 초기화
npx prisma init

# 프로젝트에 schema.prisma에 정의된 테이블을 MySQL에 생성
npx prisma db push

```

## API 명세서
https://www.notion.so/teamsparta/13f2dc3ef514814dac67d59c52c11b29?v=13f2dc3ef51481b89bb5000c25cb387c&pvs=4


## 필수 기능 API

# 1. 회원가입 / 로그인
user.router.js

- 회원가입 : router.post("/users/sign-up", async (req, res, next)
- 로그인 : router.post("/users/sign-in", async (req, res, next)

기존의 로그인 방식을 착안하여서 회원가입을 한 순간 축구게임에 필요한 테이블들을 바로 생성을 하여서 1대1관계를 만들어준다.

# 2. 캐시 구매 기능
user.router.js

- 캐시 획득 - router.post("/users/cash", authMiddleware, async (req, res, next)

호출을 하면 캐시를 획득이 되는 api를 제작하였습니다.

# 3. 선수 데이터 준비
player.router.js

- 선수 데이터 준비 - router.post("/upload", async (req, res)

CSV TO JSON을 이용하여서 api를 호출을 하면 data폴더에 들어가있는 csv를 json으로 변환을 하여 선수 데이터 테이블에 세팅을 하는 방법을 사용하였습니다.

# 4. 선수 뽑기 기능
gatch.router.js

- 선수 뽑기 - router.post("/gatcha", authMiddleware, async (req, res, next)

랜덤 값을 만들어서 선수 데이터에 선수를 뽑아서 유저의 보유 선수단 테이블에 추가를 하고 업데이트를 통하여서 뽑기를 한 유저의 캐시를 줄이는 방식을 사용하였습니다.

# 5. 나만의 팀 꾸리기 기능
squads.router.js

- 팀 꾸리기 기능 - router.post("/squads", authMiddleware, async (req, res, next)

body에 배열로 내가 선발에 추가할 선수를 보유 선수 테이블의 id를 집어넣어서 api를 호출을 하면 boolean값을 true로 변경하여서 자신의 선발진에 구성이 되었다 라는 것으로 판별하게 만들었습니다.

# 6. 축구 게임 기능
mathches.router.js / gamelogic.js

- 점수 기반 매치 메이킹 - router.post("/matches", authMiddleware, async (req, res, next)
- 플레이어 지목 매치 메이킹 - router.post("/matches/:userId", authMiddleware, async (req, res, next)

매치 메이킹이 성공을 하면 gamelogic.js에 제작이 된 로직을 기반으로 경기를 시뮬레이션 후 마지막으로 결과값을 return 해주는 방식으로 사용하였습니다.

## 게임로직

풋살 시뮬레이션 게임의 게임로직

게임 로직은 플레이어의 스탯이 되도록 개연성있게 반영될 수 있도록 기획하였습니다. 다음과 같은 룰을 가집니다.

(모든 계수는 config값으로 설정 변경 가능함)

1. 3인으로 구성된 스쿼드 간 매치를 치릅니다.
2. 매치는 n번의 공격/수비 상황으로 진행됩니다.
3. 두 스쿼드 간의 공수 결정은 스쿼드 간의 공격 수비 결정 수치의 랜덤 확률로 진행됩니다. 

공격 수비 결정 수치는 선수의 (패스 * 0.65 + 주력 * 0.35) * (현재 지구력)의 합산으로 계산됩니다.

4. 공격/수비 상황에서는, 공격팀의 공격능력과 수비팀의 수비능력 간의 랜덤확률로 득점 성공/실패가 결정됩니다.

공격능력은 공격팀의 (골결정력 * 0.5 + 개인기 * 0.2 + 민첩성 * 0.3) * (현재 지구력) 의 합산으로 계산됩니다.

수비능력은 수비팀의 (수비력 * 0.65 + 민첩성 * 0.35) * (현재 지구력) 의 합산으로 계산됩니다.

5. 매치 안에서 공수 상황을 진행함에 따라, 지구력은 10% 씩 감소한 수치로 적용됩니다.
6. n번의 공수 상황을 모두 완료하고 합산된 득점 결과에 따라 승무패가 결정됩니다.

<br>


stat은 다음과 같은 영향을 준다.

- 지구력(stamina): 경기 내에서 후반부 모멘텀에서 얼마나 더 발휘할 수 있는지

- 골결정력(finish): 공격모멘텀에서 얼마나 득점에 성공할 가능성이 높은지

- 수비력(defense): 수비모멘텀에서 얼마나 방어해 낼 수 있는지

- 개인기(technique): 모멘텀에서 얼마나 자신에게 유리하게 이끌어 갈 수 있는지 (변수 창출 능력)

- 패스(pass): 공격모멘텀을 가져올 확률을 높여주기

- 주력(pace): 상대를 따돌리거나/잡을 수 있는지

- 민첩성(Agility): 공격/수비 모멘텀에서의 수행 능력

<br>

## 랭킹 시스템

ELO 랭킹과 관련해서는 기본적으로 명시된 조건에 따라 구현하는 방향을 선택했습니다.

매치메이킹 이후 승무패 결과에 따라 기본 1000점으로 부여받았던 레이팅 점수에 대해 +10점, 혹은 변동없음 혹은 -10점이 반영되도록 햇습니다.

랭킹과 관련해서는 동일 점수를 가진 유저들이 존재하는 부분이 있는데, 간단히 조회하는 유저보다 높은 점수를 가진 유저들의 수를 합산한 랭킹으로 표시되기 때문에, 동일 레이팅 점수를 가진다면 동일한 랭킹을 가지게 됩니다.


<br><br>

### squad 제작

<span>
post(제작) : body로 teams의 인덱스 값을 3개 받아서 그 값이 해당 유저가 가지고 있는 게 맞다면 집어 넣고 아니면 오류 발생시킴.
get(조회) : 현재 유저가 가지고 있는 팀을 조회함.
</span>


### market 시스템

이적시장 : 유저가 플레이어(캐릭터)를 별도로 판매하고 구매하기 위한 장소(경매장)

주요 기능

|기능 이름|기능|
|---|---|
|이적시장 등록|유저는 squad로 뽑히지 않은 캐릭터 가운데 하나를 선택해 원하는 가격과 함께 이적시장(transfermarket)에 집어 넣는다.|
|플레이어 구매|유저는 이적시장에서 하나를 선택한다. 구매자의 돈이 부족하지 않다면 유저는 돈을 지불하여 돈을 얻고, 그 캐릭터를 등록한 유저는 돈을 얻는다.|
|이적시장 전체 조회|이적시장 전체의 리스트를 조회한다.|
|이적시장 선택 조회|이적시장에서 플레이어의 ID가 일치하는 리스트를 조회한다.|
|등록 취소|이적시장에 등록했던 것을 취소한다. 올려져 있는 컬럼 하나를 제거하고 그 안에 있던 데이터를 다시 teams에 집어 넣는다.|

### 전적 조회 
matches.router.js

- 직전 경기 결과 조회 - router.get("/matches/latest", authMiddleware, async (req, res, next)
- 최근 n경기 결과 조회 - router.get("/matches/recent", authMiddleware, async (req, res, next)

경기가 끝나고 값을 저장하는 matches테이블에 접근을 하여서 저장 날짜를 기준으로 정렬을 진행한 후 그 값들을 보여쥬는 방식을 사용하였습니다.

### 강화 시스템
player.upgrade.router.js

- 강화 - router.post("/players/:userTeamId/upgrade", authMiddleware, async (req, res, next)
보유 선수 테이블에서 선수를 선택을 하고 보유 선수 테이블에서 boolean이 true로 되어있는 선수와 강화 선택이 된 선수를 제외하고 take를 사용해서 최대 5개의 선수를 자동 지정을 하고 강화 확률 csv에 선수의 강화단계에 맞는 확률을 가져와서 강화를 진행하는 방식입니다.