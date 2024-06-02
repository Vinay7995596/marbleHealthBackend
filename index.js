const express = require('express')
const app = express()
const port = 5000
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const cors = require('cors')

const dbPath = path.join(__dirname, "index.db")

let db = null

app.use(express.json())
app.use(cors())

const intialisedatabase = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver : sqlite3.Database,
        });

        await db.exec(`
        CREATE TABLE IF NOT EXISTS userDetails (email VARCHAR(200) PRIMARY KEY, name VARCHAR(200), DateOfBirth DATE, contact INT, userDescreption VARCHAR(2000));
        `)
        app.listen(port, () => {
            console.log('server running on 5000')
        })
    }
    catch (e) {
        console.log(e, ":error in connection")
    }
};

intialisedatabase()

app.post('/adduser', async (request, response) => {
    try {
        const {email, name, DateOfBirth, contact, userDescreption} = request.body;
        const insertingQuery = `
    INSERT INTO userDetails (email, name, DateOfBirth, contact, userDescreption) values(?, ?, ?, ?, ?);
    `;
        await db.run(insertingQuery, [email, name, DateOfBirth, contact, userDescreption]);
        response.status(200)
        response.send('inserting successfully')
    }
    catch (e) {
        console.log(e,": error in inserting")
    }

})

app.get('/allusers', async (request, response) => {
    try {
        const selectedQuery = `
        SELECT * FROM userDetails;
        `;
        const userData = await db.all(selectedQuery)
        response.status(200).json(userData)

    } catch (e) {
        console.log(e,":selected query will choosen")
    }
})

app.delete('/deleted/:email', async (request, response) => {
    try {
        const email = request.params.email;
        const deletedQuery = `DELETE FROM userDetails WHERE email = '${email}';`;
        await db.run(deletedQuery)
        response.status(200).send('deleted succesfully')
        console.log('deleted success')
    } catch (e) {
        console.log(e,":error in backendpart of deleting")
    }
})

app.put('/formupdate', async (request, response) => {
    try {
        const { email, name, contact, DateOfBirth, userDescreption } = request.body;
        const updateQuery = `
        UPDATE userDetails SET 
            name = ?, 
            contact = ?, 
            DateOfBirth = ?, 
            userDescreption = ? 
        WHERE email = ?;
        `;
        await db.run(updateQuery, [name, contact, DateOfBirth, userDescreption, email]);
        response.status(200).send('Update successfully');
    } catch (e) {
        console.log(e, ":error in updating form");
        response.status(500).send('Error updating user');
    }
});
