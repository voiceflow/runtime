import Store from '../Store';

export type Mapping = { variable: string; slot: string };

export type Choice = {
  mappings: Array<Mapping>;
  intent: string;
  nextIdIndex?: number;
};

export default interface Request {
  type: string;
  payload: Store;
}
