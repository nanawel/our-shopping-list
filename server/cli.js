#!/usr/bin/env node

const yargs = require('yargs');
require('dotenv').config();

require('./src/app');
const {VITE_SINGLEBOARD_ID, VITE_SINGLEBOARD_SLUG} = require('./src/config');
const BoardModel = require('./src/board/model');
const ListModel = require('./src/list/model');
const ListUtils = require('./src/utils/list');
const ItemModel = require('./src/item/model');
const ItemUtils = require('./src/utils/item');
const ConsoleUtils = require('./src/utils/console');

yargs
  .usage('$0 <cmd> [args]')

  ///////////////////////////////////////////////
  // CONFIG
  .command(
    'config:show',
    'Dump config as JSON.',
    (yargs) => {}, async function () {
      ConsoleUtils.json({
        env: process.env,
        config: require('./src/config'),
    });
      yargs.exit(0);
    })

  ///////////////////////////////////////////////
  // BOARDS
  .command(
    'board:create [name]',
    'Create a new board from a name.',
    (yargs) => {
      yargs
        .positional('name', {
          type: 'string',
          describe: 'Name of the board (optional if slug is specified)',
        })
        .option('slug', {
          alias: 's',
          type: 'string',
          describe: 'Force slug when creating the board (otherwise derived from name).'
        })
        .option('singleboard', {
          alias: 'S',
          type: 'boolean',
          describe: 'Create the special board for "singleboard mode".'
        });
    }, async function (argv) {
      const boardModel = new BoardModel(
        argv.singleboard
        ? {
            _id: VITE_SINGLEBOARD_ID,
            name: argv.name,
            slug: VITE_SINGLEBOARD_SLUG
          }
        : {
            name: argv.name,
            slug: argv.slug || null
          });

      // In singleboard mode, check that the board does not already exist and
      // display a proper message if it does.
      if (argv.singleboard) {
        if (await BoardModel.findOne({_id: VITE_SINGLEBOARD_ID, slug: VITE_SINGLEBOARD_SLUG})) {
          console.info('Nothing to do: the singleboard already exists. Exiting.');
          yargs.exit(2);
        }
      }
      await boardModel.save()
        .then(() => {
          ConsoleUtils.json(boardModel);
        })
        .catch(function (err) {
          console.error(err);
          yargs.exit(1);
        });
      yargs.exit(0);
    })
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
          ConsoleUtils.json(docs);
        })
        .catch(function (err) {
          console.error(err);
          yargs.exit(1);
        });
      yargs.exit(0);
    })

  ///////////////////////////////////////////////
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
          ConsoleUtils.json(docs);
        })
        .catch(function (err) {
          console.error(err);
          yargs.exit(1);
        });
      yargs.exit(0);
    })
  .command(
    'list:move-to-board [lists..]',
    'Move lists to the specified board.',
    (yargs) => {
      yargs
        .positional('lists', {
          type: 'string',
          describe: 'Lists ID(s). Leave empty when using --all.',
        })
        .option('board', {
          type: 'string',
          describe: 'Target board slug. Leave empty when using --singleboard.'
        })
        .option('all', {
          type: 'boolean',
          default: false,
          describe: '⚠ Force migration for *all* existing lists when none provided.'
        })
        .option('singleboard', {
          type: 'boolean',
          default: false,
          describe: 'Move lists to the special board used in "singleboard" mode.'
        });
    }, async function (argv) {
      const boardSlug = argv.singleboard ? VITE_SINGLEBOARD_SLUG : argv.board;
      await ListUtils.moveToBoard(argv.all ? '*' : argv.lists, boardSlug)
        .then((res) => {
          ConsoleUtils.json(res);
        })
        .catch(function (err) {
          console.error(err);
          yargs.exit(1);
        });
      yargs.exit(0);
    })

  ///////////////////////////////////////////////
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
          ConsoleUtils.json(docs);
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
                        ConsoleUtils.json(res);
                      });
                  }
                });
            } else {
              return ItemUtils.moveToList(argv.items, listTo)
                .then((res) => {
                  ConsoleUtils.json(res);
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
