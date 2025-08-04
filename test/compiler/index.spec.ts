import { runCompilerSuite } from '../helpers/compiler';

import { CONDITIONAL_INSTRUCTIONS, CONDITIONAL_PROGRAMS } from './conditionals';
import { SIMPLE_INSTRUCTIONS, EXPRESSION_INSTRUCTIONS } from './instr';
import { SIMPLE_PROGRAMS } from './programs';
import { VARIABLE_INSTRUCTIONS } from './variables';

runCompilerSuite('expressions', EXPRESSION_INSTRUCTIONS);

runCompilerSuite('simple instructions', SIMPLE_INSTRUCTIONS);
runCompilerSuite('variable instructions', VARIABLE_INSTRUCTIONS);
runCompilerSuite('conditional instructions', CONDITIONAL_INSTRUCTIONS);

runCompilerSuite('simple programs', SIMPLE_PROGRAMS);
runCompilerSuite('conditional programss', CONDITIONAL_PROGRAMS);
