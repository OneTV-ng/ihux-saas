import re

with open('migration_data_mysql_clean.sql', 'r') as f:
    sql = f.read()

# Replace 't' with 1 and 'f' with 0 in VALUES (only for booleans)
sql = re.sub(r"'t'", "1", sql)
sql = re.sub(r"'f'", "0", sql)

with open('migration_data_mysql_fixed.sql', 'w') as f:
    f.write(sql)

print('Boolean values fixed. Output: migration_data_mysql_fixed.sql')
