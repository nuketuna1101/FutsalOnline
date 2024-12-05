//====================================================================================================================
//====================================================================================================================
// src/config/gameLogic.config.js
// 컨피그 임시 설정값 저장소
//====================================================================================================================
//====================================================================================================================

// 게임 로직 계산시 사용되는 가중치 계수
const GAME_LOGIC_WEIGHTS = {
    WEIGHT_POS_PASS: 0.65,
    WEIGHT_POS_PACE: 0.35,
    WEIGHT_ATK_FINISHING: 0.5,
    WEIGHT_ATK_TECHNIQUE: 0.2,
    WEIGHT_ATK_AGILITY: 0.3,
    WEIGHT_DEF_DEFENSE: 0.65,
    WEIGHT_DEF_AGILITY: 0.35,
};

// 게임 로직 계산시 사용되는 스테미너 감소량
const STAMINA_DECAY_RATIO = 0.9;

// 게임 로직 계산시 한 매치에 몇 번의 모멘텀 시뮬레이션 할 것인지
const MATCH_SIMULATION_MOMENTUMS_NUMBER = 5;

// 랜덤 매칭 상대 찾기 최대 시도 횟수 제한
const MATCHMAKING_TRIALS_CONSTRAINTS = 20;

export { GAME_LOGIC_WEIGHTS, STAMINA_DECAY_RATIO, MATCH_SIMULATION_MOMENTUMS_NUMBER, MATCHMAKING_TRIALS_CONSTRAINTS };