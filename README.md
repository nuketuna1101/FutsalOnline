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

## 필수 기능 API

- 추후 노션에 있는 정보 업데이트


## 게임로직

풋살 시뮬레이션 게임의 게임로직

>> 경기 당 6번의 모멘텀 (전반 / 후반)
6번의 모멘텀에서 스탯에 대한 로직 계산을 통해 어느 팀이 득점을 할지 결정.

>> 한 번의 모멘텀에서 공수 결정.
공격과 수비의 결정은 양팀의 (패스 + 주력/가속)의 능력치가 결정. (초기 설정계수: 0.65, 0.35)
모멘텀에서 공격팀의 (골결정력 + 개인기 + 민첩성)과 수비팀의 (수비력 + 민첩성) 능력치가 결정. (초기 설정계수: 0.5, 0.2, 0.3 / 0.65, 0.35) 
모멘텀에서 위 인자를 통해 랜덤하게 득점 결정. 

ex. 1개의 모멘텀에서,
공격과 수비의 결정 시 : a팀: 80 / b팀 : 75 => 랜덤변수가 (80/ (80 + 75)) 이내면 a팀 공격상황으로 결정.
a팀 공격능력치 수치: 78 / b팀 수비능력치: 83 => 랜덤변수가 (78/ (78 + 83)) 이내면 a팀 득점 성공.

단, 후반전의 모멘텀에선, 지구력이 계산식에 영향을 준다.




stat은 다음과 같은 영향을 준다.

지구력(stamina): 경기 내에서 후반부 모멘텀에서 얼마나 더 발휘할 수 있는지

골결정력(finish): 공격모멘텀에서 얼마나 득점에 성공할 가능성이 높은지

수비력(defense): 수비모멘텀에서 얼마나 방어해 낼 수 있는지

개인기(technique): 모멘텀에서 얼마나 자신에게 유리하게 이끌어 갈 수 있는지 (변수 창출 능력)

패스(pass): 공격모멘텀을 가져올 확률을 높여주기

주력/가속(pace): 상대를 따돌리거나/잡을 수 있는지

민첩성(Agility): 공격/수비 모멘텀에서의 수행 능력

