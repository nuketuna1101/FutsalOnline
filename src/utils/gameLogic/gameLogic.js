//====================================================================================================================
//====================================================================================================================
// utils/gameLogic.js
// 게임 로직 함수 구현부
//====================================================================================================================
//====================================================================================================================

// export 하려는 매치 시뮬레이션 로직
const simulateMatch = (squad1, squad2) => {
    let squad1Score = 0;
    let squad2Score = 0;

    for (let i = 0; i < 6; i++) {
        const isSecondHalf = i >= 3; // 후반전은 3번째 이후부터
        const momentumResult = simulateMomentum(squad1, squad2, isSecondHalf);

        if (momentumResult === 'Goal!') {
            team1Score++;
        } else if (momentumResult === 'Attack Failed') {
            team2Score++;
        }
    }

    return { squad1Score, squad2Score };
};

// 각각의 모멘텀에서의 계산
const simulateMomentum = () => {

};

// 공수 결정
const determineAtkPos = (squad1, squad2) => {
    // 공격과 수비의 결정은 양팀의 (패스 + 주력/가속)의 능력치가 결정. (초기 설정계수: 0.65, 0.35)
    // const sqaud1Param = squad1.pass 


    const cachedStats = [
        // 스쿼드1 데이터
        ...userSquad1.map(squad => ({
            squadId: squad.id,
            players: squad.userteam.players.map(player => ({
                playerId: player.id,
                stamina: player.playerStats.stamina,
                // 전처리 계산값 캐싱: 공격권 결정 변수, 공격 변수, 수비 변수
                paramAtkPos: 0.65 * player.playerStats.pass + 0.35 * player.playerStats.pace,
                paramAtk: 0.5 * player.playerStats.finishing + 0.2 * player.playerStats.technique + 0.3 * player.playerStats.agility,
                paramDef: 0.65 * player.playerStats.defense + 0.35 * player.playerStats.agility,
            }))
        })),

        // 스쿼드2 데이터
        ...userSquad2.map(squad => ({
            squadId: squad.id,
            players: squad.userteam.players.map(player => ({
                playerId: player.id,
                stamina: player.playerStats.stamina,
                // 전처리 계산값 캐싱: 공격권 결정 변수, 공격 변수, 수비 변수
                paramAtkPos: 0.65 * player.playerStats.pass + 0.35 * player.playerStats.pace,
                paramAtk: 0.5 * player.playerStats.finishing + 0.2 * player.playerStats.technique + 0.3 * player.playerStats.agility,
                paramDef: 0.65 * player.playerStats.defense + 0.35 * player.playerStats.agility,
            }))
        }))
    ];

}

export default simulateMatch;