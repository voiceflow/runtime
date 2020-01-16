const compare = require('clj-fuzzy').metrics;

import Request from '../Request';
import { R, Intents } from '@/lib/Constants';

const getBestScore = (a, b, tolerance = 0.9) => {
  if (!a) return null;

  let best = null;
  let score = tolerance;

  for (const target of b) {
    if (target.string) {
      const input = a.toLowerCase();
      const match = target.string.toLowerCase();
      let temp = 1 - compare.jaccard(input, match) + compare.dice(input, match);

      if (input.charAt(0) === match.charAt(0)) {
        temp += 0.1;
      }

      if (temp > score) {
        score = temp;
        best = target;
      }
    }
  }

  if (best) {
    return best.value || best.value === 0 ? best.value : best.string;
  }
  return null;
};

export const transformInput = (request: Request) => {
  const { payload: reqPayload } = request;
  // For catchall choice/capture blocks convert intent to readable words
  let transformedInput: string;
  if (reqPayload.get('input')) {
    // testing passes in string directly
    transformedInput = reqPayload.get('input');
    reqPayload.delete('input');
  } else if (reqPayload.get('raw_input')) {
    transformedInput = reqPayload.get('raw_input');
    reqPayload.delete('raw_input');
  } else if (reqPayload.get(R.INTENT)?.name === 'AMAZON.CancelIntent' || reqPayload.get(R.INTENT)?.name === 'AMAZON.StopIntent') {
    transformedInput = 'STOP';
  } else if (reqPayload.get(R.INTENT)?.name === 'AMAZON.HelpIntent') {
    transformedInput = 'HELP';
  } else if (reqPayload.get(R.INTENT)?.name === 'AMAZON.YesIntent') {
    transformedInput = 'YES';
  } else if (reqPayload.get(R.INTENT)?.name === 'AMAZON.NoIntent') {
    transformedInput = 'NO';
  } else if (reqPayload.get(R.INTENT)?.name === 'AMAZON.PauseIntent') {
    transformedInput = 'PAUSE';
  } else if (reqPayload.get(R.INTENT)?.name === 'AMAZON.ResumeIntent') {
    transformedInput = 'RESUME';
  } else if (reqPayload.get(R.INTENT)?.name === 'AMAZON.NavigateHomeIntent') {
    transformedInput = 'HOME';
  } else if (reqPayload.get(R.INTENT)?.name === 'AMAZON.RepeatIntent') {
    transformedInput = 'REPEAT';
  } else if (reqPayload.get(R.INTENT)?.name === 'VoiceFlowIntent') {
    transformedInput = reqPayload.get(R.INTENT)?.slots?.content?.value || '';

    const result = getBestScore(transformedInput, Intents.IntentCheck, 1.3);
    if (result) reqPayload.set(R.INTENT, { name: result });
  } else {
    transformedInput = '';
    const slots = reqPayload.get(R.INTENT)?.slots;
    if (typeof slots === 'object') {
      const keys = Object.keys(reqPayload.get(R.INTENT)?.slots);
      if (keys.length === 1 && slots[keys[0]].value) {
        transformedInput = slots[keys[0]].value;
      }
    }
    if (!transformedInput.trim() && reqPayload.get(R.INTENT)) {
      transformedInput = reqPayload.get(R.INTENT).name.replace(/_/g, ' ');
    }
  }

  reqPayload.set('transformedInput', transformedInput);

  // TODO: if (state.testing && state.input)
};
