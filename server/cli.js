#!/usr/bin/env node

const yargs = require('yargs');

require('./src/app');
const BoardModel = require('./src/board/model');
const ListModel = require('./src/list/model');
const ItemModel = require('./src/item/model');
const ItemUtils = require('./src/utils/item');
const ConsoleUtils = require('./src/utils/console');

yargs
  .usage('$0 <cmd> [args]')

  // BOARDS
  .command(
    'board:find [filter]',
    'Find and print boards as JSON.',
    (yargs) => {
      yargs
        .positional('filter', {
          type: 'string',
          describe: 'Optional filter',
        });
    }, async function (argv) {
      const filter = argv.filter ? JSON.parse(argv.filter) : {};
      await BoardModel.find(filter)
        .then((docs) => {
          ConsoleUtils.dump(docs);
        })
        .catch(function (err) {
          console.error(err);
          yargs.exit(1);
        });
      yargs.exit(0);
    })

  // LISTS
  .command(
    'list:find [filter]',
    'Find and print lists as JSON.',
    (yargs) => {
      yargs
        .positional('filter', {
          type: 'string',
          describe: 'Optional filter',
        });
    }, async function (argv) {
      const filter = argv.filter ? JSON.parse(argv.filter) : {};
      await ListModel.find(filter)
        .then((docs) => {
          ConsoleUtils.dump(docs);
        })
        .catch(function (err) {
          console.error(err);
          yargs.exit(1);
        });
      yargs.exit(0);
    })

  // ITEMS
  .command(
    'item:find [filter]',
    'Find and print items as JSON.',
    (yargs) => {
      yargs
        .positional('filter', {
          type: 'string',
          describe: 'Optional filter',
        });
    }, async function (argv) {
      const filter = argv.filter ? JSON.parse(argv.filter) : {};
      await ItemModel.find(filter)
        .then((docs) => {
          ConsoleUtils.dump(docs);
        })
        .catch(function (err) {
          console.error(err);
          yargs.exit(1);
        });
      yargs.exit(0);
    })
  .command(
    'item:move-to-list [items..]',
    'Move item(s) from one list to another.',
    (yargs) => {
      yargs
        .positional('items', {
          type: 'string',
          describe: 'Item ID(s)',
        })
        .option('from', {
          alias: 'f',
          type: 'string',
          describe: 'From List ID'
        })
        .option('to', {
          alias: 't',
          type: 'string',
          demandOption: true,
          describe: 'To List ID'
        });
    }, async function (argv) {
      await ListModel.findById(argv.to)
        .then((listTo) => {
          if (!listTo) {
            throw 'No such list with ID ' + argv.to;
          } else {
            console.log('Found "to" list', listTo);
            if (argv.from) {
              return ListModel.findById(argv.from)
                .populate('items')
                .then((listFrom) => {
                  if (!listFrom) {
                    throw 'No such list with ID ' + argv.from;
                  } else {
                    console.log('Found "from" list', listTo);
                    ItemUtils.moveToList(listFrom.items, listTo)
                      .then((res) => {
                        console.log(res);
                      });
                  }
                });
            } else {
              return ItemUtils.moveToList(argv.items, listTo)
                .then((res) => {
                  console.log(res);
                });
            }
          }
        })
        .catch(function (err) {
          console.error(err);
          yargs.exit(1);
      });
      yargs.exit(0);
    })

  .demandCommand()
  .recommendCommands()
  .help()
  .argv;