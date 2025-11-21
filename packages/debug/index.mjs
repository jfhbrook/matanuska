import { trace, context } from '@opentelemetry/api';

const tracer = trace.getTracer('main');
function startSpan(name, arg2, arg3, arg4) {
    let opts;
    let ctx;
    let fn;
    if (arguments.length < 2) {
        return;
    } else if (arguments.length === 2) {
        fn = arg2;
    } else if (arguments.length === 3) {
        opts = arg2;
        fn = arg3;
    } else {
        opts = arg2;
        ctx = arg3;
        fn = arg4;
    }
    const wrapped = (span)=>{
        try {
            return fn(span);
        } catch (err) {
            span.recordException(err);
            throw err;
        } finally{
            span.end();
        }
    };
    const parentContext = ctx !== null && ctx !== void 0 ? ctx : context.active();
    const span = tracer.startSpan(name, opts, parentContext);
    const contextWithSpanSet = trace.setSpan(parentContext, span);
    return context.with(contextWithSpanSet, wrapped, undefined, span);
}
// A convenience function for adding events when you don't have the span
// immediately on-hand. Like startSpan, this is not hidden behind jscc and
// should instead be conditionally imported/called at the site of use.
function addEvent(message, attributes = {}) {
    const span = trace.getActiveSpan();
    if (span) {
        span.addEvent(message, attributes);
    }
}

export { addEvent, startSpan };
//# sourceMappingURL=index.mjs.map
