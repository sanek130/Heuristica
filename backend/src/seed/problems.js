// Пример задачи для импорта через MongoDB Atlas или admin API.
module.exports = {
  title: 'Сумма двух чисел',
  slug: 'sum-of-two-numbers',
  description: '<p>Считайте два целых числа и выведите их сумму.</p>',
  theory: '<p>Для чтения используйте <code>input()</code>. Преобразуйте строки в числа через <code>int()</code>.</p>',
  topic: 'math',
  difficulty: 'municipal',
  publicTests: [{ input: '2\n3', output: '5' }],
  hiddenTests: [
    { input: '10\n20', output: '30' },
    { input: '-5\n7', output: '2' }
  ],
  hints: [
    { level: 1, text: 'Используйте input() дважды.', penalty: 10 },
    { level: 2, text: 'Преобразуйте значения в int и сложите.', penalty: 10 }
  ],
  maxScore: 100
};
