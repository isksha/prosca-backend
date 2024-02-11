import mysql.connector

def get_old_reputations(cursor):
    try:
        select_query = """
        SELECT * FROM Pods
        """
        cursor.execute(select_query)
        rows = cursor.fetchall()

        return rows
    except:
        print("Error getting old reputations.")
        return []

def store_new_reputations(cursor, new_rows):
    try:
        # Execute an insert query
        insert_query = """
        INSERT INTO TESTING_TABLE (pod_id, reputation) VALUES (%s, %s)
        """ # TODO: Change this to the actual table name
        cursor.executemany(insert_query, new_rows)
        print("New reputations stored.")
    except mysql.connector.Error as e:
        print("Error storing new reputations:", e)
        return

def nuke_old_reputations(cursor):
    try:
        # Execute a delete query
        delete_query = """
        DELETE FROM TESTING_TABLE
        """ # TODO: Change this to the actual table name
        cursor.execute(delete_query)
        print("Old reputations nuked.")
    except mysql.connector.Error as e:
        print("Error nuking old reputations:", e)
        return