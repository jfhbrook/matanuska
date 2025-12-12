import { NativeRoutine } from '../value';

export const NATIVE_ROUTINES: Record<string, NativeRoutine> = {};

export function register(routine: NativeRoutine) {
  NATIVE_ROUTINES[routine.name] = routine;
}
