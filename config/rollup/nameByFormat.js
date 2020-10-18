const FORMAT_ES = 'es';

module.exports = function nameByFormat(format) {
  if (format === FORMAT_ES) {
    return 'mjs';
  }

  return format;
};
