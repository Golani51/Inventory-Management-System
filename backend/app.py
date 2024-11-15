import os
from flask import Flask, request, jsonify, send_from_directory, session
from flask_bcrypt import Bcrypt
import mysql.connector
from datetime import datetime


app = Flask(__name__, static_folder='frontend') # Configure html and css file
bcrypt = Bcrypt(app) # To match encrypted password with stored hash password
app.secret_key = os.environ.get('SECRET_KEY', 'default_secret_key') # Need for session

# Serve the index.html file at the root URL
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

# Create a database connection
def get_db_connection():
    return mysql.connector.connect(
        host=os.environ.get('MYSQL_HOST', 'localhost'),
        user=os.environ.get('MYSQL_USER', 'user'),
        password=os.environ.get('MYSQL_PASSWORD', 'userpassword'),
        database=os.environ.get('MYSQL_DB', 'inventorydb')
    )

# Check session status
@app.route('/check-session')
def check_session():
    if 'employee_id' in session:
        return jsonify({"username": session['username'], "role": session['role']}), 200
    
    else:
        return jsonify({"error": "Not logged in"}), 401
    
# Login
# Check username and password
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data['username']
    password = data['password']
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary = True)
        cursor.execute('SELECT * FROM Employees WHERE username = %s', (username,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if user and bcrypt.check_password_hash(user['Password_hash'], password):
            session['employee_id'] = user['EmployeeID']
            session['role'] = user['Role']
            session['username'] = user['Username']
            return jsonify({"username": user['Username'], "role": user['Role']}), 200
        
        else:
            return jsonify({"error": "Invalid credentials"}), 401
        
    except Exception as e:
        print("Login error:", e) 
        return jsonify({"error": "Internal Server Error"}), 500

# Logout
@app.route('/logout')
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"}), 200

# Route to get all inventory items
@app.route('/Inventory', methods=['GET'])
def get_inventory():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary = True)
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

    # Only allow admin can submit an order
    if not session['employee_id']:
        return {'error': 'Login required'}, 401
    
    if session['role'] != 'admin':
        return {'error': 'Unauthorized'}, 403

    data = request.json
    product_id = data['product_id']
    quantity = data['quantity']
    created_by = session['employee_id']

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Insert into Orders table
        cursor.execute("INSERT INTO Orders (OrderDate, EmployeeID) VALUES (%s, %s)", (datetime.now(), created_by))
        order_id = cursor.lastrowid

        # Insert into OrderDetails table
        cursor.execute(
            "INSERT INTO OrderDetails (OrderID, ProductID, Quantity) VALUES (%s, %s, %s)",
            (order_id, product_id, quantity)
        )

        conn.commit()
        cursor.close()
        conn.close()
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