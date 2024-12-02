import os
from flask import Flask, request, jsonify, send_from_directory, session
from flask_bcrypt import Bcrypt
import mysql.connector
from datetime import datetime, timedelta, timezone


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
@app.route('/logout', methods=['POST'])
def logout():
    session.clear()  # Clear all session data
    return jsonify({"message": "Logged out successfully"}), 200

# Route to get all inventory items
@app.route('/Inventory', methods=['GET'])
def get_inventory():
    category = request.args.get('category')
    product_id = request.args.get('productId')  # Get the ProductID parameter
    state = request.args.get('state')  # Get the ProductID parameter

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Base query
    query = """
                SELECT Inventory.InventoryID, Inventory.ProductID, Inventory.MaxCapacity as maxqt, 
                    Inventory.AssignedLocation as location, Inventory.LocationState as state, 
                    Inventory.CurrentQuantity as quantity, Inventory.Threshold as thres,
                    Inventory.StockStatus as stat,
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

    if state:
        filters.append("Inventory.LocationState = %s")
        params.append(state)
    
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
    conn, cursor = None, None
    try:
        data = request.json
        adjustments = data.get('adjustments', [])

        if not adjustments:
            return jsonify({"error": "No adjustments provided"}), 400

        employee_id = session.get('employee_id')
        if not employee_id:
            return jsonify({"error": "Employee not logged in"}), 401

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        for adjustment in adjustments:
            inventory_id = adjustment.get('InventoryID')
            adjustment_value = adjustment.get('adjustment')

            if not inventory_id or adjustment_value is None:
                return jsonify({"error": f"Invalid data in adjustment: {adjustment}"}), 400

            cursor.execute("SELECT * FROM Inventory WHERE InventoryID = %s", (inventory_id,))
            inventory = cursor.fetchone()
            if not inventory:
                return jsonify({"error": f"Inventory ID {inventory_id} not found"}), 404

            new_quantity = inventory['CurrentQuantity'] + adjustment_value
            max_capacity = inventory.get('MaxCapacity')

            if new_quantity < 0 or (max_capacity is not None and new_quantity > max_capacity):
                return jsonify({"error": "Invalid quantity adjustment"}), 400

            cursor.execute("SELECT UnitPrice FROM Products WHERE ProductID = %s", (inventory['ProductID'],))
            product = cursor.fetchone()
            if not product or product.get('UnitPrice') is None:
                return jsonify({"error": "Product's UnitPrice not found"}), 404

            unit_price = product['UnitPrice']

            cursor.execute("UPDATE Inventory SET CurrentQuantity = %s WHERE InventoryID = %s",
                           (new_quantity, inventory_id))

            if adjustment_value > 0:
                cursor.execute("INSERT INTO Orders (EmployeeID, OrderDate) VALUES (%s, %s)",
                               (employee_id, datetime.now()))
                order_id = cursor.lastrowid

                cursor.execute(
                    "INSERT INTO OrderDetails (OrderID, ProductID, Quantity, TotalAmount, InventoryID) "
                    "VALUES (%s, %s, %s, %s, %s)",
                    (order_id, inventory['ProductID'], abs(adjustment_value),
                     unit_price * abs(adjustment_value), inventory_id)
                )

        conn.commit()
        return jsonify({"message": "Quantity updated successfully"}), 200

    except Exception as e:
        print(f"Error in update_quantity: {str(e)}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

# Get information from database for Order List
@app.route('/Orders', methods=['GET'])
def fetch_orders():
    try:
        category = request.args.get('category')
        order_id = request.args.get('orderId')
        state = request.args.get('state')

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

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
                        p.Category,
                        i.AssignedLocation,
                        i.LocationState,
                        s.SupplierName
                    FROM Orders o
                    LEFT JOIN OrderDetails od ON o.OrderID = od.OrderID
                    LEFT JOIN Products p ON od.ProductID = p.ProductID
                    LEFT JOIN ProductSuppliers ps ON p.ProductID = ps.ProductID
                    LEFT JOIN Suppliers s ON ps.SupplierID = s.SupplierID
                    LEFT JOIN Employees e ON o.EmployeeID = e.EmployeeID
                    LEFT JOIN Inventory i ON od.InventoryID = i.InventoryID
                """

        filters = []
        params = []
        
        if category:
            filters.append("p.Category = %s")
            params.append(category)
        
        if order_id:
            filters.append("o.OrderID = %s")
            params.append(order_id)

        if state:
            filters.append("i.LocationState = %s")
            params.append(state)
        
        if filters:
            query += " WHERE " + " AND ".join(filters)
        
        cursor.execute(query, params)
    
        results = cursor.fetchall()
        return jsonify(results), 200
    
    except Exception as e:
        return jsonify({"error": "Error fetching orders"}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/order-categories', methods=['GET'])
def fetch_orderCategories():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
                        """
                            SELECT DISTINCT p.Category
                            FROM Orders o
                            LEFT JOIN OrderDetails od ON o.OrderID = od.OrderID
                            LEFT JOIN Products p ON od.ProductID = p.ProductID
                            LEFT JOIN ProductSuppliers ps ON p.ProductID = ps.ProductID
                            LEFT JOIN Suppliers s ON ps.SupplierID = s.SupplierID
                            LEFT JOIN Employees e ON o.EmployeeID = e.EmployeeID
                            LEFT JOIN Inventory i ON od.InventoryID = i.InventoryID
                        """
        )
        results = cursor.fetchall()
        return jsonify(results), 200
    
    except Exception as e:
        return jsonify({"error": "Error fetching categories"}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/order-states', methods=['GET'])
def fetch_orderStates():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
                        """
                            SELECT DISTINCT i.LocationState
                            FROM Orders o
                            LEFT JOIN OrderDetails od ON o.OrderID = od.OrderID
                            LEFT JOIN Products p ON od.ProductID = p.ProductID
                            LEFT JOIN ProductSuppliers ps ON p.ProductID = ps.ProductID
                            LEFT JOIN Suppliers s ON ps.SupplierID = s.SupplierID
                            LEFT JOIN Employees e ON o.EmployeeID = e.EmployeeID
                            LEFT JOIN Inventory i ON od.InventoryID = i.InventoryID
                        """
        )
        results = cursor.fetchall()
        return jsonify(results), 200
    
    except Exception as e:
        return jsonify({"error": "Error fetching states"}), 500
    
    finally:
        cursor.close()
        conn.close()

# List all the categories in Products table
@app.route('/categories', methods=['GET'])
def fetch_categories():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT DISTINCT Category FROM Products")
        results = cursor.fetchall()
        return jsonify(results), 200
    
    except Exception as e:
        return jsonify({"error": "Error fetching categories"}), 500
    
    finally:
        cursor.close()
        conn.close()

# List all the categories in Products table
@app.route('/states', methods=['GET'])
def fetch_states():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT DISTINCT LocationState FROM Inventory")
        results = cursor.fetchall()
        return jsonify(results), 200
    
    except Exception as e:
        return jsonify({"error": "Error fetching states"}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/short-categories', methods=['GET'])
def fetch_shortCategories():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
                """
                    SELECT DISTINCT Category
                    FROM Inventory
                    JOIN Products ON Inventory.ProductID = Products.ProductID
                    WHERE Inventory.StockStatus = 'Low'
                """)
        results = cursor.fetchall()
        return jsonify(results), 200
    
    except Exception as e:
        return jsonify({"error": "Error fetching categories"}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/short-states', methods=['GET'])
def fetch_shortStates():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
                        """
                            SELECT DISTINCT LocationState
                            FROM Inventory
                            JOIN Products ON Inventory.ProductID = Products.ProductID
                            WHERE Inventory.StockStatus = 'Low'
                        """)
        results = cursor.fetchall()
        return jsonify(results), 200
    
    except Exception as e:
        return jsonify({"error": "Error fetching states"}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/update-stock-status', methods=['POST'])
def update_stock_status():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
                        """
                            UPDATE Inventory
                            SET StockStatus = CASE
                                WHEN (1 - (CurrentQuantity / MaxCapacity)) > Threshold THEN 'Low'
                                ELSE 'Enough'
                            END
                        """)
        conn.commit()
        return jsonify({'success': True}), 200

    except Exception as e:
        print(f"Error updating stock status: {e}")
        return jsonify({'error': str(e)}), 500

    finally:
        cursor.close()
        conn.close()

@app.route('/low-stock-list', methods=['GET'])
def get_low_stock():
    try:
        category = request.args.get('category')
        inventory_id = request.args.get('orderId')
        state = request.args.get('state')

        conn = get_db_connection()
        cursor = conn.cursor(dictionary = True)

        query = """
                    SELECT Inventory.InventoryID, Inventory.ProductID, Inventory.MaxCapacity as maxqt, 
                        Inventory.AssignedLocation as location, Inventory.LocationState as state, 
                        Inventory.CurrentQuantity as quantity, Inventory.Threshold as thres,
                        Inventory.StockStatus as stat,
                        Products.ProductName as name, Products.Category as category
                    FROM Inventory
                    JOIN Products ON Inventory.ProductID = Products.ProductID
                    WHERE Inventory.StockStatus = 'Low'
                """
        
        filters = []
        params = []
        
        if category:
            filters.append("Products.Category = %s")
            params.append(category)
        
        if inventory_id:
            filters.append("Inventory.InventoryID = %s")
            params.append(inventory_id)

        if state:
            filters.append("Inventory.LocationState = %s")
            params.append(state)
        
        if filters:
            query += " AND " + " AND ".join(filters)
        
        cursor.execute(query, params)
        results = cursor.fetchall()
        return jsonify(results)

    except Exception as e:
        print(f"Error updating stock status: {e}")
        return jsonify({'error': str(e)}), 500

    finally:
        cursor.close()
        conn.close()

@app.route('/revert-order', methods=['POST'])
def revert_order():
    try:
        data = request.json
        adjustments = data.get('adjustments', [])

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        for adjustment in adjustments:
            inventory_id = adjustment.get('InventoryID')
            order_id = adjustment.get('OrderID')

            # Fetch Quantity from OrderDetails
            cursor.execute("SELECT Quantity FROM OrderDetails WHERE OrderID = %s", (order_id,))
            order = cursor.fetchone()

            quantity = order['Quantity']

            # Update Inventory
            cursor.execute(
                "UPDATE Inventory SET CurrentQuantity = GREATEST(0, CurrentQuantity - %s) WHERE InventoryID = %s",
                (quantity, inventory_id)
            )

            # Delete OrderDetails and Orders
            cursor.execute("DELETE FROM OrderDetails WHERE OrderID = %s", (order_id,))
            cursor.execute("DELETE FROM Orders WHERE OrderID = %s", (order_id,))

        conn.commit()
        return jsonify({"message": "Orders reverted and inventory updated successfully"}), 200

    except Exception as e:
        print(f"Error in revert_order: {str(e)}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

@app.route('/batch-order-details', methods=['POST'])
def get_batch_order_details():
    try:
        data = request.json
        order_ids = data.get('OrderIDs', [])

        if not order_ids:
            return jsonify({"error": "No OrderIDs provided"}), 400

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT OrderID, OrderDate FROM Orders WHERE OrderID IN (%s)" % ','.join(['%s'] * len(order_ids)),
            order_ids
        )
        orders = cursor.fetchall()

        return jsonify({"orders": orders}), 200
    except Exception as e:
        print(f"Error in get_batch_order_details: {str(e)}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000)