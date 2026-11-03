// Единая точка правды для доменных списков (синхронизировано с enum в backend/src/models/Problem.js)

export const TOPICS = [
  'arrays',
  'sorting',
  'two_pointers',
  'binary_search',
  'dp',
  'graphs',
  'trees',
  'math',
  'strings'
];

export const DIFFICULTY_LEVELS = ['municipal', 'regional', 'final'];

// Человекочитаемые подписи уровней ВсОШ
export const DIFFICULTY_LABELS = {
  municipal: 'Муниципальный этап',
  regional: 'Региональный этап',
  final: 'Заключительный этап'
};
