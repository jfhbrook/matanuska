import { NATIVE_ROUTINES } from '../../native';

const ORIGINAL_ROUTINES = Object.fromEntries(
  Object.entries(NATIVE_ROUTINES).map(([name, fn]) => {
    return [name, fn.call];
  }),
);

// 01-01-2020
const NOW = 1577869200000;

export function patchDateTime() {
  NATIVE_ROUTINES['now%'].call = async (..._args) => NOW;
}

export function resetDateTime() {
  for (const [name, call] of Object.entries(ORIGINAL_ROUTINES)) {
    NATIVE_ROUTINES[name].call = call;
  }
}
