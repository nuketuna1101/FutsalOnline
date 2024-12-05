//====================================================================================================================
//====================================================================================================================
// utils/gameLogic.js
// 게임 로직 함수 구현부
//====================================================================================================================
//====================================================================================================================
import crypto from 'crypto';
import { GAME_LOGIC_WEIGHTS, STAMINA_DECAY_RATIO } from '../../config/gameLogic.config.js';

// export 하려는 매치 시뮬레이션 로직
const simulateMatch = (squad1, squad2) => {
    // 점수 초기화
    let { userSquadScore, opponentSquadScore } = { userSquadScore: 0, opponentSquadScore: 0 };
    // 전처리: 로직계산을 위한 데이터 캐싱
    const squad1Stats = getCachedStats(squad1);
    const squad2Stats = getCachedStats(squad2);
    // 시뮬레이션 4번 반복
    for (let i = 0; i < 4; i++) {
        // 각 스쿼드의 플레이어 능력치 합산 계산
        const squad1TotalStats = calculateTotalStats(squad1Stats);
        const squad2TotalStats = calculateTotalStats(squad2Stats);
        // 시뮬레이션 결과 로그
        // console.log("::: >>> squad1TotalStats.paramAtkPos : " + JSON.stringify(squad1TotalStats.paramAtkPos));
        // console.log("::: >>> squad2TotalStats.paramAtkPos : " + JSON.stringify(squad2TotalStats.paramAtkPos));

        // 또는 더 구체적인 속성 출력
        // console.log("::: >>> squad1TotalStats:", squad1TotalStats);
        // console.log("::: >>> squad2TotalStats:", squad2TotalStats);

        // 공격권 결정
        if (getRandOut(squad1TotalStats.paramAtkPos, squad2TotalStats.paramAtkPos)) {
            userSquadScore = simulateSequence(squad1TotalStats.paramAtk, squad2TotalStats.paramDef, userSquadScore);
        } else {
            opponentSquadScore = simulateSequence(squad2TotalStats.paramAtk, squad1TotalStats.paramDef, opponentSquadScore);
        }
        console.log(":: cur score :: " + userSquadScore + " : " + opponentSquadScore);
    }
    console.log(":: FINAL score :: " + userSquadScore + " : " + opponentSquadScore);
    console.log(":: typeof :: " + typeof userSquadScore);
    return { userSquadScore, opponentSquadScore };
};




// 각각의 모멘텀에서의 계산
const getCachedStats = (squad) => {
    if (!squad || !Array.isArray(squad) || squad.length === 0) {
        throw new Error("Invalid squad structure");
    }
    // 전처리 계산값 캐싱: 공격권 결정 변수, 공격 변수, 수비 변수
    const cachedStats = squad.map(player => {
        const stats = player.players.playerStats;
        const playerStats = {
            stamina: stats.stamina,
            paramAtkPos: GAME_LOGIC_WEIGHTS.WEIGHT_POS_PASS * stats.pass
                + GAME_LOGIC_WEIGHTS.WEIGHT_POS_PACE * stats.pace,
            paramAtk: GAME_LOGIC_WEIGHTS.WEIGHT_ATK_FINISHING * stats.finishing
                + GAME_LOGIC_WEIGHTS.WEIGHT_ATK_TECHNIQUE * stats.technique
                + GAME_LOGIC_WEIGHTS.WEIGHT_ATK_AGILITY * stats.agility,
            paramDef: GAME_LOGIC_WEIGHTS.WEIGHT_DEF_DEFENSE * stats.defense
                + GAME_LOGIC_WEIGHTS.WEIGHT_DEF_AGILITY * stats.agility,
        };

        // 각 선수의 계산된 값 로그 찍기
        // console.log(`Player ${player.players.playerName} Stats:`, playerStats);
        return playerStats;
    });
    return cachedStats;
};




// x, y 인자를 받고 랜덤하게 확률 결과
const getRandOut = (x, y) => {
    // x, y가 NaN이 아닌지 확인
    if (isNaN(x) || isNaN(y) || x + y <= 0) {
        // console.log(" :::: value X, Y ::: " + x + " , " + y);
        // console.log(" :::: isNaN(x) || isNaN(y) || x + y <= 0 ::: " + isNaN(x) + " , " + isNaN(y) + " , " + (x + y <= 0));
        throw new Error("Invalid arguments: x and y must be valid numbers and their sum must be positive");
    }

    const rand = crypto.randomInt(0, Math.floor(x + y));
    return rand <= x;
};

// 공격수비 상황 로직
const simulateSequence = (atk, def, score) => {
    if (getRandOut(atk, def)) score++;
    return score;
};
// 리듀서 사용해서
const calculateTotalStats = (players) => {
    return players.reduce((total, player) => {
        // console.log(`Calculating stats for ${player.stamina}% stamina - ${player.paramAtkPos} (AtkPos), ${player.paramAtk} (Atk), ${player.paramDef} (Def)`);

        total.paramAtkPos += player.paramAtkPos * (player.stamina / 100);
        total.paramAtk += player.paramAtk * (player.stamina / 100);
        total.paramDef += player.paramDef * (player.stamina / 100);
        // 스테미너 10% 감소
        player.stamina *= STAMINA_DECAY_RATIO;
        // console.log(`Player stamina before decay: ${player.stamina}`);
        return total;
    },
        { paramAtkPos: 0, paramAtk: 0, paramDef: 0 });
};

export default simulateMatch;