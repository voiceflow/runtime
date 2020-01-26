// constants
export const GOOGLE_SHEETS = 'Google Sheets';
const RETRIEVE_DATA = 'Retrieve Data';
const CREATE_DATA = 'Create Data';
const UPDATE_DATA = 'Update Data';
const DELETE_DATA = 'Delete Data';

export const CUSTOM_API = 'Custom API';
const GET_REQUEST = 'Make a GET Request';
const POST_REQUEST = 'Make a POST Request';
const PATCH_REQUEST = 'Make a PATCH Request';
const PUT_REQUEST = 'Make a PUT Request';
const DELETE_REQUEST = 'Make a DELETE Request';

export const ZAPIER = 'Zapier';
const START_ZAP = 'Start a Zap';

// integrations repos endpoints based on action
export const ENDPOINTS_MAP: Record<string, Record<string, string>> = {
  [GOOGLE_SHEETS]: {
    [RETRIEVE_DATA]: '/google_sheets/retrieve_data',
    [CREATE_DATA]: '/google_sheets/create_data',
    [UPDATE_DATA]: '/google_sheets/update_data',
    [DELETE_DATA]: '/google_sheets/delete_data',
  },
  [CUSTOM_API]: {
    // eslint-disable-next-line sonarjs/no-duplicate-string
    [GET_REQUEST]: '/custom/make_api_call',
    [POST_REQUEST]: '/custom/make_api_call',
    [PATCH_REQUEST]: '/custom/make_api_call',
    [PUT_REQUEST]: '/custom/make_api_call',
    [DELETE_REQUEST]: '/custom/make_api_call',
  },
  [ZAPIER]: { [START_ZAP]: '/zapier/trigger' },
};
// end constants

export type IntegrationBlock = {
  type: string;
  selected_integration?: string;
  selected_action?: string;
  fail_id: string;
  success_id: string;
  action_data?: any;
};
