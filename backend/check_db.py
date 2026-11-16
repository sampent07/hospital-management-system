import sqlite3

for p in ['D:/DoAn_TN/hospital-management-system/hospital.db', 'D:/DoAn_TN/hospital-management-system/backend/hospital.db']:
    print('Checking:', p)
    conn = sqlite3.connect(p)
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(appointments);")
    cols = [row[1] for row in cursor.fetchall()]
    print('appointments cols:', cols)
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='doctor_schedules';")
    print('doctor_schedules exists:', cursor.fetchall())
    conn.close()