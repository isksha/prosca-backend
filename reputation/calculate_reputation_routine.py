import sys

from db_connection import connect_to_database, close_connection
import db_querier as db
import ml_calculate_reputation as ml

conn, cursor = connect_to_database()

rows = db.get_old_reputations(cursor)

# if not rows:
#     print("No old reputations found.")
#     close_connection(conn, cursor)
#     sys.exit()

new_rows = ml.calculate_reputation(rows)
# if not new_rows:
#     print("No new reputations found.")
#     close_connection(conn, cursor)
#     sys.exit()
#
# db.nuke_old_reputations(cursor)
# db.store_new_reputations(cursor, new_rows)

close_connection(conn, cursor)