function createLib (execlib) {
  'use strict';

  return {
    service: require('./servicecreator')(execlib)
  };
}

module.exports = createLib;
