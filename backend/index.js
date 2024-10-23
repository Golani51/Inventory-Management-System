const express = require('express');
const mysql = require('mysql2')
const path = require('path')
const app = express();
const port = 4000;

// MySQL connection pool setup
const db = mysql.createPool({
    connectionLimit: 10,  // Limit the number of simultaneous connections
    host: 'db',
    user: 'user',
    password: 'userpassword',
    database: 'inventorydb',
    port: '3306'  // MySQL should use port 3306
});

// Parse JSON
app.use(express.json());

// Serve static files from the "frontend" folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Route to get all inventory items
app.get('/Inventory', (req, res) => {
    const query = `
    SELECT Inventory.InventoryID, Inventory.ProductID, Inventory.MaxCapacity as maxqt, Inventory.AssignedLocation as location, 
    Inventory.LocationState as state, Inventory.CurrentQuantity as quantity, Products.ProductName as name
    FROM Inventory
    JOIN Products ON Inventory.ProductID = Products.ProductID;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error retrieving inventory:', err);  // Log the error
            res.status(500).send('Error retrieving inventory');  // Send a simple error response
            return;
        }
        res.json(results);
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
