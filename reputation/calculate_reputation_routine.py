import sys

from db_connection import connect_to_database, close_connection
import db_querier as db
from ml_calculate_reputation import calculate_reputation

conn, cursor = connect_to_database()

# rows = db.get_old_reputations(cursor)
# print(rows)
#
# if not rows:
#     print("No old reputations found.")
#     close_connection(conn, cursor)
#     sys.exit()
#
# new_rows = calculate_reputation(rows)
# if not new_rows:
#     print("No new reputations found.")
#     close_connection(conn, cursor)
#     sys.exit()
#
# db.nuke_old_reputations(cursor)
# db.store_new_reputations(cursor, new_rows)

close_connection(conn, cursor)