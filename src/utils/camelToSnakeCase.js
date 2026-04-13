const convertCamelToSnake = (str) => {
  // Regex checks for a lowercase start followed by at least one uppercase letter
    const isCamel = /^[a-z]+(?:[A-Z][a-z0-9]+)+$/.test(str);

    if (!isCamel) return str;

    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

module.exports = convertCamelToSnake;