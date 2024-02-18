import mysql.connector
import pandas as pd

def get_old_reputations(cursor):
    try:
        select_query = """
        SELECT user_id FROM Users
        """
        cursor.execute(select_query)
        users = cursor.fetchall()

        all_users = []

        for user in users:
            one_user = []
            user_id = user[0]
            peer_reviews = _get_peer_reviews(cursor, user_id)
            num_pods_created = _get_num_pods_created(cursor, user_id)
            num_friends = _get_num_friends(cursor, user_id)
            account_age = _get_account_age(cursor, user_id)
            num_pods_joined = _get_num_pods_joined(cursor, user_id)
            cumulative_pod_deposit_sum = _get_cumulative_pod_deposit_sum(cursor, user_id)
            network_size = _get_network_size(cursor, user_id)

            one_user.append(user_id)
            one_user.append(cumulative_pod_deposit_sum['cumulative_pod_deposit_amt'])
            one_user.append(num_pods_joined['cumulative_num_pods'])
            one_user.append(account_age['age_of_account'])
            one_user.append(num_friends['num_friends'])
            one_user.append(num_pods_created['num_pods_created'])
            one_user.append(network_size['network_size'])
            one_user.append(peer_reviews['num_peer_review_positive'])
            one_user.append(peer_reviews['num_peer_review_negative'])

            all_users.append(one_user[:])

        users_df = pd.DataFrame(all_users, columns=['user_id', 'cumulative_pod_deposit_amt', 'cumulative_num_pods',
                                                    'age_of_account', 'num_friends', 'num_pods_created',
                                                    'network_size', 'num_peer_review_positive',
                                                    'num_peer_review_negative'])
        return users_df
    except:
        print("Error getting old reputations.")
        return pd.DataFrame()

def store_new_reputations(conn, cursor, users_df):
    try:
        new_rows = [tuple(data) for data in users_df.values]
        update_query = """
        UPDATE Users SET score = %s WHERE user_id = %s
        """
        cursor.executemany(update_query, new_rows)
        conn.commit()
        print("New reputations stored.")
    except mysql.connector.Error as e:
        print("Error storing new reputations:", e)
        return

def _get_peer_reviews(cursor, user_id):
    try:
        select_query = f"""
        SELECT peer_score_positive, peer_score_negative FROM User_Reputations WHERE user_id = '{user_id}'
        """
        cursor.execute(select_query)
        rows = cursor.fetchall()

        return { 'num_peer_review_positive': rows[0][0], 'num_peer_review_negative': rows[0][1] }
    except:
        print("Error getting peer reviews.")
        return { 'num_peer_review_positive': 0, 'num_peer_review_negative': 0 }

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

def _get_account_age(cursor, user_id):
    try:
        select_query = f"""
        SELECT TIMESTAMPDIFF(MONTH, MIN(creation_date), NOW()), pod_id 
        FROM Pods 
        WHERE pod_id IN (SELECT pod_id FROM User_Pods WHERE user_id = '{user_id}') 
        """
        cursor.execute(select_query)
        rows = cursor.fetchall()

        return { 'age_of_account': 0 if not rows[0][0] else rows[0][0] }
    except Exception as e:
        print(e)
        print("Error getting age of oldest pod.")
        return { 'age_of_account': 0 }

def _get_num_pods_joined(cursor, user_id):
    try:
        select_query = f"""
        SELECT COUNT(*) FROM User_Pods WHERE user_id = '{user_id}'
        """
        cursor.execute(select_query)
        rows = cursor.fetchall()

        return { 'cumulative_num_pods': rows[0][0] }
    except:
        print("Error getting number of pods joined.")
        return { 'cumulative_num_pods': 0 }

def _get_cumulative_pod_deposit_sum(cursor, user_id):
    try:
        select_query = f"""
        SELECT SUM(amount) FROM Pod_Deposits WHERE user_id = '{user_id}'
        """
        cursor.execute(select_query)
        rows = cursor.fetchall()

        return { 'cumulative_pod_deposit_amt': 0 if not rows[0][0] else rows[0][0] }
    except:
        print("Error getting cumulative pod deposit sum.")
        return { 'cumulative_pod_deposit_amt': 0 }

def _get_network_size(cursor, user_id):
    try:
        select_query = f"""
        SELECT COUNT(DISTINCT user_id) 
        FROM User_Pods 
        WHERE (pod_id IN (SELECT pod_id FROM User_Pods WHERE user_id = '{user_id}') AND user_id != '{user_id}')
        """
        cursor.execute(select_query)
        rows = cursor.fetchall()

        return { 'network_size': rows[0][0] }
    except:
        print("Error getting network size.")
        return { 'network_size': 0 }