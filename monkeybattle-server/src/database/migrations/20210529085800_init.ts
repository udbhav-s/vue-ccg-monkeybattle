import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('users', (table) => {
      table.increments();
      table.string('username').unique().notNullable();
      table.string('password').notNullable();
      table.integer('level').unsigned().defaultTo(0).notNullable();
      table.integer('xp').unsigned().defaultTo(0).notNullable();
      table.timestamps(true, true);
    })
    .createTable('game_classes', (table) => {
      table.increments();
      table.string('name').unique().notNullable();
    })
    .createTable('cards', (table) => {
      table.increments();
      table.string('name').unique().notNullable();
      table.text('description');
      table.integer('bananas').unsigned().notNullable();
      table.integer('attack').unsigned();
      table.integer('health').unsigned();
      table.integer('game_class_id').unsigned();
      table
        .foreign('game_class_id')
        .references('id')
        .inTable('game_classes')
        .onDelete('SET NULL');
    })
    .createTable('monkeys', (table) => {
      table.increments();
      table.string('name').notNullable();
      table.text('description');
      table.integer('game_class_id').unsigned();
      table
        .foreign('game_class_id')
        .references('id')
        .inTable('game_classes')
        .onDelete('SET NULL');
    })
    .createTable('decks', (table) => {
      table.increments();
      table.integer('user_id').unsigned();
      table.string('name');
      table
        .foreign('user_id')
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');
      table.integer('monkey_id').unsigned();
      table.foreign('monkey_id').references('id').inTable('monkeys');
      table.timestamps(true, true);
    })
    .createTable('users_monkeys', (table) => {
      table.increments();
      table.integer('user_id').unsigned();
      table
        .foreign('user_id')
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');
      table.integer('monkey_id').unsigned();
      table.foreign('monkey_id').references('id').inTable('monkeys');
    })
    .createTable('users_cards', (table) => {
      table.increments();
      table.integer('user_id').unsigned();
      table
        .foreign('user_id')
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');
      table.integer('card_id').unsigned();
      table
        .foreign('card_id')
        .references('id')
        .inTable('cards')
        .onDelete('CASCADE');
      table.integer('count').unsigned().defaultTo(1).notNullable();
    })
    .createTable('cards_decks', (table) => {
      table.increments();
      table.integer('card_id').unsigned();
      table
        .foreign('card_id')
        .references('id')
        .inTable('cards')
        .onDelete('CASCADE');
      table.integer('deck_id').unsigned();
      table
        .foreign('deck_id')
        .references('id')
        .inTable('decks')
        .onDelete('CASCADE');
      table.integer('count').unsigned().defaultTo(1).notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTableIfExists('users_cards')
    .dropTableIfExists('cards_decks')
    .dropTableIfExists('users_monkeys')
    .dropTableIfExists('cards')
    .dropTableIfExists('decks')
    .dropTableIfExists('monkeys')
    .dropTableIfExists('game_classes')
    .dropTableIfExists('users');
}
