with open('migration_data_mysql_rolescan.sql', 'r') as f:
    sql = f.read()
sql = sql.replace('INSERT INTO', 'INSERT IGNORE INTO')
with open('migration_data_mysql_rolescan_ignore.sql', 'w') as f:
    f.write(sql)
print('All INSERT statements changed to INSERT IGNORE. Output: migration_data_mysql_rolescan_ignore.sql')
