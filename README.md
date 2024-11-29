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

- Sign up
- Log in
- Purchase Cash
- LoadData
- RandDraft (Gacha)
- BuildSquad
<br>
- /* GAME LOGIC */
