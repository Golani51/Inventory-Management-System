#
#   FILE: app.py
#   ORIGINAL AUTHOR: Joshua Hur
#   LATEST CHANGE BY: Date: Joshua Hur 12/4/24
#

import os
from flask import Flask, request, jsonify, send_from_directory, send_file, session
from flask_bcrypt import Bcrypt
import mysql.connector
from datetime import datetime
import pytz


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

# Log to audit file
def log_action(action, status):
    logFile = open("log.txt","a")
    currentDate = datetime.now(pytz.utc)
    est_timezone = pytz.timezone('US/Eastern')
    currentDate_EST = currentDate.astimezone(est_timezone)

    employee_id = session.get('employee_id')
    if not employee_id:
        logFile.write(f"{currentDate_EST}: {status} {action}\n")
    else:
        logFile.write(f"{currentDate_EST}: {session['username']} {status} {action}\n")
    logFile.close()

#Send audit log out
@app.route('/log', methods=['GET'])
def download_log():
    return send_file('log.txt', as_attachment=True)

#Reset audit log file
@app.route('/logReset', methods=['POST'])
def reset_log():
    log_file_path = "/app/log.txt"
    print(f"Checking for file at: {log_file_path}")
    if os.path.exists(log_file_path):
        os.remove(log_file_path)
    with open(log_file_path, "a") as logFile:
        currentDate = datetime.now(pytz.utc)
        est_timezone = pytz.timezone('US/Eastern')
        currentDate_EST = currentDate.astimezone(est_timezone)

        logFile.write(f"{currentDate_EST}: Log file was reset\n")
    return "Log file reset successfully", 200

@app.route('/log-action-helper', methods=['POST'])
def log_action_helper():
    try:
        data = request.json
        message = data.get('message')
        status = data.get('status')

        if not message or not status:
            return jsonify({"error": "Both 'message' and 'status' are required."}), 400

        log_action(message, status)
        return jsonify({"message": "Action logged successfully."}), 200

    except Exception as e:
        return jsonify({"error": f"Failed to log action: {str(e)}"}), 500


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

            action = "Employee #" + str(session['employee_id']) + ": " + str(session['firstname']) + " " + str(session['lastname']) + " has logged in"
            log_action(action, 'SUCCESS')
            return jsonify({"username": session['username'], "role": session['role'], "firstname": session['firstname'], "lastname": session['lastname']}), 200
        
        else:
            log_action(action, 'FAILURE')
            return jsonify({"error": "Invalid credentials"}), 401
        
    except Exception as e:
        return jsonify({"error": "Internal Server Error"}), 500

# Logout
@app.route('/logout', methods=['POST'])
def logout():
    action = "Employee #" + str(session['employee_id']) + ": " + str(session['firstname']) + " " + str(session['lastname']) + " has logged out"
    log_action(action, 'SUCCESS')
    session.clear()  # Clear all session data
    return jsonify({"message": "Logged out successfully"}), 200

# Route to get all inventory items
@app.route('/Inventory', methods=['GET'])
def get_inventory():
    category = request.args.get('category')
    product_id = request.args.get('productId')
    state = request.args.get('state')

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
                currentDate = datetime.now(pytz.utc)
                est_timezone = pytz.timezone('US/Eastern')
                currentDate_EST = currentDate.astimezone(est_timezone)
                formatted_date = currentDate_EST.isoformat()

                cursor.execute("INSERT INTO Orders (EmployeeID, OrderDate) VALUES (%s, %s)",
                               (employee_id, formatted_date))
                order_id = cursor.lastrowid

                cursor.execute(
                    "INSERT INTO OrderDetails (OrderID, ProductID, Quantity, TotalAmount, InventoryID) "
                    "VALUES (%s, %s, %s, %s, %s)",
                    (order_id, inventory['ProductID'], abs(adjustment_value),
                     unit_price * abs(adjustment_value), inventory_id)
                )

                action = "Updated inventory item #" + str(inventory_id) + " by " + str(adjustment_value)
                log_action(action, 'SUCCESS')

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
        inventory_id = request.args.get('inventoryId')
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

            action = "Order #" + str(order_id) + " was reverted by Employee #" + str(session['employee_id'])
            log_action(action, 'SUCCESS')

        conn.commit()
        return jsonify({"message": "Orders reverted and inventory updated successfully"}), 200

    except Exception as e:
        action = "Employee #" + str(session['employee_id']) + ": " + "Order #" + str(order_id) + " failed to be reverted"
        log_action(action, 'FAILURE')
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

# Endpoint to fetch order data for Google Chart
@app.route('/chart-data', methods=['GET'])
def fetch_chart_data():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Query to get aggregated order data
        query = """
            SELECT 
                e.FirstName, 
                e.LastName, 
                p.ProductName, 
                SUM(od.Quantity) AS TotalQuantity
            FROM Orders o
            LEFT JOIN OrderDetails od ON o.OrderID = od.OrderID
            LEFT JOIN Products p ON od.ProductID = p.ProductID
            LEFT JOIN Employees e ON o.EmployeeID = e.EmployeeID
            GROUP BY e.EmployeeID, p.ProductName
            ORDER BY e.FirstName, e.LastName, p.ProductName;
        """
        cursor.execute(query)
        results = cursor.fetchall()

        # Transform data for Google Charts (as a list of lists)
        chart_data = [["Employee", "Product", "Total Quantity"]]
        for row in results:
            chart_data.append([
                f"{row['FirstName']} {row['LastName']}", 
                row['ProductName'], 
                row['TotalQuantity']
            ])

        return jsonify(chart_data), 200

    except Exception as e:
        print("Error fetching chart data:", e)
        return jsonify({"error": "Error fetching chart data"}), 500

    finally:
        conn.close()

# pie chart function
@app.route('/chart-data-pie', methods=['GET'])
def fetch_pie_chart_data():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Query to calculate total ordered quantity for each product
        query = """
            SELECT 
                p.ProductName AS product,
                SUM(od.Quantity) AS total_quantity
            FROM OrderDetails od
            LEFT JOIN Products p ON od.ProductID = p.ProductID
            GROUP BY p.ProductName
            ORDER BY total_quantity DESC;
        """
        cursor.execute(query)
        results = cursor.fetchall()

        # Transform the data into a format suitable for Google Charts
        chart_data = [["Product", "Total Quantity"]]
        for row in results:
            chart_data.append([row['product'], float(row['total_quantity'])])

        return jsonify(chart_data), 200

    except Exception as e:
        print("Error fetching pie chart data:", e)
        return jsonify({"error": "Error fetching pie chart data"}), 500

    finally:
        conn.close()

# trend line graph function
@app.route('/chart-data-monthly-orders', methods=['GET'])
def fetch_monthly_order_data():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Query to calculate total orders per month
        query = """
            SELECT 
                DATE_FORMAT(OrderDate, '%Y-%m') AS month,
                COUNT(OrderID) AS total_orders
            FROM Orders
            WHERE OrderDate >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(OrderDate, '%Y-%m')
            ORDER BY DATE_FORMAT(OrderDate, '%Y-%m');
        """
        cursor.execute(query)
        results = cursor.fetchall()

        # Transform the data into a format suitable for Google Charts
        chart_data = [["Month", "Total Orders"]]
        for row in results:
            chart_data.append([row['month'], row['total_orders']])

        return jsonify(chart_data), 200

    except Exception as e:
        print("Error fetching monthly order data:", e)
        return jsonify({"error": "Error fetching monthly order data"}), 500

    finally:
        conn.close()


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000)