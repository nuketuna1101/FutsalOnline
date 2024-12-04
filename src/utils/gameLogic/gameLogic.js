//====================================================================================================================
//====================================================================================================================
// utils/gameLogic.js
// 게임 로직 함수 구현부
//====================================================================================================================
//====================================================================================================================
import crypto from 'crypto';

// export 하려는 매치 시뮬레이션 로직
const simulateMatch = (squad1, squad2) => {
    // 점수 초기화
    let { squad1Score, squad2Score } = { squad1Score: 0, squad2Score: 0 };
    // 전처리: 로직계산을 위한 데이터 캐싱
    const squad1Stats = getCachedStats(squad1);
    const squad2Stats = getCachedStats(squad2);
    // 시뮬레이션 4번 반복
    for (let i = 0; i < 4; i++) {
        // 각 스쿼드의 플레이어 능력치 합산 계산
        const squad1TotalStats = calculateTotalStats(squad1Stats);
        const squad2TotalStats = calculateTotalStats(squad2Stats);

        // 공격권 결정
        if (getRandOut(squad1TotalStats.paramAtkPos, squad2TotalStats.paramAtkPos)) {
            squad1Score = simulateSequence(squad1TotalStats.paramAtk, squad2TotalStats.paramDef, squad1Score);
        } else {
            squad2Score = simulateSequence(squad2TotalStats.paramAtk, squad1TotalStats.paramDef, squad2Score);
        }
    }

    return { squad1Score, squad2Score };
};


// 각각의 모멘텀에서의 계산
const getCachedStats = (squad) => {
    if (!squad.userteam || !squad.userteam.players) {
        throw new Error('[Error] Invalid squad structure');
    }
    // 전처리 계산값 캐싱: 공격권 결정 변수, 공격 변수, 수비 변수
    return squad.userteam.players.map(player => ({
        stamina: player.playerStats.stamina,
        paramAtkPos: 0.65 * player.playerStats.pass + 0.35 * player.playerStats.pace,
        paramAtk: 0.5 * player.playerStats.finishing + 0.2 * player.playerStats.technique + 0.3 * player.playerStats.agility,
        paramDef: 0.65 * player.playerStats.defense + 0.35 * player.playerStats.agility,
    }));
};




// x, y 인자를 받고 랜덤하게 확률 결과
const getRandOut = (x, y) => {
    const rand = crypto.randomInt(0, Math.floor(x + y));
    return (rand <= x);
};

// 공격수비 상황 로직
const simulateSequence = (atk, def, score) => {
    if (getRandOut(atk, def)) score++;
    return score;
};
// 리듀서 사용해서
const calculateTotalStats = (players) => {
    return players.reduce((total, player) => {
        total.paramAtkPos += player.paramAtkPos * (player.stamina / 100);
        total.paramAtk += player.paramAtk * (player.stamina / 100);
        total.paramDef += player.paramDef * (player.stamina / 100);
        // 스테미너 10% 감소
        player.stamina *= 0.9;
        return total;
    }, 
    { paramAtkPos: 0, paramAtk: 0, paramDef: 0 });
};

export default simulateMatch;