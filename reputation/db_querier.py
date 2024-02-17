import mysql.connector


def get_old_reputations(cursor):
    try:
        select_query = """
        SELECT * FROM Pods
        """
        cursor.execute(select_query)
        rows = cursor.fetchall()

        print(_get_peer_reviews(cursor, '4605edcc-98e6-4548-8ea6-05cce6aeb619'))
        print(_get_num_pods_created(cursor, 'aa744c5b-1e7b-4fb2-8d90-0e3a8c0c4b94'))
        print(_get_num_friends(cursor, '9bf6574c-6e97-4f05-b0b2-0c06b485b733'))
        print(_get_age_of_oldest_pod(cursor, '9bf6574c-6e97-4f05-b0b2-0c06b485b733'))
        return rows
    except:
        print("Error getting old reputations.")
        return []


def store_new_reputations(cursor, new_rows):
    try:
        # Execute an insert query
        insert_query = """
        INSERT INTO TESTING_TABLE (pod_id, reputation) VALUES (%s, %s)
        """  # TODO: Change this to the actual table name
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
        """  # TODO: Change this to the actual table name
        cursor.execute(delete_query)
        print("Old reputations nuked.")
    except mysql.connector.Error as e:
        print("Error nuking old reputations:", e)
        return


def _get_peer_reviews(cursor, user_id):
    try:
        select_query = f"""
        SELECT peer_score_positive, peer_score_negative FROM User_Reputations WHERE user_id = '{user_id}'
        """
        cursor.execute(select_query)
        rows = cursor.fetchall()

        return { 'peer_score_positive': rows[0][0], 'peer_score_negative': rows[0][1] }
    except:
        print("Error getting peer reviews.")
        return {}

def _get_num_pods_created(cursor, user_id):
    try:
        select_query = f"""
        SELECT COUNT(*) FROM Pods WHERE creator_id = '{user_id}'
        """
        cursor.execute(select_query)
        rows = cursor.fetchall()

        return { 'num_pods_created': rows[0][0] }
    except:
        print("Error getting number of pods created.")
        return { 'num_pods_created': 0 }

def _get_num_friends(cursor, user_id):
    try:
        select_query = f"""
        SELECT COUNT(*) FROM User_Friendships WHERE user_id = '{user_id}'
        """
        cursor.execute(select_query)
        rows = cursor.fetchall()

        return { 'num_friends': rows[0][0] }
    except:
        print("Error getting number of friends.")
        return { 'num_friends': 0 }

def _get_age_of_oldest_pod(cursor, user_id):
    try:
        select_query = f"""
        SELECT TIMESTAMPDIFF(MONTH, MIN(creation_date), NOW()), pod_id 
        FROM Pods 
        WHERE pod_id IN (SELECT pod_id FROM User_Pods WHERE user_id = '{user_id}') 
        """
        cursor.execute(select_query)
        rows = cursor.fetchall()

        return { 'age_of_oldest_pod': rows[0][0] }
    except Exception as e:
        print(e)
        print("Error getting age of oldest pod.")
        return { 'age_of_oldest_pod': 0 }

