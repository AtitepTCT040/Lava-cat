/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CatCharacter {
  id: string;
  name: string;
  breed: string;
  emoji: string;
  description: string;
  color: string; // Tailwind bg color class
  borderColor: string;
  stats: {
    speed: string;
    jump: string;
    luck: string;
  };
}

export interface UserAccount {
  username: string;
  fullName: string;
  characterId: string;
  highScore: number;
  progressLevel: number;
}

export interface LeaderboardEntry {
  id: string;
  fullName: string;
  characterSelected: string;
  highScore: number;
  progressLevel: number;
  timestamp: string;
}

export interface SpreadsheetRow {
  id: string;
  fullName: string;
  characterSelected: string;
  highScore: number;
  progressLevel: number;
  timestamp: string;
}

export interface MathQuestion {
  questionText: string;
  correctAnswer: number;
  choices: number[];
  num1: number;
  num2: number;
  op: string;
}
