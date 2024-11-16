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
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT Inventory.InventoryID, Inventory.ProductID, Inventory.MaxCapacity as maxqt, 
               Inventory.AssignedLocation as location, Inventory.LocationState as state, 
               Inventory.CurrentQuantity as quantity, Inventory.Threshold as thres,
               Products.ProductName as name
        FROM Inventory
        JOIN Products ON Inventory.ProductID = Products.ProductID;
    """)
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(results)

@app.route('/update-quantity', methods=['POST'])
def update_quantity():
    data = request.json
    inventory_id = data.get('InventoryID')
    adjustment = data.get('adjustment')

    if not inventory_id or adjustment is None:
        return jsonify({'error': 'Invalid input'}), 400

    try:
        query = """
        UPDATE Inventory
        SET CurrentQuantity = GREATEST(CurrentQuantity + %s, 0)
        WHERE InventoryID = %s;
        """
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query, (adjustment, inventory_id))
        conn.commit()

        return jsonify({'message': 'Quantity updated successfully'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000)