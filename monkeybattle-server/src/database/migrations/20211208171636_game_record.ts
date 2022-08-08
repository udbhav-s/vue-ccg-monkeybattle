import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('game_records', (table) => {
    table.increments();
    table.integer('winner_id').unsigned();
    table
      .foreign('winner_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.integer('loser_id').unsigned();
    table
      .foreign('loser_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.integer('winning_xp').unsigned().defaultTo(0);
    table.integer('losing_xp').unsigned().defaultTo(0);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('game_records');
}
