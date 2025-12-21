import { runCompilerSuite } from '../helpers/compiler';

import { CONDITIONAL_INSTRUCTIONS, CONDITIONAL_PROGRAMS } from './conditionals';
import { SIMPLE_INSTRUCTIONS, EXPRESSION_INSTRUCTIONS } from './instr';
import { SIMPLE_PROGRAMS } from './programs';
import { VARIABLE_INSTRUCTIONS } from './variables';
import { FOR_PROGRAMS, WHILE_PROGRAMS, REPEAT_PROGRAMS } from './looping';
import { FIXTURE_PROGRAMS } from './fixtures';

runCompilerSuite('expressions', EXPRESSION_INSTRUCTIONS);

runCompilerSuite('simple instructions', SIMPLE_INSTRUCTIONS);
runCompilerSuite('variable instructions', VARIABLE_INSTRUCTIONS);
runCompilerSuite('conditional instructions', CONDITIONAL_INSTRUCTIONS);

runCompilerSuite('simple programs', SIMPLE_PROGRAMS);
runCompilerSuite('conditional programs', CONDITIONAL_PROGRAMS);
runCompilerSuite('for loop programs', FOR_PROGRAMS);
runCompilerSuite('while loop programs', WHILE_PROGRAMS);
runCompilerSuite('repeat loop programs', REPEAT_PROGRAMS);

runCompilerSuite('fixtures', FIXTURE_PROGRAMS);
