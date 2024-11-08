const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

// open database
let db = new sqlite3.Database('./database/PortaPet.db', async (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the PortaPet.db SQlite database.');
    console.log('Creating tables...');
    await createTables(db);
    console.log('Tables created successfully!');
    console.log('Closing database...');
    closeDatabase(db);
});

async function createTables(db) {
    const saltRounds = 10;
    const usersPassword = await bcrypt.hash('1234qwer', saltRounds);
    await db.exec(`
        create table user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name text not null,
            email text not null unique,
            password text not null,
            created_at datetime not null,
            updated_at datetime not null
        );

        insert into user (name, email, password, created_at, updated_at)
        values ('User 1', 'email@email.com', '${usersPassword}', DATE('now'), DATE('now')),
            ('User 2', 'email2@email.com', '${usersPassword}', DATE('now'), DATE('now'));
        
        create table pet (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id int not null,
            bluetooth_address text not null,
            name text not null,
            created_at datetime not null,
            updated_at datetime not null
        );     
        
        create table door (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id int not null,
            identification text not null,
            name text not null,
            created_at datetime not null,
            updated_at datetime not null
        ); 

        create table door_access (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pet_id int not null,
            door_id int not null,
            side int not null,
            start_at datetime not null,
            end_at datetime not null,
            created_at datetime not null,
            updated_at datetime not null
        ); 
        `, (err, row)  => {
            if (err) {
                return console.error(err.message);
            }
            return;
    });
}

function closeDatabase(db) {
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Close the database connection.');
    });
}