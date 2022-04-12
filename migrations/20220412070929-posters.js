'use strict';

const {
  text
} = require("express");

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.createTable('posters', {
    'id': {
      'type': 'int',
      'primaryKey': true,
      'autoIncrement': true,
      'unsigned': true,
    },
    'title': {
      'type': 'string',
      'length': 200,
      'notNull': true
    },
    'cost': {
      'type': 'int',
      'unsigned': true,
      'default': 0
    },
    'description': 'text',
    'date': 'date',
    'stock': 'int',
    'height': {
      'type': 'int',
      'unsigned': true
    },
    'width': {
      'type': 'int',
      'unsigned': true
    }
  });
};

exports.down = function (db) {
  return db.dropTable('posters');
};

exports._meta = {
  "version": 1
};