import json
import os
import mysql.connector

def connect_to_database():
    # Read the JSON config file
    current_directory = os.path.dirname(os.path.abspath(__file__))
    config_file_path = os.path.join(current_directory, '..', 'db', 'config.json')
    with open(config_file_path, 'r') as file:
        config = json.load(file)

    try:
        conn = mysql.connector.connect(
            host=config["rds_host"],
            user=config["rds_username"],
            password=config["rds_password"],
            database=config["rds_db"]
        )
        print("Connected to the database.")

        # Create a cursor object
        cursor = conn.cursor()

        # Execute a sample query
        cursor.execute("SELECT VERSION();")
        db_version = cursor.fetchone()

    except mysql.connector.Error as e:
        print("Error connecting to MySQL:", e)
        return null, null

    return conn, cursor

def close_connection(conn, cursor):
    cursor.close()
    conn.close()
    print("Connection closed.")