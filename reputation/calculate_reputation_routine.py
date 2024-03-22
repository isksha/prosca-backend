from db_connection import connect_to_database, close_connection
import db_querier as db
import ml_calculate_reputation as ml

conn, cursor = connect_to_database()

users_df = db.get_old_reputations(cursor)
reputations_df = ml.calculate_reputation(users_df)
db.store_new_reputations(conn, cursor, reputations_df)

close_connection(conn, cursor)