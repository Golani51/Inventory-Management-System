import os
from flask import Flask, request, jsonify, send_from_directory, session
from flask_bcrypt import Bcrypt
import mysql.connector
from datetime import datetime


app = Flask(__name__, static_folder='frontend', template_folder='frontend')
bcrypt = Bcrypt(app) # To match encrypted password with stored hash password
app.secret_key = os.environ.get('SECRET_KEY', 'default_secret_key') # Need for session

@app.route('/')
def serve_index():
    return send_from_directory('frontend', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('frontend', filename)

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
        return jsonify({"username": session['username'], "role": session['role'], "firstname": session['firstname'], "lastname": session['lastname']}), 200
    
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
            session['firstname'] = user['FirstName'] 
            session['lastname'] = user['LastName']

            return jsonify({"username": session['username'], "role": session['role'], "firstname": session['firstname'], "lastname": session['lastname']}), 200
        
        else:
            return jsonify({"error": "Invalid credentials"}), 401
        
    except Exception as e:
        return jsonify({"error": "Internal Server Error"}), 500

# Logout
@app.route('/logout')
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"}), 200

# Route to get all inventory items
@app.route('/Inventory', methods=['GET'])
def get_inventory():
    category = request.args.get('category')
    product_id = request.args.get('productId')  # Get the ProductID parameter
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Base query
    query = """
                SELECT Inventory.InventoryID, Inventory.ProductID, Inventory.MaxCapacity as maxqt, 
                    Inventory.AssignedLocation as location, Inventory.LocationState as state, 
                    Inventory.CurrentQuantity as quantity, Inventory.Threshold as thres,
                    Products.ProductName as name, Products.Category as category
                FROM Inventory
                JOIN Products ON Inventory.ProductID = Products.ProductID
            """
    
    filters = []
    params = []
    
    # Add category filter
    if category:
        filters.append("Products.Category = %s")
        params.append(category)
    
    # Add ProductID filter
    if product_id:
        filters.append("Products.ProductID = %s")
        params.append(product_id)
    
    # Append filters to the query
    if filters:
        query += " WHERE " + " AND ".join(filters)
    
    # Execute the query with parameters
    cursor.execute(query, params)
    
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(results)


# Handle quantity updates with input validations
@app.route('/update-quantity', methods=['POST'])
def update_quantity():
    data = request.get_json()
    inventory_id = data['InventoryID']
    adjustment = data['adjustment']
    employee_id = session['employee_id']
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Fetch inventory details
        cursor.execute("SELECT * FROM Inventory WHERE InventoryID = %s", (inventory_id,))
        inventory = cursor.fetchone()
        if not inventory:
            return jsonify({"error": "Inventory ID not found"}), 404

        new_quantity = inventory['CurrentQuantity'] + adjustment

        if new_quantity < 0 or (inventory['MaxCapacity'] is not None and new_quantity > inventory['MaxCapacity']):
            return jsonify({"error": "Invalid quantity adjustment"}), 400

        # Fetch UnitPrice from Products table
        cursor.execute("SELECT UnitPrice FROM Products WHERE ProductID = %s", (inventory['ProductID'],))
        product = cursor.fetchone()

        if not product or product['UnitPrice'] is None:
            return jsonify({"error": "Product's UnitPrice not found"}), 404

        unit_price = product['UnitPrice']

        # Update Inventory table
        cursor.execute(
            "UPDATE Inventory SET CurrentQuantity = %s WHERE InventoryID = %s",
            (new_quantity, inventory_id)
        )

        if (adjustment > 0):
            # Insert into Orders table
            cursor.execute(
                "INSERT INTO Orders (EmployeeID, OrderDate) VALUES (%s, %s)",
                (employee_id, datetime.now())
            )

            order_id = cursor.lastrowid

            # Insert into OrderDetails table
            cursor.execute(
                "INSERT INTO OrderDetails (OrderID, ProductID, Quantity, TotalAmount, InventoryID) "
                "VALUES (%s, %s, %s, %s, %s)",
                (
                    order_id,
                    inventory['ProductID'],
                    abs(adjustment),
                    unit_price * abs(adjustment),
                    inventory_id
                )
            )

        conn.commit()
        return jsonify({"message": "Quantity updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": "Quantity update was not successful"}), 500

    finally:
        cursor.close()
        conn.close()

# Get information from database for Order List
@app.route('/Orders', methods=['GET'])
def fetch_orders():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Query to join Orders, OrderDetails, and Products
        query = """
                    SELECT 
                        o.OrderID,
                        o.EmployeeID,
                        e.FirstName,
                        e.LastName,
                        o.OrderDate,
                        od.ProductID,
                        od.Quantity,
                        od.TotalAmount,
                        od.InventoryID,
                        p.UnitPrice,
                        p.ProductName,
                        i.AssignedLocation,
                        i.LocationState
                    FROM Orders o
                    LEFT JOIN OrderDetails od ON o.OrderID = od.OrderID
                    LEFT JOIN Products p ON od.ProductID = p.ProductID
                    LEFT JOIN Employees e ON o.EmployeeID = e.EmployeeID
                    LEFT JOIN Inventory i ON od.InventoryID = i.InventoryID;
                """
        
        cursor.execute(query)
        results = cursor.fetchall()
        return jsonify(results), 200
    
    except Exception as e:
        return jsonify({"error": "Error fetching orders"}), 500
    
    finally:
        conn.close()

# List all the categories in Products table
@app.route('/categories', methods=['GET'])
def fetch_categories():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT DISTINCT Category FROM Products;")
        results = cursor.fetchall()
        return jsonify(results), 200
    
    except Exception as e:
        return jsonify({"error": "Error fetching categories"}), 500
    
    finally:
        conn.close()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000)