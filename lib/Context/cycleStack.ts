import Context, {ActionType} from "@/lib/Context";
import Frame, {FrameState} from "@/lib/Context/Stack/Frame";

const STACK_OVERFLOW = 60;

const cycleStack = async <T, S, V, STT, STV, STS>(context: Context<T, S, V, STT, STV, STS>, calls: number = 0): Promise<void> => {
    if(context.stack.getDepth() > STACK_OVERFLOW || this.stack.getDepth() === 0) {
        context.setAction(ActionType.END);
        return;
    }

    const currentFrame = context.stack.top();
    const diagram = await context.fetchDiagram(currentFrame.diagramID);

    handle(diagram);

    const action = context.getAction();
    switch(action.type) {
        case ActionType.ENDING:
            return;
        case ActionType.POPPING:
            context.stack.pop();
            break;
        case ActionType.PUSHING:
            context.stack.push(new Frame(<FrameState<STT, STV, STS>> action.payload));
            break;
    }
    await cycleStack(context,calls + 1);
}

export default cycleStack;