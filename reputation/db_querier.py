def query_db(cursor):
    # Execute a select query
    select_query = """
    SELECT * FROM Pods
    """
    cursor.execute(select_query)
    rows = cursor.fetchall()

    return rows