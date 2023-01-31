const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000
const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'postgres',
  database: 'postgresdb',
  password: 'demo123',
  port: 5432,
})

// #####################

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

// Serve static HTML/CSS content from public folder
app.use(express.static('public'));

// Will be replaced by public/index.html 
app.get('/', (request, response) => {
    response.status(200).json('Move along, nothing to see here...')
})

app.get('/test', (request, response) => {
    response.status(200).json('Just a test')
})

// Simulate ransomware attack
app.get('/attack', async (request, response) => {
    const results = await query('SELECT * FROM wl_comment', []);
    //console.log(results);
    //console.log(results.length)

    // Iterate over resuls
    for (i = 0; i < results.length; i++) {     
        // Update comment nickname fields in DB, obfuscate/'encrypt' characters by rotation in Unicode alphabet.
        // Rotating by a ranodm number as we don't want to decrypt anyway --> guarantees same input won't deliver same output
        await query('UPDATE wl_comment SET comment = $1, nick = $2 WHERE id = $3', [rotationCipher(results[i].comment, Math.floor(Math.random() * 1000) + 20), rotationCipher(results[i].nick, Math.floor(Math.random() * 1000) + 20), results[i].id]);
    
    }
    // HTTP return
    response.status(200).json('Y0U H4V3 B33N H4CK3D!!!')
})

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})


// #####################

// based on https://medium.com/@TimSeverien/substitution-cipher-in-javascript-d530eb2d923d
function rotationCipher(text, rotation) {
    // Surrogate pair limit
    var bound = 0x10000;

    // Force the rotation an integer and within bounds, just to be safe
    rotation = parseInt(rotation) % bound;

    // Might as well return the text if there's no change
    if(rotation === 0) return text;

    // Create string from character codes
    return String.fromCharCode.apply(null,
        // Turn string to character codes
        text.split('').map(function(v) {
            // Return current character code + rotation
            return (v.charCodeAt() + rotation + bound) % bound;
        })
    );
};



async function query(query, params) {
    const {rows, fields} = await pool.query(query, params);
    return rows;
}

