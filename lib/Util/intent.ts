const WHITE_SPACE_REGEXP = / /g;

// eslint-disable-next-line import/prefer-default-export
export const formatIntentName = (name: string): string => {
  if (!name) {
    return name;
  }

  let formattedName = '';
  // replace white spaces with underscores
  formattedName = name.replace(WHITE_SPACE_REGEXP, '_');
  // replace numbers with equivalent capital letter. Ex: 0 = A, 1 = B
  formattedName = formattedName.replace(/\d/g, (digit) => String.fromCharCode(parseInt(digit, 10) + 65));

  return formattedName;
};
