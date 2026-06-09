export type Stage = 'group' | 'round_of_32' | 'round_of_16' | 'quarterfinal' | 'semifinal' | 'third_place' | 'final'

export interface Match {
  id: number
  matchNumber: number
  group: string | null
  stage: Stage
  homeTeam: string
  awayTeam: string
  matchDate: string | null
}

function groupMatches(groupName: string, teams: [string, string, string, string], startId: number, dates: [string, string, string, string, string, string]): Match[] {
  const [t1, t2, t3, t4] = teams
  const [d1, d2, d3, d4, d5, d6] = dates
  return [
    { id: startId,     matchNumber: startId,     group: groupName, stage: 'group', homeTeam: t1, awayTeam: t2, matchDate: d1 },
    { id: startId + 1, matchNumber: startId + 1, group: groupName, stage: 'group', homeTeam: t3, awayTeam: t4, matchDate: d2 },
    { id: startId + 2, matchNumber: startId + 2, group: groupName, stage: 'group', homeTeam: t1, awayTeam: t3, matchDate: d3 },
    { id: startId + 3, matchNumber: startId + 3, group: groupName, stage: 'group', homeTeam: t2, awayTeam: t4, matchDate: d4 },
    { id: startId + 4, matchNumber: startId + 4, group: groupName, stage: 'group', homeTeam: t1, awayTeam: t4, matchDate: d5 },
    { id: startId + 5, matchNumber: startId + 5, group: groupName, stage: 'group', homeTeam: t2, awayTeam: t3, matchDate: d6 },
  ]
}

export const GROUP_MATCHES: Match[] = [
  ...groupMatches('A', ['Mexiko', 'Sydafrika', 'Sydkorea', 'Tjeckien'], 1, [
    '2026-06-11', '2026-06-11', '2026-06-15', '2026-06-15', '2026-06-19', '2026-06-19'
  ]),
  ...groupMatches('B', ['Kanada', 'Bosnien-Hercegovina', 'Qatar', 'Schweiz'], 7, [
    '2026-06-12', '2026-06-13', '2026-06-16', '2026-06-16', '2026-06-20', '2026-06-20'
  ]),
  ...groupMatches('C', ['Brasilien', 'Marocko', 'Haiti', 'Skottland'], 13, [
    '2026-06-13', '2026-06-13', '2026-06-17', '2026-06-17', '2026-06-21', '2026-06-21'
  ]),
  ...groupMatches('D', ['USA', 'Paraguay', 'Australien', 'Turkiet'], 19, [
    '2026-06-12', '2026-06-13', '2026-06-16', '2026-06-16', '2026-06-20', '2026-06-20'
  ]),
  ...groupMatches('E', ['Tyskland', 'Curaçao', 'Elfenbenskusten', 'Ecuador'], 25, [
    '2026-06-14', '2026-06-14', '2026-06-18', '2026-06-18', '2026-06-22', '2026-06-22'
  ]),
  ...groupMatches('F', ['Nederländerna', 'Japan', 'Sverige', 'Tunisien'], 31, [
    '2026-06-14', '2026-06-15', '2026-06-18', '2026-06-19', '2026-06-22', '2026-06-23'
  ]),
  ...groupMatches('G', ['Belgien', 'Egypten', 'Iran', 'Nya Zeeland'], 37, [
    '2026-06-15', '2026-06-15', '2026-06-19', '2026-06-19', '2026-06-23', '2026-06-23'
  ]),
  ...groupMatches('H', ['Spanien', 'Kap Verde', 'Saudiarabien', 'Uruguay'], 43, [
    '2026-06-16', '2026-06-16', '2026-06-20', '2026-06-20', '2026-06-24', '2026-06-24'
  ]),
  ...groupMatches('I', ['Frankrike', 'Senegal', 'Irak', 'Norge'], 49, [
    '2026-06-17', '2026-06-17', '2026-06-21', '2026-06-21', '2026-06-25', '2026-06-25'
  ]),
  ...groupMatches('J', ['Argentina', 'Algeriet', 'Österrike', 'Jordanien'], 55, [
    '2026-06-17', '2026-06-18', '2026-06-21', '2026-06-22', '2026-06-25', '2026-06-26'
  ]),
  ...groupMatches('K', ['Portugal', 'DR Kongo', 'Uzbekistan', 'Colombia'], 61, [
    '2026-06-18', '2026-06-18', '2026-06-22', '2026-06-22', '2026-06-26', '2026-06-26'
  ]),
  ...groupMatches('L', ['England', 'Kroatien', 'Ghana', 'Panama'], 67, [
    '2026-06-19', '2026-06-19', '2026-06-23', '2026-06-23', '2026-06-27', '2026-06-27'
  ]),
]

export const KNOCKOUT_MATCHES: Match[] = [
  // Round of 32 (16 matches)
  { id: 73, matchNumber: 73, group: null, stage: 'round_of_32', homeTeam: 'Etta Grupp A', awayTeam: 'Trea (B/C/D/E/F/G)', matchDate: '2026-06-28' },
  { id: 74, matchNumber: 74, group: null, stage: 'round_of_32', homeTeam: 'Etta Grupp B', awayTeam: 'Trea (A/C/D/E/F/G)', matchDate: '2026-06-28' },
  { id: 75, matchNumber: 75, group: null, stage: 'round_of_32', homeTeam: 'Etta Grupp C', awayTeam: 'Trea (A/B/D/E/F/G)', matchDate: '2026-06-29' },
  { id: 76, matchNumber: 76, group: null, stage: 'round_of_32', homeTeam: 'Etta Grupp D', awayTeam: 'Trea (A/B/C/E/F/G)', matchDate: '2026-06-29' },
  { id: 77, matchNumber: 77, group: null, stage: 'round_of_32', homeTeam: 'Etta Grupp E', awayTeam: 'Trea (H/I/J/K/L)', matchDate: '2026-06-30' },
  { id: 78, matchNumber: 78, group: null, stage: 'round_of_32', homeTeam: 'Etta Grupp F', awayTeam: 'Trea (H/I/J/K/L)', matchDate: '2026-06-30' },
  { id: 79, matchNumber: 79, group: null, stage: 'round_of_32', homeTeam: 'Etta Grupp G', awayTeam: 'Trea (H/I/J/K/L)', matchDate: '2026-07-01' },
  { id: 80, matchNumber: 80, group: null, stage: 'round_of_32', homeTeam: 'Etta Grupp H', awayTeam: 'Tvåa Grupp A', matchDate: '2026-07-01' },
  { id: 81, matchNumber: 81, group: null, stage: 'round_of_32', homeTeam: 'Etta Grupp I', awayTeam: 'Tvåa Grupp B', matchDate: '2026-07-02' },
  { id: 82, matchNumber: 82, group: null, stage: 'round_of_32', homeTeam: 'Etta Grupp J', awayTeam: 'Tvåa Grupp C', matchDate: '2026-07-02' },
  { id: 83, matchNumber: 83, group: null, stage: 'round_of_32', homeTeam: 'Etta Grupp K', awayTeam: 'Tvåa Grupp D', matchDate: '2026-07-03' },
  { id: 84, matchNumber: 84, group: null, stage: 'round_of_32', homeTeam: 'Etta Grupp L', awayTeam: 'Tvåa Grupp E', matchDate: '2026-07-03' },
  { id: 85, matchNumber: 85, group: null, stage: 'round_of_32', homeTeam: 'Tvåa Grupp F', awayTeam: 'Tvåa Grupp G', matchDate: '2026-07-04' },
  { id: 86, matchNumber: 86, group: null, stage: 'round_of_32', homeTeam: 'Tvåa Grupp H', awayTeam: 'Tvåa Grupp I', matchDate: '2026-07-04' },
  { id: 87, matchNumber: 87, group: null, stage: 'round_of_32', homeTeam: 'Tvåa Grupp J', awayTeam: 'Tvåa Grupp K', matchDate: '2026-07-05' },
  { id: 88, matchNumber: 88, group: null, stage: 'round_of_32', homeTeam: 'Tvåa Grupp L', awayTeam: 'Trea (A/B/C/D/E/F/G/H/I/J/K/L)', matchDate: '2026-07-05' },
  // Round of 16 (8 matches)
  { id: 89, matchNumber: 89, group: null, stage: 'round_of_16', homeTeam: 'Vinnare M73', awayTeam: 'Vinnare M74', matchDate: '2026-07-06' },
  { id: 90, matchNumber: 90, group: null, stage: 'round_of_16', homeTeam: 'Vinnare M75', awayTeam: 'Vinnare M76', matchDate: '2026-07-06' },
  { id: 91, matchNumber: 91, group: null, stage: 'round_of_16', homeTeam: 'Vinnare M77', awayTeam: 'Vinnare M78', matchDate: '2026-07-07' },
  { id: 92, matchNumber: 92, group: null, stage: 'round_of_16', homeTeam: 'Vinnare M79', awayTeam: 'Vinnare M80', matchDate: '2026-07-07' },
  { id: 93, matchNumber: 93, group: null, stage: 'round_of_16', homeTeam: 'Vinnare M81', awayTeam: 'Vinnare M82', matchDate: '2026-07-08' },
  { id: 94, matchNumber: 94, group: null, stage: 'round_of_16', homeTeam: 'Vinnare M83', awayTeam: 'Vinnare M84', matchDate: '2026-07-08' },
  { id: 95, matchNumber: 95, group: null, stage: 'round_of_16', homeTeam: 'Vinnare M85', awayTeam: 'Vinnare M86', matchDate: '2026-07-09' },
  { id: 96, matchNumber: 96, group: null, stage: 'round_of_16', homeTeam: 'Vinnare M87', awayTeam: 'Vinnare M88', matchDate: '2026-07-09' },
  // Quarterfinals (4 matches)
  { id: 97, matchNumber: 97, group: null, stage: 'quarterfinal', homeTeam: 'Vinnare M89', awayTeam: 'Vinnare M90', matchDate: '2026-07-11' },
  { id: 98, matchNumber: 98, group: null, stage: 'quarterfinal', homeTeam: 'Vinnare M91', awayTeam: 'Vinnare M92', matchDate: '2026-07-11' },
  { id: 99, matchNumber: 99, group: null, stage: 'quarterfinal', homeTeam: 'Vinnare M93', awayTeam: 'Vinnare M94', matchDate: '2026-07-12' },
  { id: 100, matchNumber: 100, group: null, stage: 'quarterfinal', homeTeam: 'Vinnare M95', awayTeam: 'Vinnare M96', matchDate: '2026-07-12' },
  // Semifinals (2 matches)
  { id: 101, matchNumber: 101, group: null, stage: 'semifinal', homeTeam: 'Vinnare M97', awayTeam: 'Vinnare M98', matchDate: '2026-07-15' },
  { id: 102, matchNumber: 102, group: null, stage: 'semifinal', homeTeam: 'Vinnare M99', awayTeam: 'Vinnare M100', matchDate: '2026-07-15' },
  // Third place
  { id: 103, matchNumber: 103, group: null, stage: 'third_place', homeTeam: 'Förlorare M101', awayTeam: 'Förlorare M102', matchDate: '2026-07-18' },
  // Final
  { id: 104, matchNumber: 104, group: null, stage: 'final', homeTeam: 'Vinnare M101', awayTeam: 'Vinnare M102', matchDate: '2026-07-19' },
]

export const ALL_MATCHES = [...GROUP_MATCHES, ...KNOCKOUT_MATCHES]

export const STAGE_LABELS: Record<Stage, string> = {
  group: 'Gruppspel',
  round_of_32: 'Omgång 32',
  round_of_16: 'Omgång 16',
  quarterfinal: 'Kvartsfinal',
  semifinal: 'Semifinal',
  third_place: 'Bronsmatch',
  final: 'Final',
}
