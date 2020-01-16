const YesIntent = 'AMAZON.YesIntent';
const NoIntent = 'AMAZON.NoIntent';
const HelpIntent = 'AMAZON.HelpIntent';
const CancelIntent = 'AMAZON.CancelIntent';
const StopIntent = 'AMAZON.StopIntent';
const MoreIntent = 'AMAZON.MoreIntent';
const NextIntent = 'AMAZON.NextIntent';
const PauseIntent = 'AMAZON.PauseIntent';
const RepeatIntent = 'AMAZON.RepeatIntent';
const ResumeIntent = 'AMAZON.ResumeIntent';
const PreviousIntent = 'AMAZON.PreviousIntent';

const DefaultIntents = [
  { intent: YesIntent, values: ['yes', 'yeah', 'okay'] },
  { intent: NoIntent, values: ['no', 'nope', 'nah'] },
  { intent: HelpIntent, values: ['help', 'assist'] },
  { intent: CancelIntent, values: ['cancel'] },
  { intent: StopIntent, values: ['stop'] },
  { intent: MoreIntent, values: ['more'] },
  { intent: NextIntent, values: ['next'] },
  { intent: PauseIntent, values: ['pause'] },
  { intent: RepeatIntent, values: ['repeat'] },
  { intent: ResumeIntent, values: ['resume'] },
  { intent: PreviousIntent, values: ['previous'] },
];

const IntentCheck = [];
DefaultIntents.forEach((intent) => {
  intent.values.forEach((value) => {
    IntentCheck.push({
      string: value,
      value: intent.intent,
    });
  });
});

export default {
  IntentCheck,
};
