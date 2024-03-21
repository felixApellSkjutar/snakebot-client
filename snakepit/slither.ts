import { snakeConsole as console } from '../src/client';
import { Coordinate, GameMap, Snake } from '../src/utils';
import { MessageType } from '../src/messages';
import { GameSettings, Direction, RelativeDirection, TileType } from '../src/types';
import type { GameStartingEventMessage, Message, SnakeDeadEventMessage } from '../src/types_messages';
import { Dir } from 'fs';

const allDirections = Object.values(Direction); // [Direction.Up, Direction.Down, Direction.Left, Direction.Right];

// Get random item in array
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * This is where you write your AI code. You will be given a GameMap object containing the current state of the game.
 * Use this object to determine your next move. Remember to return a Direction enum value before your time runs out!
 * (Default time is 250ms)
 * run locally: npm start -- -h http://localhost:8080 -n mysnakename
 */
function wall_finder(gameMap: GameMap, possibleMoves: Direction[]): Direction {
  if (possibleMoves.length == 3 && possibleMoves.includes(Direction.Up)) {
    return Direction.Up;
  }

  if (possibleMoves.includes(gameMap.playerSnake.relativeToAbsolute(RelativeDirection.Forward))) {
    return gameMap.playerSnake.relativeToAbsolute(RelativeDirection.Forward);
  }

  if (possibleMoves.includes(gameMap.playerSnake.relativeToAbsolute(RelativeDirection.Right))) {
    return gameMap.playerSnake.relativeToAbsolute(RelativeDirection.Right);
  }
  return Direction.Up;
}

function wall_finder_with_food(
  gameMap: GameMap,
  possibleMoves: Direction[],
  mySnake: Snake,
  myHeadPosition: Coordinate,
): Direction {
  if (gotFood) {
    gotFood = false;
    if (possibleMoves.includes(mySnake.relativeToAbsolute(RelativeDirection.Left))) {
      return mySnake.relativeToAbsolute(RelativeDirection.Left);
    }
  }

  if (
    gameMap.getTileType(myHeadPosition.translateByDirection(mySnake.relativeToAbsolute(RelativeDirection.Right))) ==
    TileType.Food
  ) {
    gotFood = true;
    return mySnake.relativeToAbsolute(RelativeDirection.Right);
  }
  if (possibleMoves.length == 3 && possibleMoves.includes(Direction.Up)) {
    return Direction.Up;
  }

  if (possibleMoves.includes(gameMap.playerSnake.relativeToAbsolute(RelativeDirection.Forward))) {
    return gameMap.playerSnake.relativeToAbsolute(RelativeDirection.Forward);
  }

  if (possibleMoves.includes(gameMap.playerSnake.relativeToAbsolute(RelativeDirection.Right))) {
    return gameMap.playerSnake.relativeToAbsolute(RelativeDirection.Right);
  }
  return Direction.Up;
}

let gotFood = false;

export async function getNextMove(gameMap: GameMap): Promise<Direction> {
  const myHeadPosition = gameMap.playerSnake.headCoordinate; // Coordinate of my snake's head
  const possibleMoves = allDirections.filter((direction) => gameMap.playerSnake.canMoveInDirection(direction)); //Filters safe directions to move in
  const mySnake = gameMap.playerSnake;
  // If there are no safe moves, bad luck!
  if (possibleMoves.length === 0) {
    return Direction.Down;
  }

  return wall_finder_with_food(gameMap, possibleMoves, mySnake, myHeadPosition);
  // Go toward food if it's nearby
  // for (const direction of possibleMoves) {
  //   const nextPosition = myHeadPosition.translateByDirection(direction); // Gets the next position of the snake
  //   if (gameMap.getTileType(nextPosition) === TileType.Food) {
  //     return direction;
  //   }
  // }

  // Otherwise, choose a random direction
  return getRandomItem(possibleMoves);
}

/**
 * This is an optional handler that you can use if you want to listen for specific events.
 * Check out the MessageType enum for a list of events that can be listened to.
 */
export function onMessage(message: Message) {
  switch (message.type) {
    case MessageType.GameStarting:
      message = message as GameStartingEventMessage; // Cast to correct type
      // Reset snake state here
      break;
    case MessageType.SnakeDead:
      message = message as SnakeDeadEventMessage; // Cast to correct type
      // Check how many snakes are left and switch strategy
      break;
  }
}

// Settings ommitted are set to default values from the server, change this if you want to override them
export const trainingGameSettings = {
  // maxNoofPlayers: 2,
  // obstaclesEnabled: false,
  // ...
} as GameSettings;
