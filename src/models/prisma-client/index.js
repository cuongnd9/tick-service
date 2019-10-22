'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var prisma_lib_1 = require('prisma-client-lib');
var typeDefs = require('./prisma-schema').typeDefs;

var models = [
  {
    name: 'Role',
    embedded: false,
  },
  {
    name: 'Account',
    embedded: false,
  },
  {
    name: 'Category',
    embedded: false,
  },
  {
    name: 'TaskStatus',
    embedded: false,
  },
  {
    name: 'TaskPriority',
    embedded: false,
  },
  {
    name: 'Task',
    embedded: false,
  },
  {
    name: 'StepStatus',
    embedded: false,
  },
  {
    name: 'Step',
    embedded: false,
  },
  {
    name: 'Image',
    embedded: false,
  },
];
exports.Prisma = prisma_lib_1.makePrismaClientClass({
  typeDefs,
  models,
  endpoint: `${process.env['PRISMA_ENDPOINT']}`,
});
exports.prisma = new exports.Prisma();
