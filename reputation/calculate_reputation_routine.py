from db_connection import connect_to_database, close_connection
from db_querier import query_db

conn, cursor = connect_to_database()

rows = query_db(cursor)

close_connection(conn, cursor)