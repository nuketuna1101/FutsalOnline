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



export default simulateMatch;