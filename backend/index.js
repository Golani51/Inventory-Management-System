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

app.post('/Orders', async (req, res) => {
    const { product_id, quantity } = req.body;
    try {
        // Use promise-based query
        const orderResult = await db.promise().query('INSERT INTO Orders (OrderDate) VALUES (NOW())');
        const orderId = orderResult[0].insertId;

        // Insert into OrderDetails table
        await db.promise().query('INSERT INTO OrderDetails (OrderID, ProductID, Quantity) VALUES (?, ?, ?)', [orderId, product_id, quantity]);

        res.status(200).json({ message: 'Order created successfully' });
    } catch (error) {
        console.error('Error creating order:', error);  // Log the exact error
        res.status(500).json({ message: 'Error creating order' });
    }
});

app.delete('/reset-orders', async (req, res) => {
    try {
        // Begin transaction
        await db.promise().query('START TRANSACTION');

        // Reverse quantities in Inventory based on OrderDetails
        await db.promise().query(`
            UPDATE Inventory
            JOIN (
                SELECT ProductID, SUM(Quantity) AS totalQuantity
                FROM OrderDetails
                GROUP BY ProductID
            ) AS aggregatedOrders ON Inventory.ProductID = aggregatedOrders.ProductID

            SET Inventory.CurrentQuantity = Inventory.CurrentQuantity - aggregatedOrders.totalQuantity
        `);

        // Delete all records from OrderDetails and Orders
        await db.promise().query('DELETE FROM AuditLogs');
        await db.promise().query('DELETE FROM OrderDetails');
        await db.promise().query('DELETE FROM Orders');

        // Commit transaction
        await db.promise().query('COMMIT');

        res.status(200).json({ message: 'Orders, OrderDetails, and AuditLogs reset successfully, and inventory quantities restored.' });
    } catch (error) {
        console.error('Error resetting orders:', error);
        // Rollback transaction if there's an error
        await db.promise().query('ROLLBACK');
        res.status(500).json({ message: 'Error resetting orders' });
    }
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
