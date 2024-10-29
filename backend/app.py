import os
from flask import Flask, request, jsonify, send_from_directory
import mysql.connector
from datetime import datetime

app = Flask(__name__)

# Serve the index.html file at the root URL
@app.route('/')
def serve_index():
    return send_from_directory('frontend', 'index.html')

# Create a database connection
def get_db_connection():
    return mysql.connector.connect(
        host=os.environ.get('MYSQL_HOST', 'localhost'),
        user=os.environ.get('MYSQL_USER', 'user'),
        password=os.environ.get('MYSQL_PASSWORD', 'userpassword'),
        database=os.environ.get('MYSQL_DB', 'inventorydb')
    )

# Route to get all inventory items
@app.route('/Inventory', methods=['GET'])
def get_inventory():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("""
        SELECT Inventory.InventoryID, Inventory.ProductID, Inventory.MaxCapacity as maxqt, 
               Inventory.AssignedLocation as location, Inventory.LocationState as state, 
               Inventory.CurrentQuantity as quantity, Products.ProductName as name
        FROM Inventory
        JOIN Products ON Inventory.ProductID = Products.ProductID;
    """)
    results = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(results)

# Create a new order
@app.route('/Orders', methods=['POST'])
def create_order():
    data = request.json
    product_id = data.get('product_id')
    quantity = data.get('quantity')

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # Insert into Orders table
        cursor.execute("INSERT INTO Orders (OrderDate) VALUES (%s)", (datetime.now(),))
        order_id = cursor.lastrowid

        # Insert into OrderDetails table
        cursor.execute(
            "INSERT INTO OrderDetails (OrderID, ProductID, Quantity) VALUES (%s, %s, %s)",
            (order_id, product_id, quantity)
        )

        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({"message": "Order created successfully"}), 200
    
    except Exception as e:
        print("Error creating order:", e)
        return jsonify({"error": "Error creating order"}), 500

# Reset orders and order details and clear the inventory
@app.route('/reset-orders', methods=['DELETE'])
def reset_orders():
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # Update Inventory by reversing OrderDetails quantities
        cursor.execute("""
            UPDATE Inventory
            JOIN (
                SELECT ProductID, SUM(Quantity) AS totalQuantity
                FROM OrderDetails
                GROUP BY ProductID
            ) AS aggregatedOrders ON Inventory.ProductID = aggregatedOrders.ProductID
            SET Inventory.CurrentQuantity = Inventory.CurrentQuantity - aggregatedOrders.totalQuantity
        """)

        # Delete from OrderDetails, Orders, and AuditLogs
        cursor.execute("DELETE FROM AuditLogs")
        cursor.execute("DELETE FROM OrderDetails")
        cursor.execute("DELETE FROM Orders")

        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({"message": "Orders, OrderDetails, and AuditLogs reset successfully, and inventory quantities restored."}), 200
   
    except Exception as e:
        print("Error resetting orders:", e)
        return jsonify({"error": "Error resetting orders"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000)